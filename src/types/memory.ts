import { ObjectId } from "mongodb";

export type MemoryType = "episodic" | "health_fact" | "behavioral" | "emotional" | "summary";

export interface MemoryDocument {
  _id?: ObjectId;
  userId: ObjectId;
  type: MemoryType;
  content: string;
  importance: number;
  tags: string[];
  embedding?: number[];
  metadata?: Record<string, unknown>;
  sessionId?: ObjectId;
  sourceMessageId?: ObjectId;
  createdAt: Date;
  expiresAt?: Date;
}

export interface MemoryExtractionResult {
  memories: Omit<MemoryDocument, "_id">[];
  summary?: string;
  emotionalState?: EmotionalSignal;
}

export interface EmotionalSignal {
  mood: "positive" | "negative" | "neutral" | "anxious" | "stressed" | "energetic" | "tired";
  intensity: number;
  keywords: string[];
}

export interface MemoryRetrievalOptions {
  userId: ObjectId;
  query: string;
  types?: MemoryType[];
  maxTokens?: number;
  minImportance?: number;
  limit?: number;
  recencyWeight?: number;
}

export interface MemoryRetrievalResult {
  memories: MemoryDocument[];
  relevanceScore: number;
  totalTokens: number;
}

export interface SessionSummary {
  _id?: ObjectId;
  userId: ObjectId;
  sessionId: ObjectId;
  summary: string;
  keyPoints: string[];
  emotionalArc: string;
  healthMentions: string[];
  createdAt: Date;
}
