"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { AudioContextManager } from "@/lib/realtime/audio-context";
import { SimpleVAD } from "@/lib/vad";

interface UseMicrophoneStreamOptions {
  onAudioData?: (audio: Float32Array) => void;
  onVADChange?: (speaking: boolean, level: number) => void;
  vadThreshold?: number;
}

interface UseMicrophoneStreamReturn {
  isReady: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  mute: () => void;
  unmute: () => void;
  isMuted: boolean;
  analyserData: { frequency: Uint8Array; timeDomain: Uint8Array };
}

export function useMicrophoneStream(
  options: UseMicrophoneStreamOptions = {}
): UseMicrophoneStreamReturn {
  const [isReady, setIsReady] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [analyserData, setAnalyserData] = useState<{
    frequency: Uint8Array;
    timeDomain: Uint8Array;
  }>({ frequency: new Uint8Array(0), timeDomain: new Uint8Array(0) });

  const audioManagerRef = useRef<AudioContextManager | null>(null);
  const vadRef = useRef<SimpleVAD | null>(null);
  const animFrameRef = useRef<number>(0);

  const start = useCallback(async () => {
    const manager = new AudioContextManager();
    await manager.init();
    audioManagerRef.current = manager;

    const vad = new SimpleVAD(options.vadThreshold || 0.02);
    vadRef.current = vad;

    manager.setOnAudioData((audio) => {
      if (!vadRef.current) return;
      const result = vadRef.current.processAudio(audio);
      setIsSpeaking(result.speaking);
      setAudioLevel(result.audioLevel);
      options.onVADChange?.(result.speaking, result.audioLevel);
      options.onAudioData?.(audio);
    });

    setIsReady(true);

    const updateAnalyser = () => {
      if (!audioManagerRef.current) return;
      const data = audioManagerRef.current.getAnalyserData();
      setAnalyserData(data);
      animFrameRef.current = requestAnimationFrame(updateAnalyser);
    };
    animFrameRef.current = requestAnimationFrame(updateAnalyser);
  }, [options]);

  const stop = useCallback(async () => {
    cancelAnimationFrame(animFrameRef.current);
    await audioManagerRef.current?.destroy();
    audioManagerRef.current = null;
    vadRef.current = null;
    setIsReady(false);
    setIsSpeaking(false);
    setAudioLevel(0);
    setIsMuted(false);
  }, []);

  const mute = useCallback(() => {
    audioManagerRef.current?.setMuted(true);
    setIsMuted(true);
  }, []);

  const unmute = useCallback(() => {
    audioManagerRef.current?.setMuted(false);
    setIsMuted(false);
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      audioManagerRef.current?.destroy().catch(() => {});
    };
  }, []);

  return {
    isReady,
    isSpeaking,
    audioLevel,
    start,
    stop,
    mute,
    unmute,
    isMuted,
    analyserData,
  };
}
