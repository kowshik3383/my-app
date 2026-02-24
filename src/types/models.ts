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
  /** Selected voice ID (ElevenLabs or browser) */
  selectedVoiceId?: string;
  /** User's real name (extracted from conversations) */
  userName?: string;
}

export interface Session {
  _id?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  userId: ObjectId;
  /** Session has been summarized into episodic memory */
  summarized?: boolean;
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
  lipsync?: any;
  animation?: string;
  facialExpression?: string;
  emotionState?: string;
  emotionIntensity?: number;
}

// Re-export memory types for convenience
export type {
  ShortTermMemory,
  LongTermMemory,
  EpisodicMemory,
  EmotionalMemory,
  MemoryContext,
  ExtractedMemory,
} from "@/types/memory";
