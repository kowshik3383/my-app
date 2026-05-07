import { NextRequest, NextResponse } from "next/server";
import { getDashboardData } from "@/lib/health/insights";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const dashboard = await getDashboardData(userId);

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const insightsLib = await import("@/lib/health/insights");
    const insights = await insightsLib.generateWeeklyInsights(userId);

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Error generating dashboard insights:", error);
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}
