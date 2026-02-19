import { NextRequest, NextResponse } from "next/server";
import { generateVoice, VOICE_IDS } from "@/lib/elevenlabs";

export async function POST(request: NextRequest) {
  try {
    const { text, modulation } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const voiceId = modulation ? VOICE_IDS[modulation as keyof typeof VOICE_IDS] : VOICE_IDS.professional;
    const audioUrl = await generateVoice(text, voiceId);

    return NextResponse.json({ audioUrl });
  } catch (error) {
    console.error("Error generating voice:", error);
    return NextResponse.json(
      { error: "Failed to generate voice" },
      { status: 500 }
    );
  }
}
