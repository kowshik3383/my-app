import { NextRequest, NextResponse } from "next/server";
import { evaluateAllActiveGoals, generateReminderMessage } from "@/lib/goals/evaluation";
import { getDb, ObjectId } from "@/lib/db/mongodb";
import type { Goal } from "@/types/goals";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const evaluations = await evaluateAllActiveGoals(userId);

    const db = await getDb();
    const goals = await db
      .collection<Goal>("goals")
      .find({ userId: new ObjectId(userId), status: "active" })
      .toArray();

    const reminders = await Promise.all(
      goals.map(async (goal) => ({
        goalId: goal._id!.toString(),
        title: goal.title,
        message: await generateReminderMessage(goal),
        streak: goal.streak,
      }))
    );

    return NextResponse.json({
      evaluations,
      reminders,
    });
  } catch (error) {
    console.error("Error evaluating goals:", error);
    return NextResponse.json({ error: "Failed to evaluate goals" }, { status: 500 });
  }
}
