import { logger } from "@/lib/observability/logging";
import type { TTSProvider, TTSChunk, TTSResult, TTSOptions } from "./index";

const ELEVENLABS_VOICE_MAP: Record<string, string> = {
  nova: "21m00Tcm4TlvDq8ikWAM",
  echo: "ODq5zmih8GrVK37lNYTR",
  ember: "EXAVITQu4vrRVxn0SREk",
  aura: "XrExE9ZS9iWWlihGsgzq",
};

export class ElevenLabsTTSProvider implements TTSProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || "";
  }

  async synthesize(text: string, options?: TTSOptions): Promise<TTSResult> {
    const voiceId = options?.voice
      ? ELEVENLABS_VOICE_MAP[options.voice]
      : ELEVENLABS_VOICE_MAP.nova;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": this.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs TTS failed: ${response.status} ${errorText}`);
    }

    const audio = await response.arrayBuffer();
    return { audio, format: "mp3", duration: 0 };
  }

  async *synthesizeStream(
    text: string,
    options?: TTSOptions
  ): AsyncGenerator<TTSChunk> {
    const result = await this.synthesize(text, options);
    yield {
      audio: result.audio,
      format: "mp3",
      sequence: 0,
      isFinal: true,
      duration: result.duration,
    };
  }
}
