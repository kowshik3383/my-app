"use client";

import { useRef, useEffect } from "react";
import type { TranscriptEntry } from "@/hooks/realtime/useRealtimeTranscript";

interface TranscriptPanelProps {
  transcripts: TranscriptEntry[];
  currentPartial: string;
  isUserSpeaking?: boolean;
  isAISpeaking?: boolean;
  maxHeight?: number;
}

export function TranscriptPanel({
  transcripts,
  currentPartial,
  isUserSpeaking = false,
  isAISpeaking = false,
  maxHeight = 200,
}: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts, currentPartial]);

  const recentTranscripts = transcripts.slice(-10);

  return (
    <div
      ref={scrollRef}
      style={{
        maxHeight,
        overflowY: "auto",
        padding: "0 4px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {recentTranscripts.length === 0 && !currentPartial && (
        <div
          style={{
            textAlign: "center",
            color: "var(--text-tertiary)",
            fontSize: 13,
            padding: "24px 0",
          }}
        >
          {isUserSpeaking
            ? "Listening..."
            : isAISpeaking
            ? "AI is speaking..."
            : "Start speaking to begin the conversation"}
        </div>
      )}

      {recentTranscripts.map((entry) => (
        <div
          key={entry.id}
          style={{
            display: "flex",
            justifyContent: entry.role === "user" ? "flex-end" : "flex-start",
          }}
        >
          <div
            style={{
              maxWidth: "85%",
              padding: "6px 12px",
              borderRadius:
                entry.role === "user"
                  ? "12px 12px 4px 12px"
                  : "12px 12px 12px 4px",
              background:
                entry.role === "user"
                  ? "var(--text)"
                  : "var(--card-bg)",
              color:
                entry.role === "user"
                  ? "var(--bg)"
                  : "var(--text)",
              fontSize: 13,
              lineHeight: 1.5,
              wordBreak: "break-word",
              opacity: entry.isFinal ? 1 : 0.7,
            }}
          >
            {entry.text}
          </div>
        </div>
      ))}

      {currentPartial && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              maxWidth: "85%",
              padding: "6px 12px",
              borderRadius: "12px 12px 4px 12px",
              background: "var(--text)",
              color: "var(--bg)",
              fontSize: 13,
              lineHeight: 1.5,
              fontStyle: "italic",
              opacity: 0.7,
            }}
          >
            {currentPartial}
          </div>
        </div>
      )}
    </div>
  );
}
