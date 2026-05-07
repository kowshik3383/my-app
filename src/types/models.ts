import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  aiRole: string;
  aiModulation: string;
  language: string;
  diseaseFocus: string;
  customTopic?: string;
  coachingStyle?: string;
  onboardingCompleted?: boolean;
  lastActiveAt?: Date;
}

export interface Session {
  _id?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  userId: ObjectId;
  title?: string;
  summary?: string;
  messageCount?: number;
}

export interface Message {
  _id?: ObjectId;
  createdAt: Date;
  sessionId: ObjectId;
  userId: ObjectId;
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
  audioBase64?: string;
  lipsync?: unknown;
  animation?: string;
  facialExpression?: string;
  metadata?: Record<string, unknown>;
  tokenCount?: number;
}
