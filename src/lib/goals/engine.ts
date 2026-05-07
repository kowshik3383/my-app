import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import type { Goal, GoalProgress, CoachingStyle } from "@/types/goals";

export async function createGoal(goal: Omit<Goal, "_id" | "createdAt" | "updatedAt" | "streak" | "bestStreak">): Promise<string> {
  const db = await getDb();
  const result = await db.collection<Goal>("goals").insertOne({
    ...goal,
    streak: 0,
    bestStreak: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Goal);
  return result.insertedId.toString();
}

export async function getGoals(userId: string, status?: string): Promise<Goal[]> {
  const db = await getDb();
  const query: any = { userId: new ObjectId(userId) };
  if (status) query.status = status;
  return db.collection<Goal>("goals").find(query).sort({ createdAt: -1 }).toArray();
}

export async function updateGoalProgress(
  goalId: string,
  userId: string,
  value: number,
  note?: string
): Promise<void> {
  const db = await getDb();
  const goal = await db.collection<Goal>("goals").findOne({ _id: new ObjectId(goalId) });
  if (!goal) throw new Error("Goal not found");

  const achieved = goal.type === "weight_loss" || goal.type === "hbA1c_reduction"
    ? value <= goal.targetValue
    : value >= goal.targetValue;

  await db.collection<Goal>("goals").updateOne(
    { _id: new ObjectId(goalId) },
    { $set: { currentValue: value, updatedAt: new Date() } }
  );

  await db.collection<GoalProgress>("goal_progress").insertOne({
    goalId: new ObjectId(goalId),
    userId: new ObjectId(userId),
    value,
    date: new Date(),
    note,
    achieved,
  } as GoalProgress);
}

export async function evaluateStreaks(): Promise<void> {
  const db = await getDb();
  const goals = await db.collection<Goal>("goals").find({ status: "active" }).toArray();

  for (const goal of goals) {
    const recent = await db
      .collection<GoalProgress>("goal_progress")
      .find({ goalId: goal._id })
      .sort({ date: -1 })
      .limit(7)
      .toArray();

    if (recent.length === 0) continue;

    let streak = 0;
    for (const entry of recent) {
      if (entry.achieved) streak++;
      else break;
    }

    await db.collection<Goal>("goals").updateOne(
      { _id: goal._id },
      {
        $set: {
          streak,
          updatedAt: new Date(),
          ...(streak > (goal.bestStreak || 0) ? { bestStreak: streak } : {}),
        },
      }
    );
  }
}

export function getCoachingMessage(
  coachingStyle: CoachingStyle,
  goal: Goal,
  progress: number
): string {
  const messages: Record<CoachingStyle, string[]> = {
    strict_coach: [
      `${progress < 50 ? "You're falling behind. Let's pick it up!" : "Good progress, but I know you can do better."}`,
      `You're at ${Math.round(progress)}%. Not bad, but not great either. Focus up.`,
      `${progress >= 80 ? "Almost there! Don't lose focus now." : "We need to push harder. Let's go!"}`,
    ],
    supportive_mentor: [
      `You're making progress! ${Math.round(progress)}% of the way there. Every step counts.`,
      `I'm proud of your consistency. ${progress >= 50 ? "You're more than halfway!" : "Keep going, you've got this!"}`,
      `Progress takes time, and you're doing great at ${Math.round(progress)}%. One day at a time.`,
    ],
    calm_doctor: [
      `Your progress is at ${Math.round(progress)}%. This is within expected parameters for sustainable improvement.`,
      `Based on your data, you're progressing steadily at ${Math.round(progress)}%. Continue your current regimen.`,
      `${Math.round(progress)}% complete. Remember that health improvements take time and consistency.`,
    ],
    accountability_partner: [
      `Hey! You're at ${Math.round(progress)}%. Let's check in - what's working and what's not?`,
      `${Math.round(progress)}% done. I'm tracking this - let's make sure we hit that target!`,
      `You said you wanted this. You're at ${Math.round(progress)}%. Let's stay accountable!`,
    ],
  };

  const styleMessages = messages[coachingStyle] || messages.supportive_mentor;
  return styleMessages[Math.floor(Math.random() * styleMessages.length)];
}
