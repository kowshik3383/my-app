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
import type { AIModulation } from "@/store/useStore";

// Ensure memory indexes on first run
let indexesEnsured = false;

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionId, message } = await request.json();

    if (!userId || !sessionId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure indexes (once)
    if (!indexesEnsured) {
      await ensureMemoryIndexes();
      indexesEnsured = true;
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

    // ── 1. Get conversation history (last 20 turns) ───────────────────────────
    const previousMessages = await messagesCollection
      .find({ sessionId: new ObjectId(sessionId) })
      .sort({ createdAt: 1 })
      .limit(20)
      .toArray();

    const conversationHistory = previousMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // ── 2. Retrieve multi-layer memory context ────────────────────────────────
    const memoryContext = await retrieveMemoryContext(userId, sessionId, message);

    // ── 3. Save user message to DB ────────────────────────────────────────────
    await messagesCollection.insertOne({
      sessionId: new ObjectId(sessionId),
      userId: new ObjectId(userId),
      role: "user",
      content: message,
      createdAt: new Date(),
    });

    // ── 4. Update short-term memory with user turn ─────────────────────────────
    const signals = analyzeEmotionSignals(message);
    await updateShortTermMemory(
      userId,
      sessionId,
      { role: "user", content: message, timestamp: new Date() },
      extractTopicFromMessage(message),
      signalsToEmotion(signals)
    );

    // ── 5. Generate AI response with memory context ───────────────────────────
    const aiResponse = await generateAIResponse(message, {
      role: user.aiRole as any,
      modulation: user.aiModulation as any,
      language: user.language as any,
      diseaseFocus: user.diseaseFocus as any,
      customTopic: user.customTopic || undefined,
      conversationHistory,
      memoryContext,
    });

    // ── 6. Emotion-driven animation + lipsync ─────────────────────────────────
    const duration = estimateAudioDuration(aiResponse);
    const lipsync = generateLipsync(aiResponse, duration);
    const { animation, facialExpression, emotionState, intensity } =
      selectAnimationWithEmotion(aiResponse);

    // ── 7. Voice generation (optional, non-blocking) ──────────────────────────
    let audioBase64 = "";
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

    if (ELEVENLABS_API_KEY) {
      try {
        // Use user's selected voice, fall back to modulation default
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

    // ── 8. Save AI message ────────────────────────────────────────────────────
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

    // ── 9. Async memory updates (non-blocking) ─────────────────────────────────
    updateMemoryAsync(userId, sessionId, message, aiResponse);

    // ── 10. Update session timestamp ──────────────────────────────────────────
    await sessionsCollection.updateOne(
      { _id: new ObjectId(sessionId) },
      { $set: { updatedAt: new Date() } }
    );

    const aiMessage = await messagesCollection.findOne({
      _id: aiMessageResult.insertedId,
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
  assistantMessage: string
): Promise<void> {
  try {
    const extracted = extractMemoryFromText(userMessage, assistantMessage);
    const signals = analyzeEmotionSignals(userMessage);

    await Promise.all([
      // Update long-term memory (name, goals, topics)
      updateLongTermMemory(userId, extracted),

      // Update emotional memory
      updateEmotionalMemory(userId, sessionId, signals.valence, extracted.emotionLabel),

      // Update short-term memory with AI turn
      updateShortTermMemory(
        userId,
        sessionId,
        { role: "assistant", content: assistantMessage, timestamp: new Date() },
        extractTopicFromMessage(userMessage),
        extracted.emotionLabel
      ),

      // Save episodic memories for important events
      ...extracted.events.map((event) =>
        saveEpisodicMemory(
          userId,
          sessionId,
          event,
          `User mentioned: ${event}`,
          signals.valence
        )
      ),
    ]);
  } catch (err) {
    console.error("[MemoryUpdate] Non-critical error:", err);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function extractTopicFromMessage(message: string): string {
  const words = message
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 4)
    .slice(0, 3);
  return words.join(", ");
}

function signalsToEmotion(signals: ReturnType<typeof analyzeEmotionSignals>): any {
  if (signals.uncertainty > 0.5) return "anxious";
  if (signals.valence > 0.5 && signals.arousal > 0.5) return "excited";
  if (signals.valence > 0.3) return "happy";
  if (signals.valence < -0.4) return "sad";
  return "neutral";
}
