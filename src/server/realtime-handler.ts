import { WebSocket } from "ws";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import { memoryEngine } from "@/lib/memory/engine";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { chatCompletionStream } from "@/lib/ai/client";
import { getTTSProvider } from "@/lib/tts";
import { logger } from "@/lib/observability/logging";
import { sessionManager } from "./session-manager";
import { TTS_CONFIG } from "./config";
import { createPayload, WS_EVENTS } from "@/lib/realtime/types";
import type { AIModulation } from "@/store/useStore";

interface AuthenticatedClient {
  ws: WebSocket;
  userId: string;
  sessionId: string;
  isAlive: boolean;
  connectedAt: number;
  currentAbortController?: AbortController;
}

const clients = new Map<string, AuthenticatedClient>();

export async function handleConnection(ws: WebSocket): Promise<void> {
  const clientId = crypto.randomUUID();

  ws.binaryType = "arraybuffer";

  ws.on("message", async (data: Buffer | ArrayBuffer | string) => {
    try {
      if (typeof data === "string") {
        const msg = JSON.parse(data);

        switch (msg.type) {
          case WS_EVENTS.AUTH: {
            const success = await handleAuth(ws, clientId, msg.payload);
            break;
          }

          case WS_EVENTS.LATENCY_PING:
            send(ws, createPayload(WS_EVENTS.LATENCY_PONG, {
              clientTime: msg.payload?.clientTime,
              serverTime: Date.now(),
            }));
            break;

          case WS_EVENTS.AUDIO_INPUT:
            handleAudioInput(clientId);
            break;

          case WS_EVENTS.TRANSCRIPT_FINAL: {
            const ctx = clients.get(clientId);
            if (ctx) {
              await handleTranscript(ctx, msg.payload);
            }
            break;
          }

          case WS_EVENTS.INTERRUPT: {
            const ctx = clients.get(clientId);
            if (ctx) {
              handleInterrupt(ctx);
            }
            break;
          }

          case WS_EVENTS.RECONNECT: {
            const ctx = clients.get(clientId);
            if (ctx) {
              send(ws, createPayload(WS_EVENTS.SESSION_STARTED, {
                sessionId: ctx.sessionId,
                userId: ctx.userId,
              }));
            }
            break;
          }

          case WS_EVENTS.SESSION_ENDED: {
            const ctx = clients.get(clientId);
            if (ctx) {
              await endCall(ctx);
            }
            break;
          }
        }
      }
    } catch (error) {
      logger.error("WS message handler error", {
        clientId,
        error: String(error),
      });
      send(ws, createPayload(WS_EVENTS.ERROR, { message: "Internal error" }));
    }
  });

  ws.on("close", async () => {
    const ctx = clients.get(clientId);
    if (ctx) {
      clients.delete(clientId);
      await sessionManager.endSession(ctx.sessionId);
      await sessionManager.generateCallSummary(ctx.sessionId, ctx.userId);
      logger.info("Client disconnected", { clientId, userId: ctx.userId });
    }
  });

  ws.on("pong", () => {
    const ctx = clients.get(clientId);
    if (ctx) {
      ctx.isAlive = true;
    }
  });

  ws.on("error", (error) => {
    logger.error("WS error", { clientId, error: String(error) });
    clients.delete(clientId);
  });

  send(ws, createPayload(WS_EVENTS.CONNECTION_STATE, {
    state: "connected",
    clientId,
  }));
}

async function handleAuth(
  ws: WebSocket,
  clientId: string,
  payload: any
): Promise<boolean> {
  try {
    const { userId } = payload || {};
    if (!userId) {
      send(ws, createPayload(WS_EVENTS.ERROR, { message: "Missing userId" }));
      return false;
    }

    const db = await getDb();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      send(ws, createPayload(WS_EVENTS.ERROR, { message: "User not found" }));
      return false;
    }

    const session = await sessionManager.createSession(userId);

    const ctx: AuthenticatedClient = {
      ws,
      userId,
      sessionId: session.id,
      isAlive: true,
      connectedAt: Date.now(),
    };

    clients.set(clientId, ctx);

    send(
      ws,
      createPayload(WS_EVENTS.AUTH_OK, {
        sessionId: session.id,
        userId,
      })
    );

    send(
      ws,
      createPayload(WS_EVENTS.SESSION_STARTED, {
        sessionId: session.id,
        userId,
        startedAt: session.startedAt,
      })
    );

    logger.info("Client authenticated", { clientId, userId, sessionId: session.id });
    return true;
  } catch (error) {
    logger.error("Auth error", { clientId, error: String(error) });
    send(ws, createPayload(WS_EVENTS.ERROR, { message: "Authentication failed" }));
    return false;
  }
}

function handleAudioInput(clientId: string): void {
  const ctx = clients.get(clientId);
  if (!ctx) return;

  sessionManager.logVoiceEvent(
    ctx.sessionId,
    ctx.userId,
    "audio.input",
    {}
  ).catch(() => {});
}

