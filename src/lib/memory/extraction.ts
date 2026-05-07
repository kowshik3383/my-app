import { ObjectId } from "mongodb";
import { chatCompletion } from "@/lib/ai/client";
import { buildMemoryExtractionPrompt } from "@/lib/ai/prompts";
import { getDb } from "@/lib/db/mongodb";
import { getEmbedding } from "./embeddings";
import type { MemoryDocument, MemoryExtractionResult, EmotionalSignal } from "@/types/memory";

export async function extractMemories(
  userId: ObjectId,
  message: string,
  response: string,
  sessionId: ObjectId,
  sourceMessageId: ObjectId
): Promise<MemoryExtractionResult> {
  const prompt = buildMemoryExtractionPrompt(message, response);

  const result = await chatCompletion({
    messages: [
      { role: "system", content: "You extract structured memories from health conversations. Return ONLY valid JSON." },
      { role: "user", content: prompt },
    ],
    task: "memory",
    temperature: 0.3,
  });

  let extractedMemories: MemoryDocument[] = [];
  let emotionalSignal: EmotionalSignal | undefined;

  try {
    const cleanJson = result.content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    if (Array.isArray(parsed)) {
      extractedMemories = parsed.map((m: any) => ({
        userId,
        sessionId,
        sourceMessageId,
        type: m.type || "health_fact",
        content: m.content,
        importance: typeof m.importance === "number" ? Math.max(0, Math.min(1, m.importance)) : 0.5,
        tags: Array.isArray(m.tags) ? m.tags : [],
        createdAt: new Date(),
      }));
    }
  } catch {
    extractedMemories = [];
  }

  emotionalSignal = detectEmotionalSignal(message, response);

  return { memories: extractedMemories, emotionalSignal };
}

function detectEmotionalSignal(message: string, _response: string): EmotionalSignal {
  const positiveWords = ["happy", "great", "good", "better", "excited", "wonderful", "improved"];
  const negativeWords = ["sad", "bad", "worse", "struggling", "difficult", "pain", "tired"];
  const anxiousWords = ["anxious", "worried", "nervous", "scared", "fear", "panic"];
  const stressedWords = ["stressed", "overwhelmed", "burnout", "pressure"];
  const energeticWords = ["energetic", "motivated", "great", "amazing"];
  const tiredWords = ["tired", "exhausted", "sleepy", "fatigue", "low energy"];

  const text = message.toLowerCase();
  const keywords: string[] = [];

  let mood: EmotionalSignal["mood"] = "neutral";

  if (tiredWords.some((w) => text.includes(w))) {
    mood = "tired";
    keywords.push("tired");
  } else if (stressedWords.some((w) => text.includes(w))) {
    mood = "stressed";
    keywords.push("stressed");
  } else if (anxiousWords.some((w) => text.includes(w))) {
    mood = "anxious";
    keywords.push("anxious");
  } else if (positiveWords.some((w) => text.includes(w)) && !negativeWords.some((w) => text.includes(w))) {
    mood = "positive";
    keywords.push("positive");
  } else if (negativeWords.some((w) => text.includes(w))) {
    mood = "negative";
    keywords.push("negative");
  } else if (energeticWords.some((w) => text.includes(w))) {
    mood = "energetic";
    keywords.push("energetic");
  }

  const intensity = keywords.length > 0 ? 0.5 + keywords.length * 0.1 : 0.3;

  return { mood, intensity: Math.min(1, intensity), keywords };
}

export async function saveExtractedMemories(
  memories: Omit<MemoryDocument, "_id">[],
  emotionalSignal?: EmotionalSignal
): Promise<void> {
  if (memories.length === 0) return;

  const db = await getDb();
  const collection = db.collection<MemoryDocument>("memories");

  const importantMemories = memories.filter((m) => m.importance >= 0.3);

  for (const memory of importantMemories) {
    const existing = await collection.findOne({
      userId: memory.userId,
      type: memory.type,
      content: { $regex: memory.content.substring(0, 50), $options: "i" },
    });

    if (existing) {
      await collection.updateOne(
        { _id: existing._id },
        {
          $set: {
            importance: Math.max(existing.importance, memory.importance),
            updatedAt: new Date(),
          },
          $addToSet: { tags: { $each: memory.tags } },
        }
      );
    } else {
      try {
        const embedding = await getEmbedding(memory.content);
        await collection.insertOne({
          ...memory,
          embedding,
          createdAt: new Date(),
        });
      } catch {
        await collection.insertOne({
          ...memory,
          createdAt: new Date(),
        });
      }
    }
  }

  if (emotionalSignal && emotionalSignal.intensity > 0.5) {
    const signalEmbedding = await getEmbedding(`emotional state: ${emotionalSignal.mood} - ${emotionalSignal.keywords.join(", ")}`);
    await collection.insertOne({
      userId: importantMemories[0]?.userId || ({} as ObjectId),
      type: "emotional",
      content: `User expressed ${emotionalSignal.mood} mood (intensity: ${emotionalSignal.intensity}). Keywords: ${emotionalSignal.keywords.join(", ")}`,
      importance: emotionalSignal.intensity,
      tags: ["emotional", emotionalSignal.mood, ...emotionalSignal.keywords],
      embedding: signalEmbedding,
      createdAt: new Date(),
    } as any);
  }
}
