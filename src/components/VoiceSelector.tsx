"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, Check, Loader2, Mic2 } from "lucide-react";
import type { VoiceInfo } from "@/lib/elevenlabs";
import { getBrowserVoices, stopAllSpeech } from "@/lib/browserVoice";

interface VoiceSelectorProps {
  selectedVoiceId?: string;
  language?: string;
  onSelect: (voiceId: string) => void;
  showTitle?: boolean;
}

const TONE_COLORS: Record<string, string> = {
  warm:         "bg-amber-100 text-amber-700 border-amber-200",
  professional: "bg-blue-100 text-blue-700 border-blue-200",
  energetic:    "bg-green-100 text-green-700 border-green-200",
  calm:         "bg-purple-100 text-purple-700 border-purple-200",
};

const TONE_EMOJI: Record<string, string> = {
  warm: "🌟", professional: "💼", energetic: "⚡", calm: "🌊",
};

export default function VoiceSelector({
  selectedVoiceId,
  language = "en",
  onSelect,
  showTitle = true,
}: VoiceSelectorProps) {
  const [voices, setVoices] = useState<VoiceInfo[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(true);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [toneFilter, setToneFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [hasElevenLabs, setHasElevenLabs] = useState(true);

  // Load voices from API
  useEffect(() => {
    setLoadingVoices(true);
    fetch(`/api/voice/list?lang=${language}`)
      .then((r) => r.json())
      .then(({ voices: v }) => {
        setVoices(v || []);
        setLoadingVoices(false);
      })
      .catch(() => setLoadingVoices(false));
  }, [language]);

  const filteredVoices = voices.filter((v) => {
    const toneOk = toneFilter === "all" || v.tone === toneFilter;
    const genderOk = genderFilter === "all" || v.gender === genderFilter;
    return toneOk && genderOk;
  });

  // Preview a voice
  const handlePreview = useCallback(
    async (voice: VoiceInfo, e: React.MouseEvent) => {
      e.stopPropagation();

      if (previewingId === voice.id) {
        stopAllSpeech();
        setPreviewingId(null);
        return;
      }

      stopAllSpeech();
      setPreviewingId(voice.id);
      setPreviewError(null);

      try {
        const res = await fetch("/api/voice/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voiceId: voice.id }),
        });
        const data = await res.json();

        if (data.audioBase64) {
          const audio = new Audio("data:audio/mp3;base64," + data.audioBase64);
          audio.onended = () => setPreviewingId(null);
          audio.onerror = () => {
            // Fallback to browser TTS
            playBrowserPreview(voice.previewText, () => setPreviewingId(null));
          };
          await audio.play();
        } else {
          setHasElevenLabs(false);
          // Browser TTS preview
          playBrowserPreview(voice.previewText, () => setPreviewingId(null));
        }
      } catch {
        setHasElevenLabs(false);
        playBrowserPreview(voice.previewText, () => setPreviewingId(null));
      }
    },
    [previewingId]
  );

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Choose Your Avatar's Voice</h3>
          <p className="text-sm text-gray-500">Preview each voice and pick the one that feels right</p>
          {!hasElevenLabs && (
            <p className="mt-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full inline-block">
              🔊 Using browser voice preview (ElevenLabs not configured)
            </p>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 justify-center">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
          {["all", "warm", "professional", "energetic", "calm"].map((t) => (
            <button
              key={t}
              onClick={() => setToneFilter(t)}
              className={`px-3 py-1.5 capitalize transition-colors ${
                toneFilter === t
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t === "all" ? "All Tones" : `${TONE_EMOJI[t]} ${t}`}
            </button>
          ))}
        </div>

        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
          {["all", "female", "male"].map((g) => (
            <button
              key={g}
              onClick={() => setGenderFilter(g)}
              className={`px-3 py-1.5 capitalize transition-colors ${
                genderFilter === g
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {g === "all" ? "All" : g === "female" ? "♀ Female" : "♂ Male"}
            </button>
          ))}
        </div>
      </div>

      {/* Voice grid */}
      {loadingVoices ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-green-500" />
          <span className="ml-2 text-sm text-gray-500">Loading voices...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredVoices.map((voice) => {
            const isSelected = selectedVoiceId === voice.id;
            const isPreviewing = previewingId === voice.id;

            return (
              <button
                key={voice.id}
                onClick={() => onSelect(voice.id)}
                className={`relative p-4 rounded-xl border-2 text-left transition-all hover:shadow-md group ${
                  isSelected
                    ? "border-green-500 bg-green-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-green-300"
                }`}
              >
                {/* Selected badge */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}

                {/* Voice header */}
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isSelected ? "bg-green-500 text-white" : "bg-gray-100 text-gray-700"
                  }`}>
                    {voice.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{voice.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{voice.gender}</p>
                  </div>
                </div>

                {/* Tone badge */}
                <div className="flex items-center gap-1.5 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${TONE_COLORS[voice.tone]}`}>
                    {TONE_EMOJI[voice.tone]} {voice.tone}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                    voice.speakingSpeed === "fast" ? "bg-orange-100 text-orange-700 border-orange-200" :
                    voice.speakingSpeed === "slow" ? "bg-indigo-100 text-indigo-700 border-indigo-200" :
                    "bg-gray-100 text-gray-600 border-gray-200"
                  }`}>
                    {voice.speakingSpeed === "fast" ? "⚡" : voice.speakingSpeed === "slow" ? "🐢" : "🚶"}{" "}
                    {voice.speakingSpeed}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{voice.description}</p>

                {/* Preview button */}
                <div
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                    isPreviewing
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700"
                  }`}
                  onClick={(e) => handlePreview(voice, e)}
                >
                  {isPreviewing ? (
                    <><Pause className="w-3.5 h-3.5" /> Stop</>
                  ) : (
                    <><Play className="w-3.5 h-3.5" /> Preview</>
                  )}
                </div>

                {/* Waveform animation when previewing */}
                {isPreviewing && (
                  <div className="absolute bottom-2 right-3 flex items-end gap-0.5 h-4">
                    {[1, 2, 3, 2, 1].map((h, i) => (
                      <div
                        key={i}
                        className="w-0.5 bg-green-500 rounded-full animate-pulse"
                        style={{
                          height: `${h * 4}px`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Browser TTS preview helper ────────────────────────────────────────────────
function playBrowserPreview(text: string, onEnd: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onEnd();
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  window.speechSynthesis.speak(utterance);
}
