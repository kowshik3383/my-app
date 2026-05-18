"use client";

import { useState, useCallback, useRef } from "react";

export interface TranscriptEntry {
  id: string;
  text: string;
  isFinal: boolean;
  role: "user" | "assistant";
  timestamp: number;
}

interface UseRealtimeTranscriptReturn {
  transcripts: TranscriptEntry[];
  currentPartial: string;
  addPartial: (text: string) => void;
  addFinal: (text: string, role: "user" | "assistant") => void;
  addToken: (token: string) => void;
  clearTranscripts: () => void;
  latestUserText: string;
  latestAIText: string;
}

export function useRealtimeTranscript(): UseRealtimeTranscriptReturn {
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [currentPartial, setCurrentPartial] = useState("");
  const partialRef = useRef("");
  const currentAIText = useRef("");

  const addPartial = useCallback((text: string) => {
    partialRef.current = text;
    setCurrentPartial(text);
  }, []);

  const addFinal = useCallback(
    (text: string, role: "user" | "assistant") => {
      setCurrentPartial("");
      partialRef.current = "";

      const entry: TranscriptEntry = {
        id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text,
        isFinal: true,
        role,
        timestamp: Date.now(),
      };

      setTranscripts((prev) => [...prev, entry]);

      if (role === "assistant") {
        currentAIText.current = text;
      }
    },
    []
  );

  const addToken = useCallback((token: string) => {
    currentAIText.current += token;
    setCurrentPartial(currentAIText.current);
  }, []);

  const clearTranscripts = useCallback(() => {
    setTranscripts([]);
    setCurrentPartial("");
    partialRef.current = "";
    currentAIText.current = "";
  }, []);

  const latestUserText =
    [...transcripts]
      .reverse()
      .find((t) => t.role === "user" && t.isFinal)
      ?.text || "";

  const latestAIText = currentAIText.current;

  return {
    transcripts,
    currentPartial,
    addPartial,
    addFinal,
    addToken,
    clearTranscripts,
    latestUserText,
    latestAIText,
  };
}
