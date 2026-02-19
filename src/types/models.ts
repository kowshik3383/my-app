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
}

export interface Session {
  _id?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  userId: ObjectId;
}

export interface Message {
  _id?: ObjectId;
  createdAt: Date;
  sessionId: ObjectId;
  userId: ObjectId;
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
}
