"use client";

import { useState, useRef, useCallback } from "react";

export interface UseVoiceRecordingOptions {
  language?: string;
  onBargeIn?: () => void; // called when user speaks while avatar is speaking
}

export interface UseVoiceRecordingReturn {
  isRecording: boolean;
  transcript: string;
  startRecording: () => void;
  stopRecording: () => void;
  error: string | null;
}

const LANG_MAP: Record<string, string> = {
  en: "en-US",
  hi: "hi-IN",
  ta: "ta-IN",
  te: "te-IN",
  bn: "bn-IN",
};

export function useVoiceRecording(
  options: UseVoiceRecordingOptions = {}
): UseVoiceRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const hasSpokenRef = useRef(false);

  const langCode = LANG_MAP[options.language || "en"] || "en-US";

  const startRecording = useCallback(() => {
    setError(null);
    setTranscript("");
    hasSpokenRef.current = false;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in your browser");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = langCode;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += t + " ";
          } else {
            interimTranscript += t;
          }
        }

        const combined = finalTranscript || interimTranscript;
        setTranscript(combined);

        // Barge-in detection: first speech result triggers interrupt callback
        if (!hasSpokenRef.current && combined.trim().length > 0) {
          hasSpokenRef.current = true;
          options.onBargeIn?.();
        }
      };

      recognition.onerror = (event: any) => {
        // no-speech is not a real error
        if (event.error !== "no-speech") {
          console.error("Speech recognition error:", event.error);
          setError(`Error: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error("Error starting speech recognition:", err);
      setError("Failed to start speech recognition");
    }
  }, [langCode, options]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }, []);

  return {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
    error,
  };
}
