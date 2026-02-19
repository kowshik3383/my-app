"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { Loader2, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

export default function Chat() {
  const {
    userProfile,
    currentSessionId,
    messages,
    addMessage,
    setMessages,
    isLoading,
    setIsLoading,
    setCurrentSessionId,
  } = useStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session on mount
  useEffect(() => {
    const initializeSession = async () => {
      if (!userProfile?.id) return;

      try {
        // Create new session
        const response = await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userProfile.id }),
        });

        if (!response.ok) throw new Error("Failed to create session");

        const { session } = await response.json();
        setCurrentSessionId(session.id);
      } catch (error) {
        console.error("Error initializing session:", error);
        toast.error("Failed to initialize chat session");
      }
    };

    if (!currentSessionId && userProfile?.id) {
      initializeSession();
    }
  }, [userProfile, currentSessionId, setCurrentSessionId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (messageText: string) => {
    if (!userProfile?.id || !currentSessionId) {
      toast.error("Session not initialized");
      return;
    }

    // Add user message to UI immediately
    const userMessage = {
      id: `temp-${Date.now()}`,
      role: "user" as const,
      content: messageText,
      createdAt: new Date(),
    };
    addMessage(userMessage);

    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userProfile.id,
          sessionId: currentSessionId,
          message: messageText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const { message: aiMessage } = await response.json();

      // Add AI response to messages
      addMessage({
        id: aiMessage.id,
        role: aiMessage.role,
        content: aiMessage.content,
        audioUrl: aiMessage.audioUrl,
        createdAt: new Date(aiMessage.createdAt),
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentSessionId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Initializing chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-600">
                Your AI health companion is ready to assist you. Type a message or use voice input to get started.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                audioUrl={message.audioUrl}
                timestamp={message.createdAt}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
}
