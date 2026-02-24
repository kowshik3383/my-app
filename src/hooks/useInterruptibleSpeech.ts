"use client";

/**
 * Interruptible Speech Hook
 * Full-duplex conversation with barge-in detection and <150ms interrupt latency
 */

import { useCallback, useRef, useState, useEffect } from "react";
import {
  createInterruptiblePlayer,
  stopAllSpeech,
  getSpeechState,
  type SpeechState,
  type BrowserVoiceOptions,
} from "@/lib/browserVoice";

export interface InterruptibleSpeechOptions {
  onInterrupt?: (progress: number) => void; // called with playback progress 0-1
  onEnd?: () => void;
  onStart?: () => void;
}

export interface UseInterruptibleSpeechReturn {
  speechState: SpeechState;
  isSpeaking: boolean;
  playText: (text: string, audio?: string, options?: BrowserVoiceOptions) => Promise<void>;
  interrupt: () => void;  // <150ms target
  stop: () => void;
  resetAfterInterrupt: () => void;
}

export function useInterruptibleSpeech(
  opts: InterruptibleSpeechOptions = {}
): UseInterruptibleSpeechReturn {
  const [speechState, setSpeechState] = useState<SpeechState>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerRef = useRef(createInterruptiblePlayer());
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const interruptTargetMs = 100; // target <150ms

  const isSpeaking = speechState === "speaking";

  // ─── Play with ElevenLabs audio (preferred) or browser TTS (fallback) ────────
  const playText = useCallback(
    async (text: string, audioBase64?: string, options: BrowserVoiceOptions = {}) => {
      // Stop any current playback immediately
      stopAllSpeech();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setSpeechState("speaking");
      startTimeRef.current = performance.now();
      opts.onStart?.();

      if (audioBase64) {
        // ── ElevenLabs audio path ──
        return new Promise<void>((resolve) => {
          const audio = new Audio("data:audio/mp3;base64," + audioBase64);
          audioRef.current = audio;
          durationRef.current = 0;

          audio.onloadedmetadata = () => {
            durationRef.current = audio.duration;
          };

          audio.onended = () => {
            audioRef.current = null;
            setSpeechState("idle");
            opts.onEnd?.();
            resolve();
          };

          audio.onerror = () => {
            // Fallback to browser TTS on audio error
            audioRef.current = null;
            playerRef.current
              .play(text, options)
              .then(() => {
                setSpeechState("idle");
                opts.onEnd?.();
                resolve();
              })
              .catch(() => {
                setSpeechState("idle");
                resolve();
              });
          };

          audio.play().catch(() => {
            // Fallback to browser TTS
            audioRef.current = null;
            playerRef.current
              .play(text, options)
              .then(() => {
                setSpeechState("idle");
                opts.onEnd?.();
                resolve();
              })
              .catch(() => {
                setSpeechState("idle");
                resolve();
              });
          });
        });
      } else {
        // ── Browser TTS path ──
        return playerRef.current
          .play(text, options)
          .then(() => {
            setSpeechState("idle");
            opts.onEnd?.();
          })
          .catch(() => {
            setSpeechState("idle");
          });
      }
    },
    [opts]
  );

  // ─── Interrupt: <150ms target ─────────────────────────────────────────────────
  const interrupt = useCallback(() => {
    const interruptStart = performance.now();

    // Calculate progress at time of interrupt
    let progress = 0;
    if (audioRef.current && durationRef.current > 0) {
      progress = audioRef.current.currentTime / durationRef.current;
    } else if (startTimeRef.current > 0) {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      progress = Math.min(1, elapsed / 3); // assume ~3s avg
    }

    // Immediate stop — native browser API, effectively synchronous
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    stopAllSpeech(); // also cancels any browser TTS

    setSpeechState("interrupted");
    opts.onInterrupt?.(progress);

    const elapsed = performance.now() - interruptStart;
    if (process.env.NODE_ENV === "development") {
      console.log(`[SpeechInterrupt] Interrupt latency: ${elapsed.toFixed(2)}ms`);
    }
  }, [opts]);

  // ─── Stop completely ───────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    stopAllSpeech();
    setSpeechState("idle");
    opts.onEnd?.();
  }, [opts]);

  const resetAfterInterrupt = useCallback(() => {
    setSpeechState("idle");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      stopAllSpeech();
    };
  }, []);

  return {
    speechState,
    isSpeaking,
    playText,
    interrupt,
    stop,
    resetAfterInterrupt,
  };
}
