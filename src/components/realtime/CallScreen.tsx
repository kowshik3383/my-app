"use client";

import { useState, useEffect } from "react";
import { AvatarOrb } from "./AvatarOrb";
import { Waveform } from "./Waveform";
import { TranscriptPanel } from "./TranscriptPanel";
import { CallControls } from "./CallControls";
import { ConnectionIndicator } from "./ConnectionIndicator";
import { useRealtimeCall } from "@/hooks/realtime/useRealtimeCall";
import { useStore } from "@/store/useStore";
import { Settings, ChevronDown } from "lucide-react";
import type { VoiceSelectorOption } from "@/types/realtime";

interface CallScreenProps {
  onEndCall: () => void;
}

export function CallScreen({ onEndCall }: CallScreenProps) {
  const { userProfile, isDarkMode } = useStore();
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [emotion, setEmotion] = useState<string>("neutral");

  const call = useRealtimeCall({
    userId: userProfile?.id || "",
  });

  const dark = isDarkMode;

  useEffect(() => {
    if (call.callState === "idle" && userProfile?.id) {
      call.startCall();
    }
  }, [userProfile?.id]);

  useEffect(() => {
    if (call.callState === "ended") {
      onEndCall();
    }
  }, [call.callState, onEndCall]);

  const handleEndCall = () => {
    call.endCall();
    onEndCall();
  };

  const handleVoiceSelect = (voice: VoiceSelectorOption) => {
    call.setVoice(voice);
    setShowVoicePicker(false);
  };

  if (call.callState === "idle" || call.callState === "connecting") {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          background: dark
            ? "linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)"
            : "linear-gradient(180deg, #fafafa 0%, #f0f0f5 100%)",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: "3px solid var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "call-pulse 1.5s ease-in-out infinite",
            color: "var(--accent)",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </div>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 4,
            }}
          >
            Connecting
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--text-tertiary)",
            }}
          >
            Establishing secure voice connection...
          </div>
        </div>

        <button
          onClick={onEndCall}
          style={{
            padding: "10px 28px",
            borderRadius: 100,
            border: "none",
            background: "var(--card-bg)",
            color: "var(--text)",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Cancel
        </button>

        <style>{`
          @keyframes call-pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: dark
          ? "linear-gradient(180deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)"
          : "linear-gradient(180deg, #fafafa 0%, #f0f0f5 50%, #fafafa 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: "linear-gradient(90deg, transparent, var(--accent), transparent)",
          opacity: 0.3,
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          flexShrink: 0,
        }}
      >
        <ConnectionIndicator
          state={call.connectionState}
          latency={call.metrics.latency}
        />

        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
            color: "var(--text)",
            letterSpacing: "0.05em",
          }}
        >
          {call.sessionTimer}
        </div>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowVoicePicker(!showVoicePicker)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-tertiary)",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
            }}
          >
            <Settings size={14} />
            <span>{call.selectedVoice.name}</span>
            <ChevronDown size={12} />
          </button>

          {showVoicePicker && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: 4,
                background: dark ? "#1a1a24" : "#fff",
                border: `1px solid ${dark ? "#2a2a3a" : "#e5e5e5"}`,
                borderRadius: 12,
                padding: 8,
                minWidth: 160,
                zIndex: 100,
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              }}
            >
              {call.voices.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => handleVoiceSelect(voice)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 12px",
                    border: "none",
                    borderRadius: 8,
                    background:
                      voice.id === call.selectedVoice.id
                        ? "var(--accent)"
                        : "transparent",
                    color:
                      voice.id === call.selectedVoice.id
                        ? "#fff"
                        : "var(--text)",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  <div style={{ fontWeight: 500 }}>{voice.name}</div>
                  <div
                    style={{
                      fontSize: 11,
                      opacity: 0.7,
                    }}
                  >
                    {voice.description}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          padding: "20px",
          minHeight: 0,
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AvatarOrb
            size={180}
            isSpeaking={call.isAISpeaking}
            isListening={call.isSpeaking}
            audioLevel={call.audioLevel}
            emotion={emotion}
          />

          <div
            style={{
              position: "absolute",
              bottom: -8,
              left: "50%",
              transform: "translateX(-50%)",
              padding: "3px 12px",
              borderRadius: 100,
              background: dark ? "rgba(20,20,30,0.9)" : "rgba(255,255,255,0.9)",
              border: `1px solid ${dark ? "#2a2a3a" : "#e5e5e5"}`,
              fontSize: 11,
              color: "var(--text-tertiary)",
              whiteSpace: "nowrap",
            }}
          >
            {call.isAISpeaking
              ? "AI Speaking"
              : call.isSpeaking
              ? "You're Speaking"
              : "Listening"}
          </div>
        </div>

        <div
          style={{
            width: "100%",
            maxWidth: 320,
            height: 40,
          }}
        >
          <Waveform
            audioLevel={call.audioLevel}
            isActive={call.isSpeaking || call.isAISpeaking}
            barCount={32}
            height={40}
            color={dark ? "#6366f1" : "#6366f1"}
          />
        </div>
      </div>

      <div
        style={{
          padding: "0 20px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            background: dark ? "rgba(20,20,30,0.6)" : "rgba(255,255,255,0.8)",
            borderRadius: 16,
            padding: 12,
            backdropFilter: "blur(20px)",
            border: `1px solid ${dark ? "#2a2a3a" : "#e5e5e5"}`,
          }}
        >
          <TranscriptPanel
            transcripts={call.transcripts.transcripts}
            currentPartial={call.transcripts.currentPartial}
            isUserSpeaking={call.isSpeaking}
            isAISpeaking={call.isAISpeaking}
            maxHeight={160}
          />
        </div>
      </div>

      <div
        style={{
          padding: "8px 20px 20px",
          flexShrink: 0,
        }}
      >
        <CallControls
          isMuted={call.isMuted}
          isAISpeaking={call.isAISpeaking}
          onToggleMute={call.toggleMute}
          onEndCall={handleEndCall}
          dark={dark}
        />
      </div>
    </div>
  );
}
