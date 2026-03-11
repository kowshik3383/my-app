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
  MessageCircle,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useChat, type DisplayMessage } from "@/hooks/useChat";
import { useStore } from "@/store/useStore";

// ─── Emotion display config ────────────────────────────────────────────────────
const EMOTION_CONFIG: Record<
  string,
  { emoji: string; color: string; label: string }
> = {
  happy: { emoji: "😊", color: "#22c55e", label: "Happy" },
  sadly: { emoji: "😢", color: "#60a5fa", label: "Sad" },
  playfully: { emoji: "😏", color: "#f472b6", label: "Playful" },
  angrily: { emoji: "😤", color: "#f87171", label: "Intense" },
  whispers: { emoji: "🤫", color: "#a78bfa", label: "Whisper" },
  giggles: { emoji: "😄", color: "#fb923c", label: "Giggles" },
  sarcastically: { emoji: "🙄", color: "#94a3b8", label: "Sarcastic" },
};

const ROLE_LABELS: Record<string, string> = {
  mother: "Mother",
  father: "Father",
  brother: "Brother",
  sister: "Sister",
  grandparent: "Grandparent",
  doctor: "Doctor",
  therapist: "Therapist",
  nurse: "Nurse",
  coach: "Coach",
  mentor: "Mentor",
  teacher: "Teacher",
  friend: "Friend",
  best_friend: "Best Friend",
  girlfriend: "Girlfriend",
  partner: "Partner",
  leader: "Leader",
  boss: "Boss",
  teammate: "Teammate",
  spiritual_guide: "Spiritual Guide",
  motivator: "Motivator",
  caregiver: "Caregiver",
};

function emotionCfg(emotion?: string) {
  return EMOTION_CONFIG[emotion || "happy"] ?? EMOTION_CONFIG.happy;
}

// ─── ChatBubble sub-component ─────────────────────────────────────────────────
function AiBubble({ msg, dark }: { msg: DisplayMessage; dark: boolean }) {
  const cfg = emotionCfg(msg.emotion);
  return (
    <div className="ai-bubble-wrap">
      <div
        className="ai-bubble-badge"
        style={{
          background: cfg.color + "22",
          color: cfg.color,
          borderColor: cfg.color + "44",
        }}
      >
        <span>{cfg.emoji}</span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {cfg.label}
        </span>
      </div>
      <div
        className="ai-bubble-body"
        style={{
          background: dark ? "rgba(22,22,26,0.96)" : "rgba(255,255,255,0.95)",
          color: dark ? "#f0f0f0" : "#1a1a1a",
          borderColor: dark ? "#2a2a2a" : "#eeebe7",
        }}
      >
        {msg.text}
      </div>
    </div>
  );
}

function UserBubble({ msg, dark }: { msg: DisplayMessage; dark: boolean }) {
  return (
    <div
      className="user-bubble"
      style={{
        background: dark ? "#f0f0f0" : "#1a1a1a",
        color: dark ? "#1a1a1a" : "#ffffff",
      }}
    >
      {msg.text}
    </div>
  );
}

