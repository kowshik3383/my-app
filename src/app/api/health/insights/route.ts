import { NextRequest, NextResponse } from "next/server";
import { getDb, ObjectId } from "@/lib/db/mongodb";
import { generateWeeklyInsights } from "@/lib/health/insights";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const insights = await generateWeeklyInsights(userId);

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Error generating insights:", error);
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const db = await getDb();
    const insights = await db
      .collection("ai_insights")
      .find({ userId: new ObjectId(userId), dismissed: false })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json({
      insights: insights.map((i: any) => ({
        id: i._id.toString(),
        type: i.type,
        content: i.content,
        severity: i.severity,
        createdAt: i.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching insights:", error);
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { insightId, dismissed } = await request.json();

    if (!insightId) {
      return NextResponse.json({ error: "insightId required" }, { status: 400 });
    }

    const db = await getDb();
    await db.collection("ai_insights").updateOne(
      { _id: new ObjectId(insightId) },
      { $set: { dismissed } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating insight:", error);
    return NextResponse.json({ error: "Failed to update insight" }, { status: 500 });
  }
}
