import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import type { Goal, GoalEvaluation } from "@/types/goals";

export async function evaluateGoal(goalId: string): Promise<GoalEvaluation> {
  const db = await getDb();
  const goal = await db.collection<Goal>("goals").findOne({ _id: new ObjectId(goalId) });

  if (!goal) {
    throw new Error("Goal not found");
  }

  const progress = goal.targetValue > 0
    ? Math.min(100, (goal.currentValue / goal.targetValue) * 100)
    : 0;

  let status: GoalEvaluation["status"];
  let message: string;
  let suggestion: string;

  if (goal.type === "weight_loss" || goal.type === "hbA1c_reduction") {
    if (goal.currentValue <= goal.targetValue) {
      status = "completed";
      message = "Congratulations! You've reached your target!";
      suggestion = "Consider setting a new goal to maintain your progress.";
    } else if (progress >= 75) {
      status = "on_track";
      message = "You're making excellent progress!";
      suggestion = "Stay consistent and you'll reach your target soon.";
    } else if (progress >= 50) {
      status = "on_track";
      message = "Good progress! Keep going.";
      suggestion = "Review your strategy and see if there's room for optimization.";
    } else if (progress >= 25) {
      status = "needs_attention";
      message = "You've started but there's more work to do.";
      suggestion = "Try breaking your goal into smaller weekly targets.";
    } else {
      status = "off_track";
      message = "You're still at the beginning of your journey.";
      suggestion = "Let's create a more actionable plan to get you moving.";
    }
  } else {
    if (goal.currentValue >= goal.targetValue) {
      status = "completed";
      message = "Goal achieved! Great work!";
      suggestion = "Maintain this level or set a new challenge.";
    } else if (progress >= 75) {
      status = "on_track";
      message = "Almost there! Keep pushing!";
      suggestion = "You're so close to your goal. Stay focused!";
    } else if (progress >= 50) {
      status = "on_track";
      message = "Making solid progress!";
      suggestion = "You're halfway there. Consistency is key.";
    } else if (progress >= 25) {
      status = "needs_attention";
      message = "Progress is slow but steady.";
      suggestion = "Try increasing your daily target slightly.";
    } else {
      status = "off_track";
      message = "Let's work on getting you started.";
      suggestion = "What's holding you back? Let's address the obstacles.";
    }
  }

  return {
    goalId: goal._id!.toString(),
    type: goal.type,
    title: goal.title,
    currentValue: goal.currentValue,
    targetValue: goal.targetValue,
    progress,
    streak: goal.streak,
    status,
    message,
    suggestion,
  };
}

export async function evaluateAllActiveGoals(userId: string): Promise<GoalEvaluation[]> {
  const db = await getDb();
  const goals = await db
    .collection<Goal>("goals")
    .find({ userId: new ObjectId(userId), status: "active" })
    .toArray();

  return Promise.all(goals.map((g) => evaluateGoal(g._id!.toString())));
}

export async function generateReminderMessage(goal: Goal): Promise<string> {
  const progress = goal.targetValue > 0
    ? Math.min(100, (goal.currentValue / goal.targetValue) * 100)
    : 0;

  if (goal.streak === 0 && progress === 0) {
    return `You haven't started working on "${goal.title}" yet. Let's take the first step today!`;
  }

  if (goal.streak > 0 && progress < 25) {
    return `You've started "${goal.title}" but progress is still early. Keep showing up every day!`;
  }

  if (goal.streak > 5 && progress >= 50) {
    return `Great consistency on "${goal.title}"! You're ${Math.round(progress)}% there with a ${goal.streak}-day streak!`;
  }

  if (goal.streak === 0 && progress > 0) {
    return `You've made progress on "${goal.title}" (${Math.round(progress)}%) but haven't built a streak yet. Try going 3 days in a row!`;
  }

  return `Don't forget your goal: "${goal.title}". You're at ${Math.round(progress)}%. Every day counts!`;
}
