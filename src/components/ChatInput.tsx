"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Send, Mic, MicOff, Loader2 } from "lucide-react";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useStore } from "@/store/useStore";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isRecording, transcript, startRecording, stopRecording, error } = useVoiceRecording();
  const { isLoading } = useStore();

  const handleSend = () => {
    const textToSend = message.trim() || transcript.trim();
    if (textToSend && !disabled && !isLoading) {
      onSendMessage(textToSend);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
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
        setTimeout(() => { onSendMessage(transcript.trim()); }, 100);
      }
    } else {
      startRecording();
    }
  };

  const currentText = isRecording ? transcript : message;
  const canSend = !!(message.trim() || transcript.trim()) && !disabled && !isLoading;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');

        .ci-root {
          font-family: 'DM Sans', sans-serif;
          background: #ffffff;
          border-top: 1px solid #eeebe7;
          padding: 14px 16px 16px;
        }

        .ci-error {
          margin-bottom: 10px;
          padding: 9px 14px;
          background: #fff5f5;
          border: 1px solid #ffd5d5;
          border-radius: 10px;
          font-size: 13px;
          color: #c0392b;
          font-weight: 400;
        }

        .ci-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          background: #f5f3f0;
          border: 1.5px solid #eeebe7;
          border-radius: 18px;
          padding: 6px 6px 6px 16px;
          transition: border-color 0.2s ease;
        }

        .ci-row:focus-within {
          border-color: #1a1a1a;
          background: #fff;
        }

        .ci-textarea {
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

        .ci-textarea::-webkit-scrollbar { display: none; }

        .ci-textarea::placeholder {
          color: #c0bbb5;
          font-weight: 300;
        }

        .ci-textarea:disabled {
          cursor: not-allowed;
          color: #b0aca6;
        }

        .ci-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
          padding-bottom: 4px;
        }

        .ci-mic-btn {
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
          flex-shrink: 0;
        }

        .ci-mic-btn:hover:not(:disabled) {
          background: #eeebe7;
          color: #1a1a1a;
        }

        .ci-mic-btn.recording {
          color: #e05252;
          background: #fff0f0;
          animation: micPulse 1.4s ease-in-out infinite;
        }

        .ci-mic-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        @keyframes micPulse {
          0%, 100% { background: #fff0f0; }
          50% { background: #ffe0e0; }
        }

        .ci-send-btn {
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

        .ci-send-btn:hover:not(:disabled) {
          background: #333;
          transform: scale(1.04);
        }

        .ci-send-btn:active:not(:disabled) { transform: scale(0.96); }

        .ci-send-btn:disabled {
          background: #eeebe7;
          color: #c0bbb5;
          cursor: not-allowed;
          transform: none;
        }

        .ci-recording-hint {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 10px;
          padding-left: 4px;
          font-size: 12px;
          color: #c0392b;
          font-weight: 400;
          letter-spacing: 0.01em;
        }

        .ci-rec-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #e05252;
          animation: dotPulse 1.2s ease-in-out infinite;
          flex-shrink: 0;
        }

        @keyframes dotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>

      <div className="ci-root">
        {error && <div className="ci-error">{error}</div>}

        <div className="ci-row">
          <textarea
            ref={textareaRef}
            value={currentText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={disabled || isLoading || isRecording}
            placeholder={isRecording ? "Listening…" : "Message… (Enter to send)"}
            rows={1}
            className="ci-textarea"
          />

          <div className="ci-actions">
            <button
              onClick={handleVoiceToggle}
              disabled={disabled || isLoading}
              className={`ci-mic-btn ${isRecording ? "recording" : ""}`}
              aria-label={isRecording ? "Stop recording" : "Start voice input"}
            >
              {isRecording ? <MicOff size={16} strokeWidth={1.8} /> : <Mic size={16} strokeWidth={1.8} />}
            </button>

            <button
              onClick={handleSend}
              disabled={!canSend}
              className="ci-send-btn"
              aria-label="Send message"
            >
              {isLoading
                ? <Loader2 size={15} strokeWidth={2} className="animate-spin" />
                : <Send size={15} strokeWidth={2} />
              }
            </button>
          </div>
        </div>

        {isRecording && (
          <div className="ci-recording-hint">
            <span className="ci-rec-dot" />
            Recording — click mic to stop and send
          </div>
        )}
      </div>
    </>
  );
}