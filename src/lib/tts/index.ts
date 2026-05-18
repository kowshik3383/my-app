import { logger } from "@/lib/observability/logging";

export interface TTSOptions {
  voice?: string;
  speed?: number;
  format?: "pcm16" | "mp3";
  sampleRate?: number;
}

export interface TTSResult {
  audio: ArrayBuffer;
  format: string;
  duration: number;
}

export interface TTSProvider {
  synthesize(text: string, options?: TTSOptions): Promise<TTSResult>;
  synthesizeStream?(text: string, options?: TTSOptions): AsyncGenerator<TTSChunk>;
}

export interface TTSChunk {
  audio: ArrayBuffer;
  format: "pcm16" | "mp3";
  sequence: number;
  isFinal: boolean;
  duration: number;
}

let provider: TTSProvider | null = null;

export async function getTTSProvider(): Promise<TTSProvider> {
  if (provider) return provider;

  const ttsProvider = process.env.TTS_PROVIDER || "cartesia";

  switch (ttsProvider) {
    case "cartesia": {
      const { CartesiaTTSProvider } = await import("./cartesia-stream");
      provider = new CartesiaTTSProvider();
      break;
    }
    case "elevenlabs": {
      const { ElevenLabsTTSProvider } = await import("./elevenlabs-stream");
      provider = new ElevenLabsTTSProvider();
      break;
    }
    default:
      throw new Error(`Unsupported TTS provider: ${ttsProvider}`);
  }

  logger.info("TTS provider initialized", { provider: ttsProvider });
  return provider;
}
