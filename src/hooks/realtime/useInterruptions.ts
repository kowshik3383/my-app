"use client";

import { useState, useCallback, useRef } from "react";

interface UseInterruptionsOptions {
  onInterrupt?: () => void;
  cooldownMs?: number;
}

interface UseInterruptionsReturn {
  isInterrupted: boolean;
  lastInterruptAt: number | null;
  interruptCount: number;
  triggerInterrupt: () => void;
  resetInterrupt: () => void;
  checkAndInterrupt: (isUserSpeaking: boolean) => boolean;
}

export function useInterruptions(
  options: UseInterruptionsOptions = {}
): UseInterruptionsReturn {
  const [isInterrupted, setIsInterrupted] = useState(false);
  const [lastInterruptAt, setLastInterruptAt] = useState<number | null>(null);
  const [interruptCount, setInterruptCount] = useState(0);

  const cooldownRef = useRef(false);
  const cooldownMs = options.cooldownMs ?? 1000;

  const triggerInterrupt = useCallback(() => {
    if (cooldownRef.current) return;

    cooldownRef.current = true;
    setTimeout(() => {
      cooldownRef.current = false;
    }, cooldownMs);

    setIsInterrupted(true);
    setLastInterruptAt(Date.now());
    setInterruptCount((c) => c + 1);
    options.onInterrupt?.();
  }, [cooldownMs, options]);

  const resetInterrupt = useCallback(() => {
    setIsInterrupted(false);
  }, []);

  const checkAndInterrupt = useCallback(
    (isUserSpeaking: boolean): boolean => {
      if (isUserSpeaking && !isInterrupted) {
        triggerInterrupt();
        return true;
      }
      return false;
    },
    [isInterrupted, triggerInterrupt]
  );

  return {
    isInterrupted,
    lastInterruptAt,
    interruptCount,
    triggerInterrupt,
    resetInterrupt,
    checkAndInterrupt,
  };
}
