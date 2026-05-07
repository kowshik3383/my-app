import { ObjectId } from "mongodb";

export type GoalType =
  | "weight_loss"
  | "hbA1c_reduction"
  | "sleep"
  | "water_intake"
  | "walking"
  | "medication"
  | "exercise"
  | "custom";

export type GoalStatus = "active" | "completed" | "paused" | "cancelled";

export type CoachingStyle =
  | "strict_coach"
  | "supportive_mentor"
  | "calm_doctor"
  | "accountability_partner";

export interface ReminderConfig {
  frequency: "daily" | "weekly" | "custom";
  time?: string;
  daysOfWeek?: number[];
  message: string;
  enabled: boolean;
}

export interface Goal {
  _id?: ObjectId;
  userId: ObjectId;
  type: GoalType;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: Date;
  targetDate?: Date;
  status: GoalStatus;
  streak: number;
  bestStreak: number;
  coachingStyle: CoachingStyle;
  reminders: ReminderConfig[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalProgress {
  _id?: ObjectId;
  goalId: ObjectId;
  userId: ObjectId;
  value: number;
  date: Date;
  note?: string;
  achieved: boolean;
}

export interface GoalEvaluation {
  goalId: string;
  type: GoalType;
  title: string;
  currentValue: number;
  targetValue: number;
  progress: number;
  streak: number;
  status: "on_track" | "needs_attention" | "off_track" | "completed";
  message: string;
  suggestion: string;
}

export const GOAL_UNITS: Record<GoalType, string> = {
  weight_loss: "kg",
  hbA1c_reduction: "%",
  sleep: "hours",
  water_intake: "L",
  walking: "steps",
  medication: "%",
  exercise: "min",
  custom: "",
};

export const COACHING_STYLE_PROMPTS: Record<CoachingStyle, string> = {
  strict_coach:
    "You are a strict but caring coach. Be direct, push for results, and don't accept excuses. Use motivational but firm language.",
  supportive_mentor:
    "You are a supportive mentor. Be encouraging, understanding, and focus on progress over perfection. Celebrate small wins.",
  calm_doctor:
    "You are a calm, professional doctor. Provide measured, evidence-based guidance. Be reassuring and focus on long-term health.",
  accountability_partner:
    "You are an accountability partner. Be friendly but hold the user responsible. Check in regularly and track commitments.",
};
