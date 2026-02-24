"use client";

import { Canvas } from "@react-three/fiber";
import { Experience } from "./3d/Experience";
import { useState, KeyboardEvent, useRef, useCallback, useEffect } from "react";
import { Send, Mic, MicOff, Loader2, Sparkles, Hand, Volume2, VolumeX } from "lucide-react";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useChat } from "@/hooks/useChat";
import { useStore } from "@/store/useStore";

// ─── Emotion metadata ──────────────────────────────────────────────────────────
const EMOTION_META: Record<string, { emoji: string; color: string; label: string }> = {
  happy:       { emoji: "😊", color: "text-amber-500",  label: "Happy" },
  excited:     { emoji: "🎉", color: "text-green-500",  label: "Excited" },
  sad:         { emoji: "💙", color: "text-blue-500",   label: "Empathetic" },
  frustrated:  { emoji: "😤", color: "text-red-500",    label: "Concerned" },
  anxious:     { emoji: "😟", color: "text-orange-500", label: "Attentive" },
  empathetic:  { emoji: "💚", color: "text-teal-500",   label: "Caring" },
  encouraging: { emoji: "💪", color: "text-purple-500", label: "Encouraging" },
  thinking:    { emoji: "🤔", color: "text-gray-500",   label: "Thinking" },
  neutral:     { emoji: "🙂", color: "text-gray-500",   label: "Ready" },
};

export default function AvatarChat() {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { chat, loading, triggerInterrupt, message: currentAvatarMessage } = useChat();
  const { emotionHUD, setEmotionHUD, userProfile, speechControl } = useStore();

  // Voice recording with barge-in callback
  const handleBargeIn = useCallback(() => {
    if (currentAvatarMessage) {
      triggerInterrupt();
    }
  }, [currentAvatarMessage, triggerInterrupt]);

  const {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
    error,
  } = useVoiceRecording({
    language: userProfile?.language,
    onBargeIn: handleBargeIn,
  });

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
        setTimeout(() => chat(transcript.trim()), 100);
      }
    } else {
      startRecording();
    }
  };

  const handleInterrupt = () => {
    triggerInterrupt();
  };

  const currentText = isRecording ? transcript : message;
  const emotionInfo = EMOTION_META[emotionHUD.currentEmotion] || EMOTION_META.neutral;
  const isSpeaking = speechControl.isSpeaking;

  return (
    <div className="h-full flex flex-col relative bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* 3D Canvas */}
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

        {/* ── Emotion HUD (top-left) ─────────────────────────────────────────── */}
        {emotionHUD.isVisible && emotionHUD.currentEmotion !== "neutral" && (
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow border border-gray-100 flex items-center gap-1.5">
              <span className="text-base leading-none">{emotionInfo.emoji}</span>
              <span className={`text-xs font-semibold ${emotionInfo.color}`}>
                {emotionInfo.label}
              </span>
              {/* Intensity bar */}
              <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(emotionHUD.intensity * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Speaking indicator + interrupt button (top-right) ─────────────── */}
        {isSpeaking && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
            {/* Waveform animation */}
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow border border-green-100 flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-green-500" />
              <div className="flex items-end gap-0.5 h-3">
                {[1.5, 3, 2, 3.5, 2, 2.5, 1.5].map((h, i) => (
                  <div
                    key={i}
                    className="w-0.5 bg-green-500 rounded-full animate-pulse"
                    style={{ height: `${h * 3}px`, animationDelay: `${i * 80}ms` }}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-green-600">Speaking</span>
            </div>

            {/* Interrupt / Barge-in button */}
            <button
              onClick={handleInterrupt}
              title="Interrupt (or just start talking)"
              className="bg-white/90 backdrop-blur-sm border border-red-200 text-red-500 px-3 py-1.5 rounded-full text-xs font-semibold shadow hover:bg-red-50 transition-colors flex items-center gap-1.5 active:scale-95"
            >
              <Hand className="w-3.5 h-3.5" />
              Interrupt
            </button>
          </div>
        )}

        {/* ── Loading indicator ──────────────────────────────────────────────── */}
        {loading && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg border border-green-100 flex items-center gap-2.5">
              <div className="relative">
                <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
                <Sparkles className="w-2.5 h-2.5 text-green-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span className="text-sm font-medium text-gray-700">Thinking...</span>
            </div>
          </div>
        )}

        {/* ── Idle welcome ──────────────────────────────────────────────────── */}
        {!loading && !isSpeaking && !currentAvatarMessage && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 px-4 w-full max-w-sm hidden md:block">
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-2xl shadow-sm border border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                {userProfile?.userName
                  ? `👋 Hey ${userProfile.userName}! How are you feeling today?`
                  : "👋 Hi! I'm your AI health companion. How can I help?"}
              </p>
            </div>
          </div>
        )}

        {/* ── Barge-in tip (shows while recording + avatar speaking) ─────── */}
        {isRecording && isSpeaking && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg animate-bounce">
              🎤 Barge-in detected — avatar will stop
            </div>
          </div>
        )}
      </div>

      {/* ── Input Controls ─────────────────────────────────────────────────────── */}
      <div className="border-t border-gray-200 bg-white/95 backdrop-blur-md shadow-lg flex-shrink-0">
        <div className="max-w-4xl mx-auto p-3 sm:p-4">
          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-2">
              <span className="text-red-400 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-end gap-2">
            {/* Mic button */}
            <button
              onClick={handleVoiceToggle}
              disabled={loading}
              title={isRecording ? "Stop recording" : "Start voice input (or talk to interrupt)"}
              className={`flex-shrink-0 p-3 sm:p-3.5 rounded-full transition-all shadow-md ${
                isRecording
                  ? "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-200 scale-110"
                  : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 hover:shadow-lg"
              } disabled:opacity-50 disabled:cursor-not-allowed active:scale-95`}
              aria-label={isRecording ? "Stop recording" : "Start voice input"}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Text input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={currentText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={loading || isRecording}
                placeholder={isRecording ? "🎤 Listening... (speaking will interrupt avatar)" : "Type your message..."}
                rows={1}
                className="w-full px-4 py-3 sm:py-3.5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-400 focus:border-green-400 resize-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-sm sm:text-base shadow-sm placeholder:text-gray-400"
                style={{ minHeight: "48px" }}
              />
            </div>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={(!message.trim() && !transcript.trim()) || loading}
              className="flex-shrink-0 p-3 sm:p-3.5 bg-gradient-to-br from-green-500 to-blue-500 text-white rounded-full hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl active:scale-95"
              aria-label="Send message"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>

          {/* Recording indicator */}
          {isRecording && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-red-600">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              <span className="font-medium">Recording — speak to interrupt avatar</span>
            </div>
          )}

          {/* Tips */}
          {!loading && !isRecording && !message && (
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-400">
                <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> send •{" "}
                <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Shift+Enter</kbd> new line •{" "}
                🎤 speak anytime to interrupt
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
