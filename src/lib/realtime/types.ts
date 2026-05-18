export const WS_EVENTS = {
  SESSION_STARTED: "session.started",
  SESSION_ENDED: "session.ended",
  AUDIO_INPUT: "audio.input",
  AUDIO_OUTPUT: "audio.output",
  TRANSCRIPT_PARTIAL: "transcript.partial",
  TRANSCRIPT_FINAL: "transcript.final",
  TRANSCRIPT_INTERIM: "transcript.interim",
  AI_TOKEN: "ai.token",
  AI_TOKENS_COMPLETE: "ai.tokens.complete",
  TTS_CHUNK: "tts.chunk",
  TTS_COMPLETE: "tts.complete",
  INTERRUPT: "interrupt",
  VAD_STARTED: "vad.started",
  VAD_STOPPED: "vad.stopped",
  VAD_SPEAKING: "vad.speaking",
  ERROR: "error",
  CONNECTION_STATE: "connection.state",
  EMOTION_DETECTED: "emotion.detected",
  LATENCY_PING: "latency.ping",
  LATENCY_PONG: "latency.pong",
  RECONNECT: "reconnect",
  AUTH: "auth",
  AUTH_OK: "auth.ok",
} as const;

export type WSEvent = (typeof WS_EVENTS)[keyof typeof WS_EVENTS];

export interface WSPayload<T = unknown> {
  type: WSEvent;
  payload: T;
  id?: string;
  timestamp: number;
}

export function createPayload<T>(type: WSEvent, payload: T): WSPayload<T> {
  return { type, payload, timestamp: Date.now() };
}
