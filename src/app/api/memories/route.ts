import { NextRequest, NextResponse } from "next/server";
import { getDb, ObjectId } from "@/lib/db/mongodb";
import { retrieveRelevantMemories, formatMemoriesForPrompt } from "@/lib/memory/retrieval";
import { getEmbedding } from "@/lib/memory/embeddings";
import type { MemoryDocument, MemoryType } from "@/types/memory";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const query = searchParams.get("query");
    const type = searchParams.get("type") as MemoryType | null;
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    if (query) {
      const result = await retrieveRelevantMemories({
        userId: new ObjectId(userId),
        query,
        types: type ? [type] : undefined,
        limit,
      });

      return NextResponse.json({
        memories: result.memories.map((m) => ({
          ...m,
          _id: m._id?.toString(),
          userId: m.userId.toString(),
        })),
        relevanceScore: result.relevanceScore,
        totalTokens: result.totalTokens,
      });
    }

    const db = await getDb();
    const query_filter: any = { userId: new ObjectId(userId) };
    if (type) query_filter.type = type;

    const memories = await db
      .collection<MemoryDocument>("memories")
      .find(query_filter)
      .sort({ importance: -1, createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      memories: memories.map((m) => ({
        ...m,
        _id: m._id?.toString(),
        userId: m.userId.toString(),
        embedding: undefined,
      })),
    });
  } catch (error) {
    console.error("Error fetching memories:", error);
    return NextResponse.json({ error: "Failed to fetch memories" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memoryId = searchParams.get("memoryId");

    if (!memoryId) {
      return NextResponse.json({ error: "memoryId required" }, { status: 400 });
    }

    const db = await getDb();
    await db.collection("memories").deleteOne({ _id: new ObjectId(memoryId) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting memory:", error);
    return NextResponse.json({ error: "Failed to delete memory" }, { status: 500 });
  }
}
