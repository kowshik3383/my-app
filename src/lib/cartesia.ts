type Voice = "soft_caring" | "strict_motivational" | "professional" | "energetic" | "calm";

interface CartesiaVoice {
  id: string;
  name: string;
}

const VOICE_MAPPING: Record<Voice, CartesiaVoice> = {
  soft_caring: {
    id: "694f9389-aac1-45b6-b726-9d9369183238", // Warm Female
    name: "Soft Caring",
  },
  strict_motivational: {
    id: "a0e99841-438c-4a64-b679-ae501e7d6091", // Male Assistant
    name: "Strict Motivational",
  },
  professional: {
    id: "b7d50908-b17c-422d-ad8d-810c63997ed9", // Professional Female
    name: "Professional",
  },
  energetic: {
    id: "694f9389-aac1-45b6-b726-9d9369183238", // Warm Female
    name: "Energetic",
  },
  calm: {
    id: "b7d50908-b17c-422d-ad8d-810c63997ed9", // Professional Female
    name: "Calm",
  },
};

export async function generateCartesiaAudio(
  text: string,
  voice: Voice
): Promise<string> {
  const apiKey = process.env.CARTESIA_API_KEY || process.env.NEXT_PUBLIC_CARTESIA_API_KEY;
  if (!apiKey) {
    throw new Error("CARTESIA_API_KEY is not set");
  }

  const voiceConfig = VOICE_MAPPING[voice];
  if (!voiceConfig) {
    throw new Error(`Unknown voice: ${voice}`);
  }

  const response = await fetch("https://api.cartesia.ai/tts/bytes", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Cartesia-Version": "2026-03-01",
    },
    body: JSON.stringify({
      model_id: "sonic-2",
      transcript: text,
      voice: {
        mode: "id",
        id: voiceConfig.id,
      },
      output_format: {
        container: "mp3",
        encoding: "mp3",
        sample_rate: 44100,
      },
    }),
  });

  // Log the response for debugging
  console.log("Cartesia API response status:", response.status);
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Cartesia API error response:", errorText);
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Cartesia API error response:", errorText);
    throw new Error(`Cartesia API error: ${response.status}`);
  }

  const audioBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(audioBuffer).toString("base64");
  
  return `data:audio/mpeg;base64,${base64}`;
}
