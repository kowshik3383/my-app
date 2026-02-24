import { NextRequest, NextResponse } from "next/server";
import { VOICE_CATALOG, getVoicesForLanguage } from "@/lib/elevenlabs";

/** GET /api/voice/list?lang=en — list available voices for a language */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") || "en";
    const tone = searchParams.get("tone"); // optional filter
    const gender = searchParams.get("gender"); // optional filter

    let voices = getVoicesForLanguage(lang);

    if (tone) {
      voices = voices.filter((v) => v.tone === tone);
    }

    if (gender) {
      voices = voices.filter((v) => v.gender === gender);
    }

    return NextResponse.json({ voices });
  } catch (error) {
    console.error("Error fetching voices:", error);
    return NextResponse.json({ error: "Failed to fetch voices" }, { status: 500 });
  }
}
