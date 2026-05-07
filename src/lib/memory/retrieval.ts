import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import { getEmbedding, cosineSimilarity, normalizeScore } from "./embeddings";
import { TOKEN_BUDGETS } from "./types";
import type { MemoryDocument, MemoryRetrievalOptions, MemoryRetrievalResult } from "@/types/memory";

export async function retrieveRelevantMemories(
  options: MemoryRetrievalOptions
): Promise<MemoryRetrievalResult> {
  const { userId, query, types, maxTokens = TOKEN_BUDGETS.memory_context, minImportance = 0, limit = 20, recencyWeight = 0.3 } = options;

  const db = await getDb();
  const collection = db.collection<MemoryDocument>("memories");

  const queryEmbedding = await getEmbedding(query);

  const memories = await collection
    .find({
      userId: new ObjectId(userId),
      ...(types ? { type: { $in: types } } : {}),
      importance: { $gte: minImportance },
    })
    .sort({ createdAt: -1 })
    .limit(limit * 2)
    .toArray();

  const scored = memories.map((mem) => {
    let semanticScore = 0;
    if (mem.embedding && queryEmbedding.length > 0) {
      semanticScore = cosineSimilarity(mem.embedding, queryEmbedding);
    }

    const recencyScore = mem.createdAt
      ? Math.max(0, 1 - (Date.now() - mem.createdAt.getTime()) / (30 * 24 * 60 * 60 * 1000))
      : 0;

    const weightedScore =
      (1 - recencyWeight) * normalizeScore(semanticScore) + recencyWeight * recencyScore;

    return { memory: mem, score: weightedScore * mem.importance };
  });

  scored.sort((a, b) => b.score - a.score);

  const topMemories: MemoryDocument[] = [];
  let totalTokens = 0;

  for (const { memory, score } of scored) {
    const estimatedTokens = Math.ceil(memory.content.length / 4);
    if (totalTokens + estimatedTokens <= maxTokens) {
      topMemories.push(memory);
      totalTokens += estimatedTokens;
    } else {
      break;
    }
  }

  const avgScore = topMemories.length > 0
    ? scored.filter((s) => topMemories.includes(s.memory)).reduce((a, b) => a + b.score, 0) / topMemories.length
    : 0;

  return {
    memories: topMemories,
    relevanceScore: avgScore,
    totalTokens,
  };
}

export function formatMemoriesForPrompt(memories: MemoryDocument[]): string {
  if (memories.length === 0) return "";

  const grouped: Record<string, string[]> = {};

  for (const mem of memories) {
    const label = {
      episodic: "Past Events",
      health_fact: "Health Facts",
      behavioral: "Behavior Patterns",
      emotional: "Emotional History",
      summary: "Previous Sessions",
    }[mem.type] || "Other";

    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(`- ${mem.content}${mem.importance > 0.7 ? " (important)" : ""}`);
  }

  return Object.entries(grouped)
    .map(([label, items]) => `${label}:\n${items.join("\n")}`)
    .join("\n\n");
}
