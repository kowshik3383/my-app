"use client";

import { Canvas } from "@react-three/fiber";
import { Experience } from "./3d/Experience";
import { useState, useEffect, useRef, KeyboardEvent, useCallback } from "react";
import {
  Send,
  Mic,
  MicOff,
  Loader2,
  Phone,
  PhoneOff,
} from "lucide-react";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useChat, type DisplayMessage } from "@/hooks/useChat";
import { useStore } from "@/store/useStore";

const ROLE_LABELS: Record<string, string> = {
  mother: "Mother", father: "Father", brother: "Brother", sister: "Sister",
  grandparent: "Grandparent", doctor: "Doctor", therapist: "Therapist",
  nurse: "Nurse", coach: "Coach", mentor: "Mentor", teacher: "Teacher",
  friend: "Friend", best_friend: "Best Friend", girlfriend: "Girlfriend",
  partner: "Partner", leader: "Leader", boss: "Boss", teammate: "Teammate",
  spiritual_guide: "Spiritual Guide", motivator: "Motivator", caregiver: "Caregiver",
};

function VoiceCallOverlay({
  isRecording, loading, onMicToggle, onEndCall, lastAI, dark,
}: {
  isRecording: boolean; loading: boolean; onMicToggle: () => void;
  onEndCall: () => void; lastAI?: DisplayMessage; dark: boolean;
}) {
  const statusLabel = loading ? "Processing…" : isRecording ? "Listening…" : "Connected";
  return (
    <div className="call-overlay">
      <div className="call-status" style={{ background: dark ? "rgba(20,20,24,0.9)" : "rgba(255,255,255,0.9)", borderColor: dark ? "#222" : "#e5e5e5" }}>
        <span className={`call-dot ${isRecording ? "rec" : "live"}`} />
        <span>{statusLabel}</span>
      </div>
      {lastAI && !loading && (
        <div className="call-transcript" style={{ background: dark ? "rgba(20,20,24,0.88)" : "rgba(255,255,255,0.88)", borderColor: dark ? "#222" : "#e5e5e5" }}>
          {lastAI.text}
        </div>
      )}
      <div className="call-controls">
        <button onClick={onMicToggle} disabled={loading}
          className={`call-mic ${isRecording ? "rec" : ""}`}>
          {isRecording ? <MicOff size={24} strokeWidth={1.5} /> : <Mic size={24} strokeWidth={1.5} />}
        </button>
        <button onClick={onEndCall} className="call-end">
          <PhoneOff size={16} strokeWidth={1.5} />
          End Call
        </button>
      </div>
      <style jsx>{`
        .call-overlay {
          position: absolute; inset: 0; z-index: 30;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 24px; pointer-events: none;
        }
        .call-status {
          pointer-events: all; display: flex; align-items: center; gap: 8px;
          padding: 8px 18px; border-radius: 100px; border: 1px solid;
          backdrop-filter: blur(12px); font-size: 12px; font-weight: 500;
        }
        .call-dot { width: 6px; height: 6px; border-radius: 50%; }
        .call-dot.live { background: #22c55e; }
        .call-dot.rec { background: #ef4444; animation: pulse 1s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .call-transcript {
          pointer-events: all; max-width: 320px; padding: 12px 18px;
          border-radius: 14px; border: 1px solid; backdrop-filter: blur(10px);
          font-size: 14px; line-height: 1.6; text-align: center;
        }
        .call-controls { pointer-events: all; display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .call-mic {
          width: 64px; height: 64px; border-radius: 50%; border: none;
          background: ${dark ? "#1e1e22" : "#1a1a1a"}; color: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.15s ease;
        }
        .call-mic:hover { transform: scale(1.05); }
        .call-mic.rec { background: #ef4444; }
        .call-end {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 18px; border-radius: 100px; border: none;
          background: #ef4444; color: #fff; cursor: pointer;
          font-size: 12px; font-weight: 500; font-family: var(--font-sans);
        }
        .call-end:hover { opacity: 0.85; }
      `}</style>
    </div>
  );
}

