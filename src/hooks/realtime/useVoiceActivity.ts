"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UseVoiceActivityOptions {
  threshold?: number;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
}

interface UseVoiceActivityReturn {
  isSpeaking: boolean;
  audioLevel: number;
  speakingDuration: number;
  silenceDuration: number;
  updateAudioLevel: (level: number) => void;
  reset: () => void;
}

export function useVoiceActivity(
  options: UseVoiceActivityOptions = {}
): UseVoiceActivityReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [speakingDuration, setSpeakingDuration] = useState(0);
  const [silenceDuration, setSilenceDuration] = useState(0);

  const speakingRef = useRef(false);
  const speakingStartRef = useRef<number | null>(null);
  const silenceStartRef = useRef<number>(Date.now());
  const threshold = options.threshold ?? 0.02;

  const updateAudioLevel = useCallback(
    (level: number) => {
      setAudioLevel(level);

      if (level > threshold) {
        if (!speakingRef.current) {
          speakingRef.current = true;
          setIsSpeaking(true);
          speakingStartRef.current = Date.now();
          options.onSpeechStart?.();
        }
        setSilenceDuration(0);
        if (speakingStartRef.current) {
          setSpeakingDuration(Date.now() - speakingStartRef.current);
        }
      } else {
        if (speakingRef.current) {
          const silenceMs = Date.now() - (speakingStartRef.current || Date.now());
          if (silenceMs > 500) {
            speakingRef.current = false;
            setIsSpeaking(false);
            speakingStartRef.current = null;
            silenceStartRef.current = Date.now();
            options.onSpeechEnd?.();
          }
          setSilenceDuration(silenceMs);
        }
      }
    },
    [threshold, options]
  );

  const reset = useCallback(() => {
    speakingRef.current = false;
    setIsSpeaking(false);
    setAudioLevel(0);
    setSpeakingDuration(0);
    setSilenceDuration(0);
    speakingStartRef.current = null;
    silenceStartRef.current = Date.now();
  }, []);

  return {
    isSpeaking,
    audioLevel,
    speakingDuration,
    silenceDuration,
    updateAudioLevel,
    reset,
  };
}
