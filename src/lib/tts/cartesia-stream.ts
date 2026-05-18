import { logger } from "@/lib/observability/logging";
import type { TTSProvider, TTSChunk, TTSResult, TTSOptions } from "./index";

interface CartesiaConfig {
  apiKey: string;
  baseUrl: string;
}

interface CartesiaVoice {
  id: string;
  name: string;
}

const VOICE_MAP: Record<string, string> = {
  "sonic-2": "79eb38e3-6e90-40a9-a065-36fbfc502142",
  nova: "5714e97d-6a5f-4f8b-8e6e-7e3f8e7e3f8e",
  echo: "e3e7f8e7-3f8e-4e7e-8f3e-7e3f8e7e3f8e",
  ember: "f8e7e3f8-e7e3-4f8e-8e7e-3f8e7e3f8e7e",
  aura: "8e7e3f8e-7e3f-4e7e-8f3e-7e3f8e7e3f8e",
};

export class CartesiaTTSProvider implements TTSProvider {
  private config: CartesiaConfig;

  constructor() {
    this.config = {
      apiKey: process.env.CARTESIA_API_KEY || "",
      baseUrl: process.env.CARTESIA_BASE_URL || "https://api.cartesia.ai",
    };
  }

  async synthesize(text: string, options?: TTSOptions): Promise<TTSResult> {
    const voiceId = options?.voice ? VOICE_MAP[options.voice] : VOICE_MAP["sonic-2"];
    const response = await fetch(`${this.config.baseUrl}/v1/tts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.config.apiKey,
      },
      body: JSON.stringify({
        model: "sonic-2",
        voice: { mode: "id", id: voiceId },
        text,
        output_format: {
          container: "raw",
          encoding: "pcm_f32le",
          sample_rate: options?.sampleRate || 24000,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Cartesia TTS request failed", {
        status: response.status,
        error: errorText,
      });
      throw new Error(`Cartesia TTS failed: ${response.status}`);
    }

    const audio = await response.arrayBuffer();
    return { audio, format: "pcm16", duration: 0 };
  }

  async *synthesizeStream(
    text: string,
    options?: TTSOptions
  ): AsyncGenerator<TTSChunk> {
    const voiceId = options?.voice ? VOICE_MAP[options.voice] : VOICE_MAP["sonic-2"];
    const response = await fetch(`${this.config.baseUrl}/v1/tts/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.config.apiKey,
      },
      body: JSON.stringify({
        model: "sonic-2",
        voice: { mode: "id", id: voiceId },
        text,
        output_format: {
          container: "raw",
          encoding: "pcm_f32le",
          sample_rate: options?.sampleRate || 24000,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Cartesia TTS stream request failed", {
        status: response.status,
        error: errorText,
      });
      throw new Error(`Cartesia TTS stream failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body for TTS stream");

    const decoder = new TextDecoder();
    let buffer = "";
    let sequence = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        yield {
          audio: new ArrayBuffer(0),
          format: "pcm16",
          sequence,
          isFinal: true,
          duration: 0,
        };
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.audio) {
              const audioBuffer = Uint8Array.from(atob(data.audio), (c) =>
                c.charCodeAt(0)
              ).buffer;
              yield {
                audio: audioBuffer,
                format: "pcm16",
                sequence: sequence++,
                isFinal: false,
                duration: data.duration || 0,
              };
            }
          } catch {
            if (line.includes("[DONE]")) {
              yield {
                audio: new ArrayBuffer(0),
                format: "pcm16",
                sequence,
                isFinal: true,
                duration: 0,
              };
            }
          }
        }
      }
    }
  }
}
