"use client";

import { Canvas } from "@react-three/fiber";
import { Experience } from "./3d/Experience";
import { useState, KeyboardEvent, useRef } from "react";
import { Send, Mic, MicOff, Loader2, Sparkles } from "lucide-react";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useChat } from "@/hooks/useChat";

export default function AvatarChat() {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isRecording, transcript, startRecording, stopRecording, error } = useVoiceRecording();
  const { chat, loading } = useChat();

  const handleSend = async () => {
    const textToSend = message.trim() || transcript.trim();
    if (textToSend && !loading) {
      await chat(textToSend);
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
          chat(transcript.trim());
        }, 100);
      }
    } else {
      startRecording();
    }
  };

  const currentText = isRecording ? transcript : message;

  return (
    <div className="h-full flex flex-col relative bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* 3D Canvas - Main Avatar Display */}
      <div className="flex-1 relative min-h-0">
        <div className="absolute inset-0">
          <Canvas 
            shadows 
            camera={{ position: [0, 0, 1], fov: 30 }}
            className="touch-none"
          >
            <Experience />
          </Canvas>
        </div>

        {/* Loading indicator overlay */}
        {loading && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-full shadow-lg border border-green-100 flex items-center gap-3">
              <div className="relative">
                <Loader2 className="w-5 h-5 text-green-500 animate-spin" />
                <Sparkles className="w-3 h-3 text-green-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span className="text-sm font-medium text-gray-700">AI is thinking...</span>
            </div>
          </div>
        )}

        {/* Welcome message when idle */}
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

      {/* Input Controls - Bottom */}
      <div className="border-t border-gray-200 bg-white/95 backdrop-blur-md shadow-lg">
        <div className="max-w-4xl mx-auto p-3 sm:p-4">
          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-2">
              <span className="text-red-500 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-end gap-2">
            {/* Voice input button */}
            <button
              onClick={handleVoiceToggle}
              disabled={loading}
              className={`flex-shrink-0 p-3 sm:p-3.5 rounded-full transition-all shadow-md ${
                isRecording
                  ? "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-200 scale-110"
                  : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 hover:shadow-lg"
              } disabled:opacity-50 disabled:cursor-not-allowed active:scale-95`}
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
                disabled={loading || isRecording}
                placeholder={isRecording ? "🎤 Listening..." : "Type your message..."}
                rows={1}
                className="w-full px-4 py-3 sm:py-3.5 pr-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-400 focus:border-green-400 resize-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-sm sm:text-base shadow-sm placeholder:text-gray-400"
                style={{ minHeight: '48px' }}
              />
            </div>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={(!message.trim() && !transcript.trim()) || loading}
              className="flex-shrink-0 p-3 sm:p-3.5 bg-gradient-to-br from-green-500 to-blue-500 text-white rounded-full hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:shadow-md"
              aria-label="Send message"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Recording indicator */}
          {isRecording && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-red-600 animate-in fade-in slide-in-from-bottom-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="font-medium">Recording... Tap mic to stop and send</span>
            </div>
          )}

          {/* Tips */}
          {!loading && !isRecording && !message && (
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">
                Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> to send • 
                <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs ml-1">Shift + Enter</kbd> for new line
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
