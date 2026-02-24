import { NextRequest, NextResponse } from "next/server";
import { getDb, ObjectId } from "@/lib/mongodb";
import { retrieveMemoryContext, summarizeSessionToEpisodic } from "@/lib/memory";

/** GET /api/memory?userId=... — retrieve full memory context for a user */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");
    const query = searchParams.get("query") || "";

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const db = await getDb();
    const sid = sessionId || (await getLatestSessionId(userId));

    if (!sid) {
      return NextResponse.json({ memory: null });
    }

    const context = await retrieveMemoryContext(userId, sid, query);

    // Also fetch user profile for userName
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) }, { projection: { userName: 1 } });

    return NextResponse.json({
      memory: {
        ...context,
        userName: user?.userName || context.longTerm?.userName || null,
      },
    });
  } catch (error) {
    console.error("Error fetching memory:", error);
    return NextResponse.json({ error: "Failed to fetch memory" }, { status: 500 });
  }
}

/** POST /api/memory/summarize — trigger session summarization */
export async function POST(request: NextRequest) {
  try {
    const { userId, sessionId } = await request.json();

    if (!userId || !sessionId) {
      return NextResponse.json({ error: "userId and sessionId required" }, { status: 400 });
    }

    const db = await getDb();
    const messages = await db
      .collection("messages")
      .find({ sessionId: new ObjectId(sessionId), userId: new ObjectId(userId) })
      .sort({ createdAt: 1 })
      .toArray();

    await summarizeSessionToEpisodic(
      userId,
      sessionId,
      messages.map((m) => ({ role: m.role, content: m.content }))
    );

    // Mark session as summarized
    await db.collection("sessions").updateOne(
      { _id: new ObjectId(sessionId) },
      { $set: { summarized: true, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true, message: "Session summarized into episodic memory" });
  } catch (error) {
    console.error("Error summarizing session:", error);
    return NextResponse.json({ error: "Failed to summarize session" }, { status: 500 });
  }
}

/** PATCH /api/memory — update a user goal status */
export async function PATCH(request: NextRequest) {
  try {
    const { userId, goalIndex, status } = await request.json();

    if (!userId || goalIndex === undefined || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const db = await getDb();
    const field = `goals.${goalIndex}.status`;

    await db.collection("long_term_memory").updateOne(
      { userId: new ObjectId(userId) },
      { $set: { [field]: status, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating memory:", error);
    return NextResponse.json({ error: "Failed to update memory" }, { status: 500 });
  }
}

// ─── Helper ───────────────────────────────────────────────────────────────────
async function getLatestSessionId(userId: string): Promise<string | null> {
  const db = await getDb();
  const session = await db
    .collection("sessions")
    .findOne({ userId: new ObjectId(userId) }, { sort: { updatedAt: -1 } });
  return session?._id?.toString() || null;
}
