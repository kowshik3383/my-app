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
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording();
      // Auto-send after recording stops
      if (transcript.trim()) {
        setTimeout(() => {
          onSendMessage(transcript.trim());
        }, 100);
      }
    } else {
      startRecording();
    }
  };

  const currentText = isRecording ? transcript : message;

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {error && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Voice input button */}
        <button
          onClick={handleVoiceToggle}
          disabled={disabled || isLoading}
          className={`flex-shrink-0 p-3 rounded-full transition-all ${
            isRecording
              ? "bg-red-500 text-white animate-pulse"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label={isRecording ? "Stop recording" : "Start voice input"}
        >
          {isRecording ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={currentText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={disabled || isLoading || isRecording}
            placeholder={isRecording ? "Listening..." : "Type your message... (Shift+Enter for new line)"}
            rows={1}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none scrollbar-thin disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={(!message.trim() && !transcript.trim()) || disabled || isLoading}
          className="flex-shrink-0 p-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          aria-label="Send message"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {isRecording && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
          <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Recording... Click mic again to stop and send
        </div>
      )}
    </div>
  );
}
