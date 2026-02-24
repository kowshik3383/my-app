import { ObjectId } from "mongodb";

export type EmotionLabel =
  | "happy"
  | "sad"
  | "anxious"
  | "excited"
  | "frustrated"
  | "neutral"
  | "empathetic"
  | "encouraging"
  | "thinking";

// ─── Short-Term Memory ─────────────────────────────────────────────────────────
export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ShortTermMemory {
  _id?: ObjectId;
  userId: ObjectId;
  sessionId: ObjectId;
  turns: ConversationTurn[];
  activeTopic: string;
  emotionalContext: EmotionLabel;
  updatedAt: Date;
}

// ─── Long-Term Memory ──────────────────────────────────────────────────────────
export interface UserGoal {
  goal: string;
  status: "active" | "achieved" | "abandoned";
  addedAt: Date;
  updatedAt?: Date;
}

export interface LongTermMemory {
  _id?: ObjectId;
  userId: ObjectId;
  userName?: string;
  preferences: Record<string, string>;
  goals: UserGoal[];
  recurringTopics: string[];
  personalityTraits: string[];
  importanceScore: number;
  updatedAt: Date;
}

// ─── Episodic Memory ───────────────────────────────────────────────────────────
export interface EpisodicMemory {
  _id?: ObjectId;
  userId: ObjectId;
  sessionId?: ObjectId;
  event: string;          // human-readable description
  summary: string;        // brief summary of episode
  keywords: string[];     // for semantic retrieval
  emotionalValence: number; // -1 (negative) to 1 (positive)
  importanceScore: number;  // 0 to 1
  recencyScore: number;     // 0 to 1, decays over time
  createdAt: Date;
}

// ─── Emotional Memory ──────────────────────────────────────────────────────────
export interface SentimentPoint {
  value: number;          // -1 to 1
  label: EmotionLabel;
  timestamp: Date;
}

export interface EmotionalMemory {
  _id?: ObjectId;
  userId: ObjectId;
  sessionId?: ObjectId;
  sentimentHistory: SentimentPoint[];
  dominantPattern: EmotionLabel;
  stressIndicators: string[];
  excitementIndicators: string[];
  frustrationIndicators: string[];
  averageValence: number;
  updatedAt: Date;
}

// ─── Composed Memory Context (used to build AI prompt) ─────────────────────────
export interface MemoryContext {
  longTerm: LongTermMemory | null;
  recentEpisodes: EpisodicMemory[];
  emotionalPattern: EmotionalMemory | null;
  shortTerm: ShortTermMemory | null;
}

// ─── Extracted Memory from conversation ───────────────────────────────────────
export interface ExtractedMemory {
  userName?: string;
  goals: string[];
  topics: string[];
  events: string[];
  preferences: Record<string, string>;
  sentimentScore: number;
  emotionLabel: EmotionLabel;
}