export default function AvatarChat() {
  const [inputText, setInputText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { interactionMode, setInteractionMode, isDarkMode, userProfile, setCurrentView, setInCall } = useStore();
  const { isRecording, transcript, startRecording, stopRecording, error } = useVoiceRecording();
  const { chat, loading, displayMessages } = useChat();

  const dark = isDarkMode;
  const allAI = displayMessages.filter((m) => m.role === "assistant");
  const latestAI = allAI[allAI.length - 1];
  const roleLabel = ROLE_LABELS[userProfile?.aiRole || ""] || (userProfile?.aiRole ?? "AI");

  // Auto-send in voice_call mode after recording stops
  const prevRecordingRef = useRef(isRecording);
  useEffect(() => {
    const wasRecording = prevRecordingRef.current;
    prevRecordingRef.current = isRecording;
    if (wasRecording && !isRecording && interactionMode === "voice_call") {
      const text = transcript.trim();
      if (text) setTimeout(() => chat(text), 200);
    }
  }, [isRecording]);

  // Auto-scroll messages
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [displayMessages]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim() || transcript.trim();
    if (!text || loading) return;
    await chat(text);
    setInputText("");
  }, [inputText, transcript, loading, chat]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording();
      if (interactionMode === "chat" && transcript.trim()) setTimeout(() => chat(transcript.trim()), 100);
    } else { startRecording(); }
  };

  const canSend = !!(inputText.trim() || transcript.trim()) && !loading;
  const currentText = isRecording ? transcript : inputText;

  return (
    <div className="ac-root">
      {/* Canvas Area */}
      <div className="ac-canvas-wrap">
        <div className="ac-canvas-inner">
          <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }} className="touch-none">
            <Experience />
          </Canvas>
        </div>

        {/* Status / Loading */}
        {loading && (
          <div className="ac-loading">
            <span className="ac-loading-dot" />
            Thinking
          </div>
        )}

        {/* Message panel */}
        {interactionMode === "chat" && displayMessages.length > 0 && !loading && (
          <div className="ac-msgs-wrap">
            <div className="ac-msgs" ref={scrollRef}>
              {displayMessages.map((m) => (
                <div key={m.id} className={`ac-msg ${m.role}`}>
                  <div className={`ac-msg-bubble ${m.role}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voice Call Overlay */}
        {interactionMode === "voice_call" && (
          <VoiceCallOverlay
            isRecording={isRecording}
            loading={loading}
            onMicToggle={handleVoiceToggle}
            onEndCall={() => setInteractionMode("chat")}
            lastAI={latestAI}
            dark={dark}
          />
        )}
      </div>

      {/* Floating Composer — chat mode */}
      {interactionMode === "chat" && (
        <div className="ac-composer">
          <div className="ac-composer-inner">
            {error && <div className="ac-composer-error">{error}</div>}
            <div className="ac-input-wrap">
              <textarea
                ref={textareaRef}
                value={currentText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading || isRecording}
                placeholder={isRecording ? "Listening…" : `Message ${roleLabel}…`}
                rows={1}
                className="ac-textarea"
              />
              <div className="ac-actions">
                <button onClick={() => {
                  setCurrentView("voice_call");
                  setInCall(true);
                }}
                  className="ac-btn" aria-label="Voice call">
                  <Phone size={14} strokeWidth={1.5} />
                </button>
                <button onClick={handleVoiceToggle} disabled={loading}
                  className={`ac-btn ${isRecording ? "ac-btn-rec" : ""}`}
                  aria-label={isRecording ? "Stop" : "Voice input"}>
                  {isRecording ? <MicOff size={14} strokeWidth={1.5} /> : <Mic size={14} strokeWidth={1.5} />}
                </button>
                <button onClick={handleSend} disabled={!canSend}
                  className="ac-send" aria-label="Send">
                  {loading ? (
                    <Loader2 size={14} strokeWidth={2} className="ac-spin" />
                  ) : (
                    <Send size={13} strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>
            <div className="ac-composer-hints">
              {isRecording && <span className="ac-rec-hint">Recording — tap mic to stop & send</span>}
              {!loading && !isRecording && (
                <span className="ac-shortcut-hint"><kbd>Enter</kbd> send · <kbd>Shift+Enter</kbd> new line</span>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .ac-root {
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          background: ${dark ? "#0a0a0a" : "#ffffff"};
        }
        .ac-canvas-wrap {
          flex: 1;
          position: relative;
          min-height: 0;
          overflow: hidden;
        }
        .ac-canvas-inner { position: absolute; inset: 0; }

        /* Loading */
        .ac-loading {
          position: absolute; top: 16px; left: 50%; transform: translateX(-50%);
          z-index: 20; display: flex; align-items: center; gap: 8px;
          background: ${dark ? "rgba(20,20,24,0.95)" : "rgba(255,255,255,0.95)"};
          border: 1px solid ${dark ? "#222" : "#e5e5e5"};
          border-radius: 100px; padding: 6px 16px;
          font-size: 12px; color: var(--text-secondary);
          backdrop-filter: blur(12px);
        }
        .ac-loading-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--text-tertiary);
          animation: blink 1s ease-in-out infinite;
        }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }

        /* Messages panel */
        .ac-msgs-wrap {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 20;
          pointer-events: none;
        }
        .ac-msgs {
          pointer-events: all;
          max-height: 200px; overflow-y: auto;
          padding: 16px 16px 8px;
          display: flex; flex-direction: column; gap: 4px;
          mask-image: linear-gradient(to top, black 60%, transparent 100%);
          -webkit-mask-image: linear-gradient(to top, black 60%, transparent 100%);
        }
        .ac-msg { display: flex; }
        .ac-msg.user { justify-content: flex-end; }
        .ac-msg.assistant { justify-content: flex-start; }
        .ac-msg-bubble {
          max-width: 75%; padding: 8px 14px;
          font-size: 13px; line-height: 1.55;
          font-weight: 400;
          word-break: break-word;
        }
        .ac-msg-bubble.user {
          background: ${dark ? "#1a1a1a" : "#f0f0f0"};
          color: ${dark ? "#f0f0f0" : "#1a1a1a"};
          border-radius: 14px 14px 4px 14px;
        }
        .ac-msg-bubble.assistant {
          background: transparent;
          color: ${dark ? "#d0d0d0" : "#555"};
          border-radius: 14px 14px 14px 4px;
          padding: 8px 14px 8px 0;
        }

        /* Floating Composer */
        .ac-composer {
          position: relative;
          z-index: 50;
          padding: 0 16px 12px;
          background: ${dark ? "rgba(10,10,10,0.95)" : "rgba(255,255,255,0.95)"};
          backdrop-filter: blur(12px);
          border-top: 1px solid ${dark ? "#1a1a1a" : "#f0f0f0"};
        }
        .ac-composer-inner {
          max-width: 720px;
          margin: 0 auto;
        }
        .ac-composer-error {
          font-size: 11px; color: #ef4444;
          padding: 4px 0 8px;
        }
        .ac-input-wrap {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          padding: 8px 8px 8px 16px;
          border: 1.5px solid ${dark ? "#222" : "#e5e5e5"};
          border-radius: 16px;
          background: ${dark ? "rgba(20,20,24,1)" : "rgba(247,247,247,1)"};
          transition: border-color 0.2s ease;
        }
        .ac-input-wrap:focus-within {
          border-color: ${dark ? "#555" : "#0a0a0a"};
        }
        .ac-textarea {
          flex: 1; background: transparent; border: none; outline: none;
          font-family: var(--font-sans); font-size: 13px; font-weight: 400;
          color: var(--text); resize: none; line-height: 1.6;
          padding: 4px 0; min-height: 24px; max-height: 120px; overflow-y: auto;
        }
        .ac-textarea::placeholder { color: var(--text-tertiary); }
        .ac-textarea:disabled { cursor: not-allowed; opacity: 0.5; }
        .ac-actions {
          display: flex; align-items: center; gap: 2px;
          flex-shrink: 0; padding-bottom: 2px;
        }
        .ac-btn {
          width: 32px; height: 32px; border-radius: 8px; border: none;
          background: transparent; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: ${dark ? "#555" : "#a0a0a0"};
          transition: all 0.15s ease; flex-shrink: 0;
        }
        .ac-btn:hover:not(:disabled) {
          background: ${dark ? "#1a1a1a" : "#e5e5e5"};
          color: var(--text);
        }
        .ac-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .ac-btn-rec { color: #ef4444 !important; }
        .ac-send {
          width: 32px; height: 32px; border-radius: 8px; border: none;
          background: var(--text); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: var(--bg); transition: all 0.15s ease; flex-shrink: 0;
        }
        .ac-send:hover:not(:disabled) { opacity: 0.85; }
        .ac-send:disabled {
          background: ${dark ? "#222" : "#e5e5e5"};
          color: ${dark ? "#555" : "#a0a0a0"};
          cursor: not-allowed;
        }
        .ac-spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ac-composer-hints {
          display: flex; align-items: center; justify-content: center;
          margin-top: 6px; min-height: 18px;
        }
        .ac-rec-hint {
          font-size: 10px; color: #ef4444;
          display: flex; align-items: center; gap: 4px;
        }
        .ac-shortcut-hint {
          font-size: 10px; color: var(--text-tertiary);
        }
        .ac-shortcut-hint kbd {
          display: inline-block; padding: 0 4px;
          background: ${dark ? "#1a1a1a" : "#f0f0f0"};
          border: 1px solid ${dark ? "#333" : "#e5e5e5"};
          border-radius: 3px; font-size: 9px;
          font-family: var(--font-mono); color: var(--text-tertiary);
        }
      `}</style>
    </div>
  );
}
