// ElevenLabs Text-to-Speech Integration
// Note: This is a simplified version. For production, use the official ElevenLabs SDK

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
}

export async function generateVoice(
  text: string,
  voiceId: string = "21m00Tcm4TlvDq8ikWAM" // Default voice ID (Rachel)
): Promise<string> {
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

  if (!ELEVENLABS_API_KEY) {
    console.warn("ElevenLabs API key not configured. Skipping voice generation.");
    return "";
  }

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
          text,
          model_id: "eleven_turbo_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
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
export const VOICE_IDS = {
  soft_caring: "EXAVITQu4vr4xnSDxMaL", // Rachel - warm female voice
  strict_motivational: "EXAVITQu4vr4xnSDxMaL", // Arnold - authoritative male voice
  professional: "EXAVITQu4vr4xnSDxMaL", // Adam - professional male voice
  energetic: "EXAVITQu4vr4xnSDxMaL", // Bella - energetic female voice
  calm: "EXAVITQu4vr4xnSDxMaL", // Dorothy - calm elderly female voice
};
