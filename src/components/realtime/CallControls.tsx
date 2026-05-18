"use client";

import { Mic, MicOff, PhoneOff, Volume2, VolumeX } from "lucide-react";

interface CallControlsProps {
  isMuted: boolean;
  isAISpeaking: boolean;
  onToggleMute: () => void;
  onEndCall: () => void;
  dark?: boolean;
}

export function CallControls({
  isMuted,
  isAISpeaking,
  onToggleMute,
  onEndCall,
  dark = false,
}: CallControlsProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: "16px 0",
      }}
    >
      <button
        onClick={onToggleMute}
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: "none",
          background: isMuted
            ? "var(--accent)"
            : dark
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.06)",
          color: isMuted ? "#fff" : "var(--text)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
        }}
        aria-label={isMuted ? "Unmute" : "Mute"}
        title={isMuted ? "Unmute microphone" : "Mute microphone"}
      >
        {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
      </button>

      <button
        onClick={onEndCall}
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          border: "none",
          background: "#ef4444",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
          boxShadow: "0 4px 16px rgba(239,68,68,0.4)",
        }}
        aria-label="End call"
        title="End call"
      >
        <PhoneOff size={24} />
      </button>

      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: isAISpeaking
            ? "2px solid var(--accent)"
            : "2px solid transparent",
          background: dark
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: isAISpeaking ? "var(--accent)" : "var(--text-tertiary)",
          transition: "all 0.3s ease",
        }}
        title={isAISpeaking ? "AI is speaking" : "AI is listening"}
      >
        {isAISpeaking ? <Volume2 size={22} /> : <VolumeX size={22} />}
      </div>
    </div>
  );
}