async function handleTranscript(
  ctx: AuthenticatedClient,
  payload: any
): Promise<void> {
  const { text } = payload || {};
  if (!text?.trim()) return;

  try {
    await sessionManager.logVoiceEvent(
      ctx.sessionId,
      ctx.userId,
      "transcript.final",
      { text }
    );

    const db = await getDb();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(ctx.userId) });

    if (!user) return;

    const [memoryContext, goalContext] = await Promise.all([
      memoryEngine.getContextForChat(ctx.userId, text),
      memoryEngine.getGoalContext(ctx.userId),
    ]);

    const systemPrompt = buildSystemPrompt({
      role: user.aiRole as string,
      modulation: user.aiModulation as AIModulation,
      language: user.language as any,
      diseaseFocus: user.diseaseFocus as any,
      customTopic: user.customTopic || undefined,
      coachingStyle: user.coachingStyle as any,
      memoryContext,
      goalContext,
    });

    const previousMessages = await db
      .collection("messages")
      .find({ sessionId: new ObjectId(ctx.sessionId) })
      .sort({ createdAt: 1 })
      .limit(20)
      .toArray();

    const conversationHistory = previousMessages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    ctx.currentAbortController = new AbortController();

    const stream = chatCompletionStream({
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory.map((m: any) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user", content: text },
      ],
      task: "fast_chat",
    });

    let fullContent = "";

    for await (const chunk of stream) {
      if (ctx.currentAbortController?.signal.aborted) break;
      fullContent += chunk;
      send(
        ctx.ws,
        createPayload(WS_EVENTS.AI_TOKEN, { token: chunk, done: false })
      );
    }

    if (ctx.currentAbortController?.signal.aborted) {
      logger.info("AI generation interrupted", {
        sessionId: ctx.sessionId,
      });
      return;
    }

    send(
      ctx.ws,
      createPayload(WS_EVENTS.AI_TOKENS_COMPLETE, {
        fullText: fullContent,
        done: true,
      })
    );

    await db.collection("messages").insertOne({
      sessionId: ctx.sessionId,
      userId: new ObjectId(ctx.userId),
      role: "user",
      content: text,
      createdAt: new Date(),
      tokenCount: Math.ceil(text.length / 4),
    });

    const aiMsgResult = await db.collection("messages").insertOne({
      sessionId: ctx.sessionId,
      userId: new ObjectId(ctx.userId),
      role: "assistant",
      content: fullContent,
      createdAt: new Date(),
      tokenCount: Math.ceil(fullContent.length / 4),
    });

    sessionManager.incrementMessageCount(ctx.sessionId);

    memoryEngine
      .processMessage(
        ctx.userId,
        ctx.sessionId,
        aiMsgResult.insertedId.toString(),
        text,
        fullContent
      )
      .catch((e: unknown) =>
        logger.error("Background memory processing failed", { error: String(e) })
      );

    const ttsProvider = await getTTSProvider();
    let ttsSequence = 0;

    if (ttsProvider.synthesizeStream) {
      const streamGenerator = ttsProvider.synthesizeStream(fullContent, {
        voice: TTS_CONFIG.voiceId,
      });

      for await (const chunk of streamGenerator) {
        if (ctx.currentAbortController?.signal.aborted) break;

        const audioBase64 = arrayBufferToBase64(chunk.audio);
        send(
          ctx.ws,
          createPayload(WS_EVENTS.TTS_CHUNK, {
            audio: audioBase64,
            format: chunk.format,
            sequence: ttsSequence++,
            isFinal: chunk.isFinal,
            duration: chunk.duration,
          })
        );

        if (chunk.isFinal) break;
      }
    }

    logger.info("Voice response complete", {
      sessionId: ctx.sessionId,
      duration: Date.now() - ctx.connectedAt,
    });
  } catch (error) {
    if ((error as Error).name === "AbortError") return;
    logger.error("Transcript handler error", {
      sessionId: ctx.sessionId,
      error: String(error),
    });
    send(
      ctx.ws,
      createPayload(WS_EVENTS.ERROR, { message: "Processing failed" })
    );
  }
}

function handleInterrupt(ctx: AuthenticatedClient): void {
  if (ctx.currentAbortController) {
    ctx.currentAbortController.abort();
    ctx.currentAbortController = undefined;
  }

  send(
    ctx.ws,
    createPayload(WS_EVENTS.INTERRUPT, {
      reason: "user_speech",
      timestamp: Date.now(),
    })
  );

  logger.info("Interrupt handled", { sessionId: ctx.sessionId });
}

async function endCall(ctx: AuthenticatedClient): Promise<void> {
  if (ctx.currentAbortController) {
    ctx.currentAbortController.abort();
    ctx.currentAbortController = undefined;
  }

  await sessionManager.endSession(ctx.sessionId);
  await sessionManager.generateCallSummary(ctx.sessionId, ctx.userId);

  send(
    ctx.ws,
    createPayload(WS_EVENTS.SESSION_ENDED, {
      sessionId: ctx.sessionId,
      duration: Date.now() - ctx.connectedAt,
    })
  );

  logger.info("Call ended", { sessionId: ctx.sessionId });
}

function send(ws: WebSocket, payload: unknown): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

export function heartbeatCheck(): void {
  const now = Date.now();
  for (const [id, client] of clients) {
    if (!client.isAlive) {
      client.ws.terminate();
      clients.delete(id);
      logger.info("Client terminated due to heartbeat timeout", { clientId: id });
      continue;
    }
    client.isAlive = false;
    client.ws.ping();
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
