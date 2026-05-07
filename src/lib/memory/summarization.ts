import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import { chatCompletion } from "@/lib/ai/client";
import { buildSummaryPrompt } from "@/lib/ai/prompts";
import { getEmbedding } from "./embeddings";
import type { SessionSummary } from "@/types/memory";

const SUMMARIZE_EVERY_N_MESSAGES = 20;

export async function shouldSummarizeSession(sessionId: ObjectId): Promise<boolean> {
  const db = await getDb();
  const messageCount = await db.collection("messages").countDocuments({
    sessionId: new ObjectId(sessionId),
  });
  return messageCount > 0 && messageCount % SUMMARIZE_EVERY_N_MESSAGES === 0;
}

export async function generateSessionSummary(
  userId: ObjectId,
  sessionId: ObjectId
): Promise<SessionSummary | null> {
  const db = await getDb();

  const recentMessages = await db
    .collection("messages")
    .find({ sessionId: new ObjectId(sessionId) })
    .sort({ createdAt: -1 })
    .limit(SUMMARIZE_EVERY_N_MESSAGES)
    .toArray();

  if (recentMessages.length < 2) return null;

  const messages = recentMessages
    .reverse()
    .map((m) => ({ role: m.role, content: m.content }));

  const prompt = buildSummaryPrompt(messages);

  const result = await chatCompletion({
    messages: [
      { role: "system", content: "You summarize health conversations. Return ONLY valid JSON." },
      { role: "user", content: prompt },
    ],
    task: "memory",
    temperature: 0.3,
  });

  try {
    const cleanJson = result.content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    const summary: SessionSummary = {
      userId: new ObjectId(userId),
      sessionId: new ObjectId(sessionId),
      summary: parsed.summary || "",
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      emotionalArc: parsed.emotionalArc || "neutral",
      healthMentions: Array.isArray(parsed.healthMentions) ? parsed.healthMentions : [],
      createdAt: new Date(),
    };

    const embedding = await getEmbedding(parsed.summary || "");
    const summaryEmbedding = await getEmbedding(JSON.stringify(parsed.keyPoints));

    const memoriesCollection = db.collection("memories");
    await memoriesCollection.insertOne({
      userId: new ObjectId(userId),
      type: "summary",
      content: parsed.summary || "",
      importance: 0.6,
      tags: ["summary", ...(parsed.healthMentions || [])],
      embedding,
      metadata: {
        keyPoints: parsed.keyPoints || [],
        emotionalArc: parsed.emotionalArc || "neutral",
        healthMentions: parsed.healthMentions || [],
      },
      sessionId: new ObjectId(sessionId),
      createdAt: new Date(),
    });

    const summariesCollection = db.collection<SessionSummary>("memory_summaries");
    await summariesCollection.insertOne(summary as any);

    return summary;
  } catch {
    return null;
  }
}
