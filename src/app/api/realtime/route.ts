import { NextRequest, NextResponse } from "next/server";
import { getDb, ObjectId } from "@/lib/db/mongodb";
import { logger } from "@/lib/observability/logging";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      const db = await getDb();
      const collection = db.collection("voice_sessions");
      const session = await collection.findOne({ _id: sessionId as any });

      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      return NextResponse.json({ session });
    }

    return NextResponse.json({
      status: "ok",
      wsUrl: process.env.NEXT_PUBLIC_WS_URL || `ws://localhost:${process.env.WS_PORT || 3001}`,
      version: "1.0.0",
    });
  } catch (error) {
    logger.error("Realtime API error", { error: String(error) });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId } = body;

    const db = await getDb();

    switch (action) {
      case "summaries": {
        const summaries = await db
          .collection("call_summaries")
          .find({ userId })
          .sort({ createdAt: -1 })
          .limit(10)
          .toArray();
        return NextResponse.json({ summaries });
      }

      case "analytics": {
        const analytics = await db
          .collection("voice_analytics")
          .find({ userId })
          .sort({ createdAt: -1 })
          .limit(10)
          .toArray();
        return NextResponse.json({ analytics });
      }

      case "emotions": {
        const emotions = await db
          .collection("emotion_signals")
          .find({ userId })
          .sort({ createdAt: -1 })
          .limit(50)
          .toArray();
        return NextResponse.json({ emotions });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    logger.error("Realtime POST error", { error: String(error) });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
