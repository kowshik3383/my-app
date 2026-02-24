import { NextRequest, NextResponse } from "next/server";
import { generateVoicePreview, getVoiceById, VOICE_CATALOG } from "@/lib/elevenlabs";

/** POST /api/voice/preview — generate preview audio for a voice */
export async function POST(request: NextRequest) {
  try {
    const { voiceId } = await request.json();

    if (!voiceId) {
      return NextResponse.json({ error: "voiceId is required" }, { status: 400 });
    }

    const voice = getVoiceById(voiceId);
    if (!voice) {
      return NextResponse.json({ error: "Voice not found" }, { status: 404 });
    }

    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    console.log(process.env.ELEVENLABS_API_KEY)
    if (!ELEVENLABS_API_KEY) {
      // Return voice metadata without audio when no API key
      return NextResponse.json({
        voice,
        audioBase64: null,
        message: "ElevenLabs API key not configured. Preview unavailable.",
      });
    }

    const audioDataUrl = await generateVoicePreview(voiceId);
    const audioBase64 = audioDataUrl ? audioDataUrl.split(",")[1] : null;

    return NextResponse.json({ voice, audioBase64 });
  } catch (error) {
    console.error("Error generating voice preview:", error);
    return NextResponse.json({ error: "Failed to generate preview" }, { status: 500 });
  }
}
