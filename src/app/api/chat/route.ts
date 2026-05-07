import { NextRequest, NextResponse } from "next/server";
import { getDb, ObjectId } from "@/lib/db/mongodb";
import { chatCompletion, chatCompletionStream } from "@/lib/ai/client";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { memoryEngine } from "@/lib/memory/engine";
import { generateVoice, VOICE_IDS } from "@/lib/elevenlabs";
import { generateLipsync, selectAnimation, selectFacialExpression, estimateAudioDuration } from "@/lib/lipsync";
import { logger } from "@/lib/observability/logging";
import type { AIModulation } from "@/store/useStore";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { userId, sessionId, message } = await request.json();

    if (!userId || !sessionId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const usersCollection = db.collection("users");
    const messagesCollection = db.collection("messages");
    const sessionsCollection = db.collection("sessions");

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const previousMessages = await messagesCollection
      .find({ sessionId: new ObjectId(sessionId) })
      .sort({ createdAt: 1 })
      .limit(30)
      .toArray();

    const conversationHistory = previousMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const userMessageResult = await messagesCollection.insertOne({
      sessionId: new ObjectId(sessionId),
      userId: new ObjectId(userId),
      role: "user",
      content: message,
      createdAt: new Date(),
      tokenCount: Math.ceil(message.length / 4),
    });

    const [memoryContext, goalContext] = await Promise.all([
      memoryEngine.getContextForChat(userId, message),
      memoryEngine.getGoalContext(userId),
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

    const streamEnabled = request.headers.get("accept") === "text/event-stream";

    if (streamEnabled) {
      const stream = chatCompletionStream({
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          { role: "user", content: message },
        ],
        task: "fast_chat",
      });

      const encoder = new TextEncoder();
      const responseStream = new ReadableStream({
        async start(controller) {
          let fullContent = "";
          try {
            for await (const chunk of stream) {
              fullContent += chunk;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
              );
            }

            const duration = estimateAudioDuration(fullContent);
            const lipsync = generateLipsync(fullContent, duration);
            const animation = selectAnimation(fullContent);
            const facialExpression = selectFacialExpression(fullContent);

            let audioBase64 = "";
            const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
            if (ELEVENLABS_API_KEY) {
              try {
                const voiceId = VOICE_IDS[user.aiModulation as AIModulation] || VOICE_IDS.professional;
                const audioDataUrl = await Promise.race([
                  generateVoice(fullContent, voiceId),
                  new Promise<string>((resolve) => setTimeout(() => resolve(""), 5000)),
                ]);
                audioBase64 = audioDataUrl ? audioDataUrl.split(",")[1] : "";
              } catch {
                audioBase64 = "";
              }
            }

            const aiMessageResult = await messagesCollection.insertOne({
              sessionId: new ObjectId(sessionId),
              userId: new ObjectId(userId),
              role: "assistant",
              content: fullContent,
              audioBase64,
              lipsync,
              animation,
              facialExpression,
              createdAt: new Date(),
              tokenCount: Math.ceil(fullContent.length / 4),
            });

            await sessionsCollection.updateOne(
              { _id: new ObjectId(sessionId) },
              { $set: { updatedAt: new Date() }, $inc: { messageCount: 1 } }
            );

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  done: true,
                  messageId: aiMessageResult.insertedId.toString(),
                  lipsync,
                  animation,
                  facialExpression,
                  audioBase64,
                })}\n\n`
              )
            );

            memoryEngine.processMessage(
              userId,
              sessionId,
              aiMessageResult.insertedId.toString(),
              message,
              fullContent
            ).catch((e) => logger.error("Background memory processing failed", { error: e }));

            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          } catch (error) {
            logger.error("Stream error", { error: String(error) });
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: "Stream failed" })}\n\n`
              )
            );
          } finally {
            controller.close();
          }
        },
      });

      return new Response(responseStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const aiResponse = await chatCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user", content: message },
      ],
      task: "fast_chat",
    });

    const duration = estimateAudioDuration(aiResponse.content);
    const lipsync = generateLipsync(aiResponse.content, duration);
    const animation = selectAnimation(aiResponse.content);
    const facialExpression = selectFacialExpression(aiResponse.content);

    let audioBase64 = "";
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    if (ELEVENLABS_API_KEY) {
      try {
        const voiceId = VOICE_IDS[user.aiModulation as AIModulation] || VOICE_IDS.professional;
        const audioDataUrl = await Promise.race([
          generateVoice(aiResponse.content, voiceId),
          new Promise<string>((resolve) => setTimeout(() => resolve(""), 5000)),
        ]);
        audioBase64 = audioDataUrl ? audioDataUrl.split(",")[1] : "";
      } catch {
        audioBase64 = "";
      }
    }

    const aiMessageResult = await messagesCollection.insertOne({
      sessionId: new ObjectId(sessionId),
      userId: new ObjectId(userId),
      role: "assistant",
      content: aiResponse.content,
      audioBase64,
      lipsync,
      animation,
      facialExpression,
      createdAt: new Date(),
      tokenCount: aiResponse.usage?.totalTokens,
    });

    await sessionsCollection.updateOne(
      { _id: new ObjectId(sessionId) },
      { $set: { updatedAt: new Date() }, $inc: { messageCount: 1 } }
    );

    memoryEngine.processMessage(
      userId,
      sessionId,
      aiMessageResult.insertedId.toString(),
      message,
      aiResponse.content
    ).catch((e) => logger.error("Background memory processing failed", { error: e }));

    const aiMessage = await messagesCollection.findOne({
      _id: aiMessageResult.insertedId,
    });

    logger.info("Chat response generated", {
      userId,
      sessionId,
      duration: Date.now() - startTime,
      tokens: aiResponse.usage?.totalTokens,
      model: aiResponse.model,
    });

    return NextResponse.json({
      message: {
        id: aiMessage?._id.toString(),
        role: aiMessage?.role,
        content: aiMessage?.content,
        audioBase64: aiMessage?.audioBase64,
        lipsync: aiMessage?.lipsync,
        animation: aiMessage?.animation,
        facialExpression: aiMessage?.facialExpression,
        createdAt: aiMessage?.createdAt,
        model: aiResponse.model,
      },
    });
  } catch (error) {
    logger.error("Chat API error", { error: String(error), duration: Date.now() - startTime });
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
