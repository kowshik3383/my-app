import { NextRequest, NextResponse } from "next/server";
import { getDb, ObjectId } from "@/lib/mongodb";
import { generateAIResponse } from "@/lib/gemini";
import { generateVoice, VOICE_IDS } from "@/lib/elevenlabs";
import { generateLipsync, estimateAudioDuration, selectAnimationWithEmotion } from "@/lib/lipsync";
import {
  retrieveMemoryContext,
  updateShortTermMemory,
  updateLongTermMemory,
  updateEmotionalMemory,
  saveEpisodicMemory,
  extractMemoryFromText,
  ensureMemoryIndexes,
} from "@/lib/memory";
import { analyzeEmotionSignals } from "@/lib/emotion";
import { maskPII, getPIIReport } from "@/lib/piiDetection";
import { logPIIDetection, logMemoryUpdate, ensureAuditIndexes } from "@/lib/auditLog";
import { getMemoryBiasPrompt, getRolePersonality } from "@/lib/roleSystem";
import type { AIModulation } from "@/store/useStore";

// One-time initialization
let initialized = false;

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionId, message } = await request.json();

    if (!userId || !sessionId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // One-time setup
    if (!initialized) {
      await Promise.all([ensureMemoryIndexes(), ensureAuditIndexes()]);
      initialized = true;
    }

    const db = await getDb();
    const usersCollection = db.collection("users");
    const messagesCollection = db.collection("messages");
    const sessionsCollection = db.collection("sessions");

    // Get user profile
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ── 1. PII Detection on incoming message ──────────────────────────────────
    const piiReport = getPIIReport(message);
    let processedMessage = message;

    if (piiReport.hasPII) {
      const { sanitized } = maskPII(message);
      processedMessage = sanitized;
      // Non-blocking audit log
      logPIIDetection(userId, piiReport.types, "user_message", true).catch(console.error);
    }

    // ── 2. Get conversation history (short-term: last 20 turns) ───────────────
    const previousMessages = await messagesCollection
      .find({ sessionId: new ObjectId(sessionId) })
      .sort({ createdAt: 1 })
      .limit(20)
      .toArray();

    const conversationHistory = previousMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // ── 3. Retrieve multi-layer memory context ────────────────────────────────
    const memoryContext = await retrieveMemoryContext(userId, sessionId, processedMessage);

    // ── 4. Save user message ───────────────────────────────────────────────────
    await messagesCollection.insertOne({
      sessionId: new ObjectId(sessionId),
      userId: new ObjectId(userId),
      role: "user",
      content: processedMessage,
      createdAt: new Date(),
    });

    // ── 5. Update short-term memory ────────────────────────────────────────────
    const signals = analyzeEmotionSignals(processedMessage);
    await updateShortTermMemory(
      userId,
      sessionId,
      { role: "user", content: processedMessage, timestamp: new Date() },
      extractTopicFromMessage(processedMessage),
      signalsToEmotion(signals)
    );

    // ── 6. Generate AI response with role-enriched context ────────────────────
    const aiResponse = await generateAIResponse(processedMessage, {
      role: user.aiRole as any,
      modulation: user.aiModulation as any,
      language: user.language as any,
      diseaseFocus: user.diseaseFocus as any,
      customTopic: user.customTopic || undefined,
      conversationHistory,
      memoryContext,
    });

    // ── 7. Emotion-driven animation + lipsync ─────────────────────────────────
    const duration = estimateAudioDuration(aiResponse);
    const lipsync = generateLipsync(aiResponse, duration);
    const { animation, facialExpression, emotionState, intensity } =
      selectAnimationWithEmotion(aiResponse);

    // ── 8. Voice generation (optional, non-blocking) ──────────────────────────
    let audioBase64 = "";
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

    if (ELEVENLABS_API_KEY) {
      try {
        const voiceId =
          (user.selectedVoiceId as string) ||
          VOICE_IDS[user.aiModulation as AIModulation] ||
          VOICE_IDS.default;

        const audioDataUrl = await Promise.race([
          generateVoice(aiResponse, voiceId),
          new Promise<string>((resolve) => setTimeout(() => resolve(""), 5000)),
        ]);
        audioBase64 = audioDataUrl ? audioDataUrl.split(",")[1] : "";
      } catch (error) {
        console.error("Voice generation failed, using browser speech:", error);
        audioBase64 = "";
      }
    }

    // ── 9. Save AI message ─────────────────────────────────────────────────────
    const aiMessageResult = await messagesCollection.insertOne({
      sessionId: new ObjectId(sessionId),
      userId: new ObjectId(userId),
      role: "assistant",
      content: aiResponse,
      audioBase64,
      lipsync,
      animation,
      facialExpression,
      emotionState,
      emotionIntensity: intensity,
      createdAt: new Date(),
    });

    // ── 10. Async memory updates (non-blocking) ────────────────────────────────
    updateMemoryAsync(userId, sessionId, processedMessage, aiResponse, user.aiRole);

    // ── 11. Update session ─────────────────────────────────────────────────────
    await sessionsCollection.updateOne(
      { _id: new ObjectId(sessionId) },
      { $set: { updatedAt: new Date() } }
    );

    const aiMessage = await messagesCollection.findOne({ _id: aiMessageResult.insertedId });

    return NextResponse.json({
      message: {
        id: aiMessage?._id.toString(),
        role: aiMessage?.role,
        content: aiMessage?.content,
        audioBase64: aiMessage?.audioBase64,
        lipsync: aiMessage?.lipsync,
        animation: aiMessage?.animation,
        facialExpression: aiMessage?.facialExpression,
        emotionState: aiMessage?.emotionState,
        emotionIntensity: aiMessage?.emotionIntensity,
        createdAt: aiMessage?.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in chat:", error);
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 });
  }
}

