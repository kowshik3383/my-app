"use client";

import { useState, useRef, useCallback } from "react";
import { AudioPlaybackQueue, JitterBuffer } from "@/lib/realtime/jitter-buffer";

interface UseAudioPlaybackOptions {
  sampleRate?: number;
  jitterTarget?: number;
}

interface UseAudioPlaybackReturn {
  isPlaying: boolean;
  enqueueAudio: (audio: ArrayBuffer, sampleRate: number, sequence: number) => void;
  enqueueFloat32: (audio: Float32Array, sampleRate: number, sequence: number) => void;
  stopPlayback: () => void;
  clearQueue: () => void;
  setVolume: (volume: number) => void;
  currentTime: number;
  jitterSize: number;
  queueSize: number;
  init: () => Promise<void>;
}

export function useAudioPlayback(
  options: UseAudioPlaybackOptions = {}
): UseAudioPlaybackReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [jitterSize, setJitterSize] = useState(0);
  const [queueSize, setQueueSize] = useState(0);

  const playbackRef = useRef<AudioPlaybackQueue | null>(null);
  const jitterRef = useRef<JitterBuffer | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const init = useCallback(async () => {
    const playback = new AudioPlaybackQueue();
    await playback.init(options.sampleRate || 24000);
    playbackRef.current = playback;

    jitterRef.current = new JitterBuffer(options.jitterTarget || 3);

    intervalRef.current = setInterval(() => {
      if (playbackRef.current) {
        setCurrentTime(playbackRef.current.currentTime);
      }
      if (jitterRef.current) {
        setJitterSize(jitterRef.current.size);
        setQueueSize(jitterRef.current.size);
      }
    }, 100);
  }, [options.sampleRate, options.jitterTarget]);

  const enqueueAudio = useCallback(
    (audio: ArrayBuffer, sampleRate: number, sequence: number) => {
      if (!playbackRef.current || !jitterRef.current) return;

      jitterRef.current.push(audio);
      setJitterSize(jitterRef.current.size);

      if (jitterRef.current.isReady) {
        const chunk = jitterRef.current.pop();
        if (chunk) {
          playbackRef.current.enqueue(chunk, sampleRate, sequence);
          setIsPlaying(true);
          setQueueSize(jitterRef.current.size);
        }
      }
    },
    []
  );

  const enqueueFloat32 = useCallback(
    (audio: Float32Array, sampleRate: number, sequence: number) => {
      if (!playbackRef.current) return;
      playbackRef.current.enqueueFloat32(audio, sampleRate, sequence);
      setIsPlaying(true);
    },
    []
  );

  const stopPlayback = useCallback(() => {
    playbackRef.current?.stop();
    jitterRef.current?.clear();
    setIsPlaying(false);
    setJitterSize(0);
    setQueueSize(0);
  }, []);

  const clearQueue = useCallback(() => {
    if (playbackRef.current) {
      playbackRef.current.clear();
      playbackRef.current = null;
    }
    jitterRef.current = null;
    setIsPlaying(false);
    setJitterSize(0);
    setQueueSize(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    playbackRef.current?.setVolume(volume);
  }, []);

  return {
    isPlaying,
    enqueueAudio,
    enqueueFloat32,
    stopPlayback,
    clearQueue,
    setVolume,
    currentTime,
    jitterSize,
    queueSize,
    init,
  };
}