// ─── History Panel ────────────────────────────────────────────────────────────
function HistoryPanel({
  messages,
  dark,
  onClose,
}: {
  messages: DisplayMessage[];
  dark: boolean;
  onClose: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  return (
    <div
      className="history-panel"
      style={{
        background: dark ? "rgba(12,12,14,0.97)" : "rgba(255,255,255,0.97)",
        borderColor: dark ? "#2a2a2a" : "#eeebe7",
      }}
    >
      <div
        className="history-header"
        style={{ borderColor: dark ? "#2a2a2a" : "#eeebe7" }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: dark ? "#aaa" : "#888",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Conversation
        </span>
        <button
          onClick={onClose}
          className="history-close"
          style={{ color: dark ? "#aaa" : "#999" }}
        >
          <ChevronDown size={16} />
        </button>
      </div>
      <div ref={scrollRef} className="history-scroll">
        {messages.length === 0 && (
          <p
            style={{
              textAlign: "center",
              color: dark ? "#555" : "#c0bbb5",
              fontSize: 13,
              padding: "24px 0",
            }}
          >
            No messages yet
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`history-row ${m.role === "user" ? "history-user" : "history-ai"}`}
          >
            {m.role === "assistant" && (
              <div
                className="history-ai-badge"
                style={{ color: emotionCfg(m.emotion).color }}
              >
                {emotionCfg(m.emotion).emoji}
              </div>
            )}
            <div
              className={`history-bubble ${m.role === "user" ? "history-bubble-user" : "history-bubble-ai"}`}
              style={{
                background:
                  m.role === "user"
                    ? dark
                      ? "#f0f0f0"
                      : "#1a1a1a"
                    : dark
                      ? "#1e1e22"
                      : "#f5f3f0",
                color:
                  m.role === "user"
                    ? dark
                      ? "#1a1a1a"
                      : "#ffffff"
                    : dark
                      ? "#f0f0f0"
                      : "#1a1a1a",
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Voice Call Overlay ───────────────────────────────────────────────────────
function VoiceCallOverlay({
  isRecording,
  loading,
  isSpeaking,
  onMicToggle,
  onEndCall,
  lastAI,
  dark,
}: {
  isRecording: boolean;
  loading: boolean;
  isSpeaking: boolean;
  onMicToggle: () => void;
  onEndCall: () => void;
  lastAI?: DisplayMessage;
  dark: boolean;
}) {
  const statusLabel = loading
    ? "Processing…"
    : isSpeaking
      ? "Speaking…"
      : isRecording
        ? "Listening…"
        : "Connected";

  return (
    <div className="call-overlay">
      {/* Status chip */}
      <div
        className="call-status-chip"
        style={{
          background: dark ? "rgba(20,20,24,0.9)" : "rgba(255,255,255,0.9)",
          color: dark ? "#f0f0f0" : "#1a1a1a",
          borderColor: dark ? "#333" : "#eeebe7",
        }}
      >
        <span
          className={`call-live-dot ${isSpeaking || loading ? "pulse-green" : isRecording ? "pulse-red" : ""}`}
        />
        <span
          style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}
        >
          {statusLabel}
        </span>
      </div>

      {/* Subtitle: last AI text */}
      {lastAI && !loading && (
        <div
          className="call-subtitle"
          style={{
            background: dark ? "rgba(20,20,24,0.88)" : "rgba(255,255,255,0.88)",
            color: dark ? "#e0e0e0" : "#333",
            borderColor: dark ? "#333" : "#eeebe7",
          }}
        >
          <span style={{ marginRight: 6 }}>
            {emotionCfg(lastAI.emotion).emoji}
          </span>
          {lastAI.text}
        </div>
      )}

      {/* Controls */}
      <div className="call-controls">
        <button
          onClick={onMicToggle}
          disabled={loading}
          className={`call-mic-btn ${isRecording ? "call-mic-recording" : ""}`}
          aria-label={isRecording ? "Stop recording" : "Tap to speak"}
        >
          {isRecording ? (
            <MicOff size={28} strokeWidth={1.8} />
          ) : (
            <Mic size={28} strokeWidth={1.8} />
          )}
        </button>
        <div
          className="call-mic-label"
          style={{ color: dark ? "#888" : "#aaa" }}
        >
          {isRecording ? "Tap to stop" : "Tap to speak"}
        </div>
        <button
          onClick={onEndCall}
          className="call-end-btn"
          aria-label="End call"
        >
          <PhoneOff size={18} strokeWidth={1.8} />
          <span>End Call</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AvatarChat() {
  const [inputText, setInputText] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { interactionMode, setInteractionMode, isDarkMode, userProfile } =
    useStore();
  const { isRecording, transcript, startRecording, stopRecording, error } =
    useVoiceRecording();
  const { chat, loading, message, displayMessages, clearHistory } = useChat();

  const dark = isDarkMode;

  // Derived
  const allAI = displayMessages.filter((m) => m.role === "assistant");
  const allUser = displayMessages.filter((m) => m.role === "user");
  const latestAI = allAI[allAI.length - 1];
  const latestUser = allUser[allUser.length - 1];
  const isSpeaking = !!message;

  const roleLabel =
    ROLE_LABELS[userProfile?.aiRole || ""] || (userProfile?.aiRole ?? "AI");

  // Auto-send transcript in voice-call mode after recording stops
  const prevRecordingRef = useRef(isRecording);
  useEffect(() => {
    const wasRecording = prevRecordingRef.current;
    prevRecordingRef.current = isRecording;
    if (wasRecording && !isRecording && interactionMode === "voice_call") {
      const text = transcript.trim();
      if (text) {
        setTimeout(() => chat(text), 200);
      }
    }
  }, [isRecording]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim() || transcript.trim();
    if (!text || loading) return;
    await chat(text);
    setInputText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [inputText, transcript, loading, chat]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording();
      if (interactionMode === "chat" && transcript.trim()) {
        setTimeout(() => chat(transcript.trim()), 100);
      }
    } else {
      startRecording();
    }
  };

  const handleModeToggle = () => {
    setInteractionMode(interactionMode === "chat" ? "voice_call" : "chat");
  };

  const canSend = !!(inputText.trim() || transcript.trim()) && !loading;
  const currentText = isRecording ? transcript : inputText;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500&display=swap');

        .ac-root {
          font-family: 'DM Sans', sans-serif;
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          --bg: ${dark ? "#0a0a0c" : "#f9f7f4"};
          --bg-canvas: ${dark ? "#0a0a0c" : "#f2efe9"};
          --bg-bar: ${dark ? "#111114" : "#ffffff"};
          --bg-input: ${dark ? "#1a1a1e" : "#f5f3f0"};
          --text: ${dark ? "#f0f0f0" : "#1a1a1a"};
          --text-muted: ${dark ? "#888" : "#6b6660"};
          --text-hint: ${dark ? "#444" : "#c0bbb5"};
          --border: ${dark ? "#262628" : "#eeebe7"};
          background: var(--bg);
        }

        /* ── Canvas ─────────────────────────────── */
        .ac-canvas-wrap {
          flex: 1;
          position: relative;
          min-height: 0;
          overflow: hidden;
          background: var(--bg-canvas);
        }
        .ac-canvas-inner { position: absolute; inset: 0; }

        /* ── Loading pill ────────────────────────── */
        .ac-loading {
          position: absolute; top: 16px; left: 50%; transform: translateX(-50%);
          z-index: 20; display: flex; align-items: center; gap: 7px;
          background: ${dark ? "rgba(20,20,24,0.95)" : "rgba(255,255,255,0.95)"};
          backdrop-filter: blur(12px);
          border: 1px solid var(--border); border-radius: 100px;
          padding: 7px 16px; font-size: 13px; color: var(--text);
          font-weight: 400; letter-spacing: 0.01em; white-space: nowrap;
          box-shadow: 0 2px 20px rgba(0,0,0,0.1);
          animation: fadeDown 0.22s ease both;
        }
        @keyframes fadeDown {
          from { opacity:0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity:1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── AI Speech Bubble ────────────────────── */
        .ai-bubble-wrap {
          position: absolute; bottom: 20px; left: 16px;
          z-index: 20; max-width: min(340px, calc(100% - 32px));
          display: flex; flex-direction: column; gap: 5px;
          animation: bubbleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes bubbleIn {
          from { opacity:0; transform: translateY(10px) scale(0.97); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
        .ai-bubble-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 9px; border-radius: 100px; border: 1px solid;
          font-size: 10px; width: fit-content; font-weight: 600;
          letter-spacing: 0.04em;
        }
        .ai-bubble-body {
          padding: 12px 16px; border-radius: 16px 16px 16px 4px;
          border: 1px solid; font-size: 14px; font-weight: 300;
          line-height: 1.6; backdrop-filter: blur(12px);
          box-shadow: 0 4px 24px rgba(0,0,0,0.1);
        }

        /* ── User bubble (mini echo) ──────────────── */
        .user-bubble {
          position: absolute; bottom: 20px; right: 16px;
          z-index: 20; max-width: 200px; padding: 9px 14px;
          border-radius: 16px 16px 4px 16px; font-size: 13px;
          font-weight: 300; line-height: 1.5;
          animation: bubbleInRight 0.25s ease both;
          box-shadow: 0 2px 12px rgba(0,0,0,0.12);
        }
        @keyframes bubbleInRight {
          from { opacity:0; transform: translateX(6px); }
          to   { opacity:1; transform: translateX(0); }
        }

        /* ── Voice Call Overlay ────────────────────── */
        .call-overlay {
          position: absolute; inset: 0; z-index: 30;
          display: flex; flex-direction: column;
          align-items: center; justify-content: space-between;
          padding: 20px 20px 32px;
          pointer-events: none;
        }
        .call-status-chip {
          pointer-events: all;
          display: flex; align-items: center; gap: 8px;
          padding: 8px 18px; border-radius: 100px; border: 1px solid;
          backdrop-filter: blur(12px);
          box-shadow: 0 2px 20px rgba(0,0,0,0.1);
        }
        .call-live-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #6b7280; flex-shrink: 0;
        }
        .call-live-dot.pulse-green {
          background: #22c55e;
          animation: livePulse 1.2s ease-in-out infinite;
        }
        .call-live-dot.pulse-red {
          background: #ef4444;
          animation: livePulse 1s ease-in-out infinite;
        }
        @keyframes livePulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.5; transform:scale(0.7); }
        }
        .call-subtitle {
          pointer-events: all;
          max-width: 300px; padding: 10px 16px; border-radius: 14px;
          border: 1px solid; backdrop-filter: blur(10px);
          font-size: 14px; font-weight: 300; line-height: 1.5;
          text-align: center; animation: fadeUp 0.25s ease both;
        }
        @keyframes fadeUp {
          from { opacity:0; transform: translateY(6px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .call-controls {
          pointer-events: all;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
        }
        .call-mic-btn {
          width: 72px; height: 72px; border-radius: 50%; border: none;
          background: ${dark ? "#1e1e22" : "#1a1a1a"}; color: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.18s ease;
          box-shadow: 0 4px 24px rgba(0,0,0,0.25);
        }
        .call-mic-btn:hover:not(:disabled) { transform: scale(1.06); }
        .call-mic-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .call-mic-recording {
          background: #ef4444 !important;
          animation: micPulse 1.2s ease-in-out infinite;
        }
        @keyframes micPulse {
          0%,100% { box-shadow: 0 4px 24px rgba(239,68,68,0.3); }
          50%      { box-shadow: 0 4px 40px rgba(239,68,68,0.6); }
        }
        .call-mic-label { font-size: 12px; color: ${dark ? "#666" : "#aaa"}; }
        .call-end-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 9px 20px; border-radius: 100px; border: none;
          background: #ef4444; color: #fff; cursor: pointer;
          font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif;
          transition: all 0.15s ease;
        }
        .call-end-btn:hover { background: #dc2626; transform: scale(1.03); }

        /* ── History Panel ───────────────────────── */
        .history-panel {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 25;
          border-top: 1px solid; border-radius: 20px 20px 0 0;
          overflow: hidden;
          animation: slideUp 0.28s cubic-bezier(0.34,1.3,0.64,1) both;
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        .history-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px 10px; border-bottom: 1px solid;
        }
        .history-close {
          background: none; border: none; cursor: pointer; padding: 4px;
          display: flex; align-items: center; transition: opacity 0.15s;
        }
        .history-close:hover { opacity: 0.6; }
        .history-scroll {
          max-height: 240px; overflow-y: auto; padding: 12px 16px 16px;
          display: flex; flex-direction: column; gap: 10px;
          scrollbar-width: thin;
        }
        .history-row { display: flex; align-items: flex-end; gap: 6px; }
        .history-ai  { flex-direction: row; }
        .history-user { flex-direction: row-reverse; }
        .history-ai-badge { font-size: 16px; flex-shrink: 0; padding-bottom: 2px; }
        .history-bubble {
          max-width: 75%; padding: 9px 13px; border-radius: 14px;
          font-size: 13px; font-weight: 300; line-height: 1.55;
        }
        .history-bubble-ai  { border-radius: 14px 14px 14px 4px; }
        .history-bubble-user { border-radius: 14px 14px 4px 14px; }

        /* ── Input bar ───────────────────────────── */
        .ac-bar {
          background: var(--bg-bar); border-top: 1px solid var(--border);
          padding: 12px 14px 14px;
        }
        .ac-bar-inner { max-width: 720px; margin: 0 auto; }
        .ac-error {
          margin-bottom: 9px; padding: 8px 13px;
          background: ${dark ? "#2a0f0f" : "#fff5f5"};
          border: 1px solid ${dark ? "#5c1a1a" : "#ffd5d5"};
          border-radius: 10px; font-size: 13px; color: #f87171;
        }
        .ac-input-row {
          display: flex; align-items: flex-end; gap: 8px;
          background: var(--bg-input); border: 1.5px solid var(--border);
          border-radius: 18px; padding: 6px 6px 6px 16px;
          transition: border-color 0.2s ease;
        }
        .ac-input-row:focus-within { border-color: var(--text); }
        .ac-textarea {
          flex: 1; background: transparent; border: none; outline: none;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 300;
          color: var(--text); resize: none; line-height: 1.6;
          padding: 6px 0; min-height: 32px; max-height: 120px; overflow-y: auto;
          scrollbar-width: none;
        }
        .ac-textarea::-webkit-scrollbar { display: none; }
        .ac-textarea::placeholder { color: var(--text-hint); }
        .ac-textarea:disabled { cursor: not-allowed; color: var(--text-hint); }
        .ac-actions {
          display: flex; align-items: center; gap: 4px;
          flex-shrink: 0; padding-bottom: 4px;
        }
        .ac-icon-btn {
          width: 34px; height: 34px; border-radius: 10px; border: none;
          background: transparent; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: ${dark ? "#555" : "#a09c96"}; transition: all 0.15s ease;
        }
        .ac-icon-btn:hover:not(:disabled) {
          background: ${dark ? "#1e1e22" : "#eeebe7"};
          color: var(--text);
        }
        .ac-icon-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .ac-mic-recording {
          color: #ef4444 !important;
          background: ${dark ? "#2a0f0f" : "#fff0f0"} !important;
          animation: micPulse 1.4s ease-in-out infinite;
        }
        .ac-send-btn {
          width: 34px; height: 34px; border-radius: 10px; border: none;
          background: var(--text); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: var(--bg); transition: all 0.15s ease; flex-shrink: 0;
        }
        .ac-send-btn:hover:not(:disabled) { opacity: 0.85; transform: scale(1.04); }
        .ac-send-btn:disabled {
          background: var(--border); color: var(--text-hint);
          cursor: not-allowed; transform: none;
        }
        .ac-footer-hints {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 9px; padding: 0 2px;
        }
        .ac-rec-hint {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: #ef4444;
        }
        .ac-rec-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #ef4444;
          animation: dotPulse 1.2s ease-in-out infinite; flex-shrink: 0;
        }
        @keyframes dotPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.4; transform:scale(0.7); }
        }
        .ac-hint {
          font-size: 11px; color: var(--text-hint); letter-spacing: 0.02em;
          margin-left: auto;
        }
        .ac-hint kbd {
          display: inline-block; padding: 1px 5px;
          background: var(--bg-input); border: 1px solid var(--border);
          border-radius: 4px; font-size: 10px; color: ${dark ? "#666" : "#a09c96"};
        }

        /* ── History toggle button ──────────────── */
        .ac-history-toggle {
          position: absolute; top: 12px; right: 14px; z-index: 20;
          display: flex; align-items: center; gap: 5px;
          padding: 5px 12px; border-radius: 100px; border: none; cursor: pointer;
          background: ${dark ? "rgba(20,20,24,0.9)" : "rgba(255,255,255,0.9)"};
          backdrop-filter: blur(8px);
          border: 1px solid ${dark ? "#2a2a2a" : "#eeebe7"};
          color: ${dark ? "#aaa" : "#888"};
          font-size: 11px; font-family: 'DM Sans', sans-serif;
          font-weight: 500; letter-spacing: 0.03em;
          transition: all 0.15s ease;
        }
        .ac-history-toggle:hover {
          color: var(--text);
          background: ${dark ? "rgba(30,30,35,0.95)" : "rgba(255,255,255,0.98)"};
        }
      `}</style>

      <div className="ac-root">
        {/* Canvas Area */}
        <div className="ac-canvas-wrap">
          <div className="ac-canvas-inner">
            <Canvas
              shadows
              camera={{ position: [0, 0, 1], fov: 30 }}
              className="touch-none"
            >
              <Experience />
            </Canvas>
          </div>

          {/* History toggle (chat mode only) */}
          {interactionMode === "chat" && displayMessages.length > 0 && (
            <button
              className="ac-history-toggle"
              onClick={() => setShowHistory((v) => !v)}
            >
              {showHistory ? (
                <ChevronDown size={12} />
              ) : (
                <ChevronUp size={12} />
              )}
              <span>
                {showHistory ? "Hide" : "Chat"} ({displayMessages.length})
              </span>
            </button>
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="ac-loading">
              <Loader2
                size={14}
                strokeWidth={2}
                style={{
                  animation: "spin 1s linear infinite",
                  color: "#a09c96",
                }}
              />
              Thinking…
            </div>
          )}

          {/* Chat Mode: speech bubbles */}
          {interactionMode === "chat" && !loading && !showHistory && (
            <>
              {latestAI && (
                <AiBubble key={latestAI.id} msg={latestAI} dark={dark} />
              )}
              {latestUser && !latestAI && (
                <UserBubble key={latestUser.id} msg={latestUser} dark={dark} />
              )}
            </>
          )}

          {/* History panel */}
          {showHistory && !loading && (
            <HistoryPanel
              messages={displayMessages}
              dark={dark}
              onClose={() => setShowHistory(false)}
            />
          )}

          {/* Voice Call Overlay */}
          {interactionMode === "voice_call" && (
            <VoiceCallOverlay
              isRecording={isRecording}
              loading={loading}
              isSpeaking={isSpeaking}
              onMicToggle={handleVoiceToggle}
              onEndCall={() => setInteractionMode("chat")}
              lastAI={latestAI}
              dark={dark}
            />
          )}
        </div>

        {/* Input Bar — chat mode only */}
        {interactionMode === "chat" && (
          <div className="ac-bar">
            <div className="ac-bar-inner">
              {error && <div className="ac-error">{error}</div>}

              <div className="ac-input-row">
                <textarea
                  ref={textareaRef}
                  value={currentText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={loading || isRecording}
                  placeholder={
                    isRecording ? "Listening…" : `Message ${roleLabel}…`
                  }
                  rows={1}
                  className="ac-textarea"
                />
                <div className="ac-actions">
                  {/* Voice call mode toggle */}
                  <button
                    onClick={handleModeToggle}
                    className="ac-icon-btn"
                    aria-label="Switch to voice call"
                    title="Voice call mode"
                  >
                    <Phone size={15} strokeWidth={1.8} />
                  </button>

                  {/* Mic */}
                  <button
                    onClick={handleVoiceToggle}
                    disabled={loading}
                    className={`ac-icon-btn ${isRecording ? "ac-mic-recording" : ""}`}
                    aria-label={isRecording ? "Stop recording" : "Voice input"}
                  >
                    {isRecording ? (
                      <MicOff size={15} strokeWidth={1.8} />
                    ) : (
                      <Mic size={15} strokeWidth={1.8} />
                    )}
                  </button>

                  {/* Send */}
                  <button
                    onClick={handleSend}
                    disabled={!canSend}
                    className="ac-send-btn"
                    aria-label="Send"
                  >
                    {loading ? (
                      <Loader2
                        size={15}
                        strokeWidth={2}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                    ) : (
                      <Send size={14} strokeWidth={2} />
                    )}
                  </button>
                </div>
              </div>

              <div className="ac-footer-hints">
                {isRecording && (
                  <div className="ac-rec-hint">
                    <span className="ac-rec-dot" />
                    Recording — click mic to stop &amp; send
                  </div>
                )}
                {!loading && !isRecording && displayMessages.length > 0 && (
                  <button
                    onClick={clearHistory}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      color: dark ? "#444" : "#c0bbb5",
                      padding: 0,
                    }}
                    title="Clear chat"
                  >
                    <Trash2 size={11} />
                    Clear
                  </button>
                )}
                {!loading && !isRecording && (
                  <div className="ac-hint">
                    <kbd>Enter</kbd> to send &nbsp;·&nbsp;{" "}
                    <kbd>Shift+Enter</kbd> new line
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
