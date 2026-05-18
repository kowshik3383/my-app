export const WS_CONFIG = {
  port: parseInt(process.env.WS_PORT || "3001", 10),
  host: process.env.WS_HOST || "0.0.0.0",
  maxPayload: parseInt(process.env.WS_MAX_PAYLOAD || "65536", 10),
  heartbeatInterval: parseInt(process.env.WS_HEARTBEAT_INTERVAL || "30000", 10),
  sessionTimeout: parseInt(process.env.WS_SESSION_TIMEOUT || "3600000", 10),
  maxReconnectAttempts: parseInt(process.env.WS_MAX_RECONNECT || "10", 10),
};

export const AUDIO_CONFIG = {
  sampleRate: 16000,
  channels: 1,
  frameDurationMs: 30,
  frameSize: 480,
  bitDepth: 16,
};

export const VAD_CONFIG = {
  threshold: 0.5,
  minSpeechDurationMs: 100,
  minSilenceDurationMs: 500,
  frameSize: 480,
  sampleRate: 16000,
};

export const STT_CONFIG = {
  provider: process.env.STT_PROVIDER || "openai",
  model: process.env.STT_MODEL || "whisper-1",
  language: "en",
};

export const TTS_CONFIG = {
  provider: process.env.TTS_PROVIDER || "cartesia",
  voiceId: process.env.TTS_VOICE_ID || "sonic-2",
  model: process.env.TTS_MODEL || "sonic-2",
  outputFormat: "pcm16" as const,
  sampleRate: 24000,
};
