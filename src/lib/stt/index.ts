import { logger } from "@/lib/observability/logging";

export interface STTOptions {
  language?: string;
  prompt?: string;
  temperature?: number;
}

export interface STTResult {
  text: string;
  isFinal: boolean;
  confidence: number;
  language?: string;
  segments?: STTSegment[];
}

export interface STTSegment {
  text: string;
  start: number;
  end: number;
  confidence: number;
}

export interface STTProvider {
  transcribe(audio: ArrayBuffer | Blob, options?: STTOptions): Promise<STTResult>;
  transcribeStream?(audio: ReadableStream<ArrayBuffer>, options?: STTOptions): AsyncGenerator<STTResult>;
}

let provider: STTProvider | null = null;

export async function getSTTProvider(): Promise<STTProvider> {
  if (provider) return provider;

  const sttProvider = process.env.STT_PROVIDER || "openai";

  switch (sttProvider) {
    case "openai": {
      const { OpenAIWhisperProvider } = await import("./whisper");
      provider = new OpenAIWhisperProvider();
      break;
    }
    default:
      throw new Error(`Unsupported STT provider: ${sttProvider}`);
  }

  logger.info("STT provider initialized", { provider: sttProvider });
  return provider;
}
