export type ConnectionState = "disconnected" | "connecting" | "connected" | "reconnecting";

export type CallState = "idle" | "connecting" | "connected" | "ended" | "reconnecting";

export type AudioDirection = "incoming" | "outgoing";

export interface VoiceSession {
  id: string;
  userId: string;
  startedAt: Date;
  endedAt?: Date;
  duration: number;
  status: "active" | "ended";
  messageCount: number;
}

export interface CallMetrics {
  latency: number;
  jitter: number;
  packetsLost: number;
  reconnects: number;
  audioLevel: number;
}

export interface RealtimeEvent {
  type: RealtimeEventType;
  data: unknown;
  timestamp: number;
}

export type RealtimeEventType =
  | "session.started"
  | "session.ended"
  | "audio.input"
  | "audio.output"
  | "transcript.partial"
  | "transcript.final"
  | "transcript.interim"
  | "ai.token"
  | "ai.tokens.complete"
  | "tts.chunk"
  | "tts.complete"
  | "interrupt"
  | "vad.started"
  | "vad.stopped"
  | "vad.speaking"
  | "error"
  | "connection.state"
  | "emotion.detected"
  | "latency.ping"
  | "latency.pong";

export interface WebSocketMessage {
  type: RealtimeEventType;
  payload: unknown;
  id?: string;
  timestamp?: number;
}

export interface AudioInputMessage {
  audio: Float32Array | ArrayBuffer;
  sampleRate: number;
  sequence: number;
}

export interface AudioOutputMessage {
  audio: ArrayBuffer;
  sampleRate: number;
  format: "pcm16" | "mp3";
  sequence: number;
}

export interface TranscriptMessage {
  text: string;
  isFinal: boolean;
  language?: string;
}

export interface AITokenMessage {
  token: string;
  done: boolean;
  messageId?: string;
}

export interface TTSChunkMessage {
  audio: ArrayBuffer;
  format: "pcm16" | "mp3";
  sequence: number;
  isFinal: boolean;
}

export interface InterruptMessage {
  reason: "user_speech" | "manual" | "timeout";
  timestamp: number;
}

export interface VADEvent {
  speaking: boolean;
  audioLevel: number;
  timestamp: number;
}

export interface EmotionDetection {
  emotion: string;
  confidence: number;
  utterance?: string;
}

export interface CallSummary {
  sessionId: string;
  duration: number;
  messageCount: number;
  userTurns: number;
  aiTurns: number;
  topics: string[];
  emotions: { emotion: string; count: number }[];
  summary: string;
  healthMentions: string[];
  goalsMentioned: string[];
  actionItems: string[];
  createdAt: Date;
}

export interface VoiceSelectorOption {
  id: string;
  name: string;
  description: string;
  preview?: string;
}

export interface InterruptionConfig {
  enabled: boolean;
  threshold: number;
  cooldownMs: number;
}

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  frameSize: number;
  vadThreshold: number;
  noiseSuppression: boolean;
  echoCancellation: boolean;
}

export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  sampleRate: 16000,
  channels: 1,
  frameSize: 480,
  vadThreshold: 0.5,
  noiseSuppression: true,
  echoCancellation: true,
};

export const VOICE_OPTIONS: VoiceSelectorOption[] = [
  { id: "sonic-2", name: "Sonic", description: "Warm and natural" },
  { id: "nova", name: "Nova", description: "Soft and caring" },
  { id: "echo", name: "Echo", description: "Calm and professional" },
  { id: "ember", name: "Ember", description: "Energetic and bright" },
  { id: "aura", name: "Aura", description: "Gentle and soothing" },
];
