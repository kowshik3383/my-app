// ElevenLabs Text-to-Speech Integration
import { stripEmotionTags } from "./lipsync";

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export async function generateVoice(
  text: string,
  voiceId: string = "EXAVITQu4vr4xnSDxMaL",
): Promise<string> {
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

  if (!ELEVENLABS_API_KEY) {
    console.warn(
      "ElevenLabs API key not configured. Skipping voice generation.",
    );
    return "";
  }

  // Strip emotion tags before sending to TTS — ElevenLabs speaks the raw text
  const cleanText = stripEmotionTags(text);
  if (!cleanText.trim()) return "";

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: "eleven_turbo_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.35,
            use_speaker_boost: true,
          },
        }),
      },
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs Error:", response.status, errorText);
      return "";
    }
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");
    return `data:audio/mpeg;base64,${base64Audio}`;
  } catch (error) {
    console.error("Error generating voice:", error);
    return "";
  }
}

// Voice IDs for different personalities
export const VOICE_IDS: Record<string, string> = {
  soft_caring: "EXAVITQu4vr4xnSDxMaL", // Sarah — warm, caring female
  strict_motivational: "pNInz6obpgDQGcFmaJgB", // Adam — strong, authoritative
  professional: "21m00Tcm4TlvDq8ikWAM", // Rachel — professional, clear
  energetic: "AZnzlk1XvdvUeBnXmlld", // Domi — energetic, dynamic
  calm: "ThT5KcBeYPX3keUQqHPh", // Dorothy — calm, soothing
};