// ─── Async Memory Update Pipeline ─────────────────────────────────────────────

async function updateMemoryAsync(
  userId: string,
  sessionId: string,
  userMessage: string,
  assistantMessage: string,
  roleId?: string
): Promise<void> {
  try {
    const extracted = extractMemoryFromText(userMessage, assistantMessage);
    const signals = analyzeEmotionSignals(userMessage);

    // Role-based memory prioritization
    const rolePersonality = roleId ? getRolePersonality(roleId) : null;
    const memoryBias = rolePersonality?.memoryBias ?? "balanced";

    const updates: Promise<void>[] = [
      updateEmotionalMemory(userId, sessionId, signals.valence, extracted.emotionLabel),
      updateShortTermMemory(
        userId, sessionId,
        { role: "assistant", content: assistantMessage, timestamp: new Date() },
        extractTopicFromMessage(userMessage),
        extracted.emotionLabel
      ),
    ];

    // Bias: emotional roles always store long-term emotional data
    if (memoryBias === "emotional" || memoryBias === "relational" || memoryBias === "balanced") {
      updates.push(updateLongTermMemory(userId, extracted));
    }

    // Bias: clinical roles also always update facts
    if (memoryBias === "clinical" || memoryBias === "balanced") {
      if (extracted.goals.length > 0 || extracted.userName) {
        updates.push(updateLongTermMemory(userId, extracted));
      }
    }

    // Motivational roles track goals aggressively
    if (memoryBias === "motivational") {
      updates.push(updateLongTermMemory(userId, extracted));
    }

    // Save episodic memories for important events
    const episodicUpdates = extracted.events.map((event) =>
      saveEpisodicMemory(userId, sessionId, event, `User mentioned: ${event}`, signals.valence)
    );

    await Promise.all([...updates, ...episodicUpdates]);

    // Audit log memory update
    const updatedFields = [
      extracted.userName && "userName",
      extracted.goals.length > 0 && "goals",
      extracted.topics.length > 0 && "topics",
      extracted.events.length > 0 && "episodic",
    ].filter(Boolean) as string[];

    if (updatedFields.length > 0) {
      logMemoryUpdate(userId, "multi_layer", updatedFields).catch(console.error);
    }
  } catch (err) {
    console.error("[MemoryUpdate] Non-critical error:", err);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractTopicFromMessage(message: string): string {
  return message
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 4)
    .slice(0, 3)
    .join(", ");
}

function signalsToEmotion(signals: ReturnType<typeof analyzeEmotionSignals>): any {
  if (signals.uncertainty > 0.5) return "anxious";
  if (signals.valence > 0.5 && signals.arousal > 0.5) return "excited";
  if (signals.valence > 0.3) return "happy";
  if (signals.valence < -0.4) return "sad";
  return "neutral";
}
