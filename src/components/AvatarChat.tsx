"use client";

import { Canvas } from "@react-three/fiber";
import { Experience } from "./3d/Experience";
import { useState, KeyboardEvent, useRef } from "react";
import { Send, Mic, MicOff, Loader2 } from "lucide-react";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useChat } from "@/hooks/useChat";

export default function AvatarChat() {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isRecording, transcript, startRecording, stopRecording, error } =
    useVoiceRecording();
  const { chat, loading } = useChat();

  const handleSend = async () => {
    const textToSend = message.trim() || transcript.trim();
    if (textToSend && !loading) {
      await chat(textToSend);
      setMessage("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording();
      if (transcript.trim()) {
        setTimeout(() => {
          chat(transcript.trim());
        }, 100);
      }
    } else {
      startRecording();
    }
  };

  const currentText = isRecording ? transcript : message;
  const canSend = !!(message.trim() || transcript.trim()) && !loading;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500&display=swap');

        .ac-root {
          font-family: 'DM Sans', sans-serif;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #f9f7f4;
          position: relative;
        }

        /* Canvas area */
        .ac-canvas-wrap {
          flex: 1;
          position: relative;
          min-height: 0;
          overflow: hidden;
          background: #f2efe9;
        }

        .ac-canvas-inner {
          position: absolute;
          inset: 0;
        }

        /* Loading pill */
        .ac-loading {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px);
          border: 1px solid #eeebe7;
          border-radius: 100px;
          padding: 8px 18px;
          font-size: 13px;
          color: #1a1a1a;
          font-weight: 400;
          letter-spacing: 0.01em;
          white-space: nowrap;
          box-shadow: 0 2px 16px rgba(0,0,0,0.06);
          animation: fadeDown 0.25s ease both;
        }

        @keyframes fadeDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        /* Idle greeting */
        .ac-greeting {
          position: absolute;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(10px);
          border: 1px solid #eeebe7;
          border-radius: 14px;
          padding: 12px 20px;
          max-width: 340px;
          width: calc(100% - 48px);
          text-align: center;
          animation: fadeUp 0.3s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .ac-greeting-text {
          font-size: 13px;
          color: #6b6660;
          font-weight: 300;
          line-height: 1.5;
        }

        .ac-greeting-text strong {
          font-weight: 500;
          color: #1a1a1a;
        }

        /* Bottom input bar */
        .ac-bar {
          background: #ffffff;
          border-top: 1px solid #eeebe7;
          padding: 14px 16px 16px;
        }

        .ac-bar-inner {
          max-width: 720px;
          margin: 0 auto;
        }

        .ac-error {
          margin-bottom: 10px;
          padding: 9px 14px;
          background: #fff5f5;
          border: 1px solid #ffd5d5;
          border-radius: 10px;
          font-size: 13px;
          color: #c0392b;
          font-weight: 400;
        }

        .ac-input-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          background: #f5f3f0;
          border: 1.5px solid #eeebe7;
          border-radius: 18px;
          padding: 6px 6px 6px 16px;
          transition: border-color 0.2s ease, background 0.2s ease;
        }

        .ac-input-row:focus-within {
          border-color: #1a1a1a;
          background: #fff;
        }

        .ac-textarea {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 300;
          color: #1a1a1a;
          resize: none;
          line-height: 1.6;
          padding: 6px 0;
          min-height: 32px;
          max-height: 120px;
          overflow-y: auto;
          scrollbar-width: none;
        }

        .ac-textarea::-webkit-scrollbar { display: none; }
        .ac-textarea::placeholder { color: #c0bbb5; font-weight: 300; }
        .ac-textarea:disabled { cursor: not-allowed; color: #b0aca6; }

        .ac-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
          padding-bottom: 4px;
        }

        .ac-mic-btn {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a09c96;
          transition: all 0.15s ease;
        }

        .ac-mic-btn:hover:not(:disabled) {
          background: #eeebe7;
          color: #1a1a1a;
        }

        .ac-mic-btn.recording {
          color: #e05252;
          background: #fff0f0;
          animation: micPulse 1.4s ease-in-out infinite;
        }

        .ac-mic-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        @keyframes micPulse {
          0%, 100% { background: #fff0f0; }
          50%       { background: #ffe0e0; }
        }

        .ac-send-btn {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: none;
          background: #1a1a1a;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .ac-send-btn:hover:not(:disabled) { background: #333; transform: scale(1.04); }
        .ac-send-btn:active:not(:disabled) { transform: scale(0.96); }

        .ac-send-btn:disabled {
          background: #eeebe7;
          color: #c0bbb5;
          cursor: not-allowed;
          transform: none;
        }

        /* Recording hint */
        .ac-rec-hint {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 10px;
          padding-left: 4px;
          font-size: 12px;
          color: #c0392b;
          letter-spacing: 0.01em;
        }

        .ac-rec-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #e05252;
          animation: dotPulse 1.2s ease-in-out infinite;
          flex-shrink: 0;
        }

        @keyframes dotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.75); }
        }

        /* Shortcut hint */
        .ac-hint {
          margin-top: 10px;
          text-align: center;
          font-size: 11px;
          color: #c0bbb5;
          letter-spacing: 0.02em;
        }

        .ac-hint kbd {
          display: inline-block;
          padding: 1px 6px;
          background: #f5f3f0;
          border: 1px solid #e0ddd9;
          border-radius: 5px;
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          color: #a09c96;
        }
      `}</style>

      <div className="ac-root">
        {/* 3D Canvas */}
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

          {/* Idle greeting */}
          {!loading && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 px-4 w-full max-w-md hidden md:block">
              <div className="bg-white/80 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-sm border border-gray-100 text-center">
                <p className="text-sm text-gray-600">
                  👋 Hi! I'm your AI health companion. How can I help you today?
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
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
                  isRecording ? "Listening…" : "Message… (Enter to send)"
                }
                rows={1}
                className="ac-textarea"
              />
              <div className="ac-actions">
                <button
                  onClick={handleVoiceToggle}
                  disabled={loading}
                  className={`ac-mic-btn ${isRecording ? "recording" : ""}`}
                  aria-label={
                    isRecording ? "Stop recording" : "Start voice input"
                  }
                >
                  {isRecording ? (
                    <MicOff size={16} strokeWidth={1.8} />
                  ) : (
                    <Mic size={16} strokeWidth={1.8} />
                  )}
                </button>
                <button
                  onClick={handleSend}
                  disabled={!canSend}
                  className="ac-send-btn"
                  aria-label="Send message"
                >
                  {loading ? (
                    <Loader2
                      size={15}
                      strokeWidth={2}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  ) : (
                    <Send size={15} strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>

            {isRecording && (
              <div className="ac-rec-hint">
                <span className="ac-rec-dot" />
                Recording — click mic to stop and send
              </div>
            )}

            {!loading && !isRecording && !message && (
              <div className="ac-hint">
                <kbd>Enter</kbd> to send &nbsp;·&nbsp; <kbd>Shift + Enter</kbd>{" "}
                for new line
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
