import { NextRequest, NextResponse } from "next/server";
import { getDb, ObjectId } from "@/lib/db/mongodb";
import { createGoal, getGoals, updateGoalProgress, evaluateStreaks } from "@/lib/goals/engine";
import { evaluateGoal } from "@/lib/goals/evaluation";
import type { Goal, GoalType, CoachingStyle, ReminderConfig, GoalStatus } from "@/types/goals";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, title, description, targetValue, unit, targetDate, coachingStyle, reminders } = body;

    if (!userId || !type || !title || targetValue === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: userId, type, title, targetValue" },
        { status: 400 }
      );
    }

    const id = await createGoal({
      userId: new ObjectId(userId),
      type: type as GoalType,
      title,
      description,
      targetValue: Number(targetValue),
      currentValue: 0,
      unit: unit || "",
      startDate: new Date(),
      targetDate: targetDate ? new Date(targetDate) : undefined,
      status: "active",
      coachingStyle: (coachingStyle as CoachingStyle) || "supportive_mentor",
      reminders: (reminders as ReminderConfig[]) || [],
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error("Error creating goal:", error);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const goals = await getGoals(userId, status || undefined);

    const goalsWithEvaluation = await Promise.all(
      goals.map(async (goal) => {
        try {
          const evaluation = await evaluateGoal(goal._id!.toString());
          return { ...goal, _id: goal._id?.toString(), evaluation };
        } catch {
          return { ...goal, _id: goal._id?.toString() };
        }
      })
    );

    return NextResponse.json({ goals: goalsWithEvaluation });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { goalId, currentValue, status, note } = body;

    if (!goalId) {
      return NextResponse.json({ error: "goalId required" }, { status: 400 });
    }

    const db = await getDb();
    const goal = await db.collection<Goal>("goals").findOne({ _id: new ObjectId(goalId) });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    if (currentValue !== undefined) {
      await updateGoalProgress(goalId, goal.userId.toString(), Number(currentValue), note);
    }

    if (status) {
      await db.collection<Goal>("goals").updateOne(
        { _id: new ObjectId(goalId) },
        { $set: { status: status as GoalStatus, updatedAt: new Date() } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating goal:", error);
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get("goalId");

    if (!goalId) {
      return NextResponse.json({ error: "goalId required" }, { status: 400 });
    }

    const db = await getDb();
    await db.collection("goals").deleteOne({ _id: new ObjectId(goalId) });
    await db.collection("goal_progress").deleteMany({ goalId: new ObjectId(goalId) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 });
  }
}
