// ElevenLabs Text-to-Speech Integration with full voice catalog

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
}

export interface VoiceInfo {
  id: string;
  name: string;
  gender: "male" | "female" | "neutral";
  style: string;
  tone: "warm" | "professional" | "energetic" | "calm";
  speakingSpeed: "slow" | "normal" | "fast";
  recommendedFor: string[];
  languages: string[];
  previewText: string;
  description: string;
}

// ─── Curated Voice Catalog ─────────────────────────────────────────────────────
export const VOICE_CATALOG: VoiceInfo[] = [
  {
    id: "21m00Tcm4TlvDq8ikWAM",
    name: "Rachel",
    gender: "female",
    style: "conversational",
    tone: "warm",
    speakingSpeed: "normal",
    recommendedFor: ["companion", "coach", "friend", "sister"],
    languages: ["en"],
    previewText: "Hi! I'm here to support you on your health journey. Let's do this together.",
    description: "Warm, conversational female voice. Great for everyday companionship.",
  },
  {
    id: "AZnzlk1XvdvUeBnXmlld",
    name: "Domi",
    gender: "female",
    style: "energetic",
    tone: "energetic",
    speakingSpeed: "fast",
    recommendedFor: ["coach", "energetic", "motivational"],
    languages: ["en"],
    previewText: "Let's do this! You have everything you need to achieve your goals today!",
    description: "Upbeat, energetic female voice. Perfect for motivation and coaching.",
  },
  {
    id: "EXAVITQu4vr4xnSDxMaL",
    name: "Bella",
    gender: "female",
    style: "soft",
    tone: "calm",
    speakingSpeed: "slow",
    recommendedFor: ["mother", "grandparent", "soft_caring", "mental_health"],
    languages: ["en"],
    previewText: "Don't worry, I'm right here with you. Let's take this one step at a time.",
    description: "Gentle, soothing female voice. Ideal for calming and caring conversations.",
  },
  {
    id: "ErXwobaYiN019PkySvjV",
    name: "Antoni",
    gender: "male",
    style: "conversational",
    tone: "warm",
    speakingSpeed: "normal",
    recommendedFor: ["brother", "friend", "companion"],
    languages: ["en"],
    previewText: "Hey, I've got your back. We're in this together, and we'll figure it out.",
    description: "Friendly, warm male voice. Great for casual, supportive conversations.",
  },
  {
    id: "MF3mGyEYCl7XYWbV9V6O",
    name: "Elli",
    gender: "female",
    style: "professional",
    tone: "professional",
    speakingSpeed: "normal",
    recommendedFor: ["doctor", "professional", "evidence-based"],
    languages: ["en"],
    previewText: "Based on the evidence, here's what I recommend for your health journey.",
    description: "Clear, professional female voice. Perfect for medical or clinical conversations.",
  },
  {
    id: "TxGEqnHWrfWFTfGW9XjX",
    name: "Josh",
    gender: "male",
    style: "deep",
    tone: "warm",
    speakingSpeed: "normal",
    recommendedFor: ["father", "coach", "strict_motivational"],
    languages: ["en"],
    previewText: "I'm proud of the effort you're putting in every day. Keep pushing forward.",
    description: "Deep, warm male voice. Ideal for fatherly or mentoring conversations.",
  },
  {
    id: "VR6AewLTigWG4xSOukaG",
    name: "Arnold",
    gender: "male",
    style: "motivational",
    tone: "energetic",
    speakingSpeed: "normal",
    recommendedFor: ["coach", "strict_motivational", "energetic"],
    languages: ["en"],
    previewText: "No excuses! You have the power to change your life starting right now.",
    description: "Bold, authoritative male voice. Best for intense motivation and accountability.",
  },
  {
    id: "pNInz6obpgDQGcFmaJgB",
    name: "Adam",
    gender: "male",
    style: "authoritative",
    tone: "professional",
    speakingSpeed: "normal",
    recommendedFor: ["doctor", "father", "professional"],
    languages: ["en"],
    previewText: "Let me provide you with clear, evidence-based guidance for your health today.",
    description: "Authoritative, clear male voice. Perfect for professional health guidance.",
  },
  {
    id: "yoZ06aMxZJJ28mfd3POQ",
    name: "Sam",
    gender: "male",
    style: "calm",
    tone: "calm",
    speakingSpeed: "slow",
    recommendedFor: ["mental_health", "calm", "friend"],
    languages: ["en"],
    previewText: "Take a deep breath with me. I'm here, and we'll work through this at your pace.",
    description: "Calm, reassuring male voice. Excellent for mental health and stress relief.",
  },
];

// ─── Modulation → Default Voice Map ───────────────────────────────────────────
export const VOICE_IDS: Record<string, string> = {
  soft_caring: "EXAVITQu4vr4xnSDxMaL", // Bella
  strict_motivational: "VR6AewLTigWG4xSOukaG", // Arnold
  professional: "pNInz6obpgDQGcFmaJgB", // Adam
  energetic: "AZnzlk1XvdvUeBnXmlld", // Domi
  calm: "yoZ06aMxZJJ28mfd3POQ", // Sam
  default: "21m00Tcm4TlvDq8ikWAM", // Rachel
};

// ─── Language-Based Voice Filter ──────────────────────────────────────────────
export function getVoicesForLanguage(language: string): VoiceInfo[] {
  // ElevenLabs supports all voices across languages (multilingual model)
  // Filter by explicit language support or return all as they support multilingual
  const langCode = language.split("-")[0].toLowerCase();
  const langSpecific = VOICE_CATALOG.filter((v) => v.languages.includes(langCode));
  return langSpecific.length > 0 ? langSpecific : VOICE_CATALOG;
}

export function getVoiceById(voiceId: string): VoiceInfo | undefined {
  return VOICE_CATALOG.find((v) => v.id === voiceId);
}

// ─── TTS Generation ────────────────────────────────────────────────────────────
export async function generateVoice(
  text: string,
  voiceId: string = "21m00Tcm4TlvDq8ikWAM"
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
          model_id: "eleven_flash_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`ElevenLabs API error ${response.status}: ${text}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");
    return `data:audio/mpeg;base64,${base64Audio}`;
  } catch (error) {
    console.error("Error generating voice:", error);
    return "";
  }
}

/** Preview a voice with a short sample text */
export async function generateVoicePreview(voiceId: string): Promise<string> {
  const voice = getVoiceById(voiceId);
  const previewText = voice?.previewText || "Hello! This is how I sound when I speak with you.";
  return generateVoice(previewText, voiceId);
}
