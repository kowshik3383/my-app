import { ObjectId } from "mongodb";
import { extractMemories, saveExtractedMemories } from "./extraction";
import { retrieveRelevantMemories, formatMemoriesForPrompt } from "./retrieval";
import { shouldSummarizeSession, generateSessionSummary } from "./summarization";
import { TOKEN_BUDGETS } from "./types";
import type { MemoryRetrievalOptions } from "@/types/memory";

export class MemoryEngine {
  async processMessage(
    userId: string,
    sessionId: string,
    messageId: string,
    userMessage: string,
    aiResponse: string
  ): Promise<void> {
    const uid = new ObjectId(userId);
    const sid = new ObjectId(sessionId);
    const mid = new ObjectId(messageId);

    try {
      const { memories, emotionalSignal } = await extractMemories(uid, userMessage, aiResponse, sid, mid);
      await saveExtractedMemories(memories, emotionalSignal);
    } catch (error) {
      console.error("Memory extraction failed:", error);
    }

    try {
      if (await shouldSummarizeSession(sid)) {
        generateSessionSummary(uid, sid).catch((e) =>
          console.error("Session summarization failed:", e)
        );
      }
    } catch (error) {
      console.error("Summary check failed:", error);
    }
  }

  async getContextForChat(
    userId: string,
    query: string,
    maxTokens: number = TOKEN_BUDGETS.memory_context
  ): Promise<string> {
    try {
      const uid = new ObjectId(userId);
      const options: MemoryRetrievalOptions = {
        userId: uid,
        query,
        maxTokens,
        minImportance: 0.4,
        limit: 15,
      };

      const result = await retrieveRelevantMemories(options);
      return formatMemoriesForPrompt(result.memories);
    } catch (error) {
      console.error("Memory retrieval failed:", error);
      return "";
    }
  }

  async getGoalContext(userId: string): Promise<string> {
    try {
      const { getDb } = await import("@/lib/db/mongodb");
      const db = await getDb();
      const goals = await db
        .collection("goals")
        .find({
          userId: new ObjectId(userId),
          status: "active",
        })
        .toArray();

      if (goals.length === 0) return "";

      return goals
        .map((g: any) => `- ${g.title}: ${g.currentValue}/${g.targetValue} ${g.unit} (${Math.round((g.currentValue / g.targetValue) * 100)}% complete, ${g.streak} day streak)`)
        .join("\n");
    } catch {
      return "";
    }
  }
}

export const memoryEngine = new MemoryEngine();
