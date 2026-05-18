import OpenAI from "openai";
import type { STTProvider, STTResult, STTOptions } from "./index";

export class OpenAIWhisperProvider implements STTProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY,
    });
  }

  async transcribe(audio: ArrayBuffer | Blob, options?: STTOptions): Promise<STTResult> {
    const blob = audio instanceof Blob ? audio : new Blob([audio], { type: "audio/wav" });
    const file = new File([blob], "audio.wav", { type: "audio/wav" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("model", process.env.STT_MODEL || "whisper-1");
    formData.append("response_format", "verbose_json");

    if (options?.language) formData.append("language", options.language);
    if (options?.prompt) formData.append("prompt", options.prompt);

    const response = await this.client.audio.transcriptions.create({
      file,
      model: process.env.STT_MODEL || "whisper-1",
      response_format: "verbose_json",
      language: options?.language as any,
    });

    return {
      text: response.text,
      isFinal: true,
      confidence: 1,
      segments: response.segments?.map((s: any) => ({
        text: s.text,
        start: s.start,
        end: s.end,
        confidence: s.confidence || 0,
      })),
    };
  }
}
