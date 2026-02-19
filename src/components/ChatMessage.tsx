"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
  timestamp: Date;
}

export default function ChatMessage({ role, content, audioUrl, timestamp }: ChatMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setIsPlaying(false);
    }
  }, []);

  const toggleAudio = () => {
    if (!audioUrl || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 animate-fade-in`}>
      <div className={`max-w-[75%] ${isUser ? "order-2" : "order-1"}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-br-sm"
              : "bg-gray-100 text-gray-900 rounded-bl-sm"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>

        <div className={`flex items-center gap-2 mt-1 px-2 ${isUser ? "justify-end" : "justify-start"}`}>
          <span className="text-xs text-gray-500">
            {new Date(timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {!isUser && audioUrl && (
            <>
              <button
                onClick={toggleAudio}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                aria-label={isPlaying ? "Stop audio" : "Play audio"}
              >
                {isPlaying ? (
                  <VolumeX className="w-4 h-4 text-gray-600" />
                ) : (
                  <Volume2 className="w-4 h-4 text-gray-600" />
                )}
              </button>
              <audio ref={audioRef} src={audioUrl} preload="metadata" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
