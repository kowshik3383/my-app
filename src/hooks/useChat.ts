import { create } from "zustand";
import { extractEmotionTags, stripEmotionTags } from "@/lib/lipsync";

interface AvatarMessage {
  text: string;
  audio: string;
  lipsync: any;
  facialExpression: string;
  animation: string;
}

export interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  text: string;       // clean text without emotion tags
  rawText?: string;   // original with emotion tags
  emotion?: string;   // primary emotion tag
  timestamp: Date;
}

interface ChatState {
  // Avatar processing queue
  messages: AvatarMessage[];
  message: AvatarMessage | null;
  loading: boolean;
  cameraZoomed: boolean;

  // Chat display history
  displayMessages: DisplayMessage[];

  chat: (text: string) => Promise<void>;
  onMessagePlayed: () => void;
  setCameraZoomed: (zoomed: boolean) => void;
  clearHistory: () => void;
}

export const useChat = create<ChatState>((set, get) => ({
  messages: [],
  message: null,
  loading: false,
  cameraZoomed: true,
  displayMessages: [],

  chat: async (text: string) => {
    if (!text || text.trim() === "") return;

    set({ loading: true });

    // Add user message to display history immediately
    const userMsg: DisplayMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: text.trim(),
      timestamp: new Date(),
    };
    set((state) => ({ displayMessages: [...state.displayMessages, userMsg] }));

    try {
      const storedState = localStorage.getItem("health-companion-storage");
      const userProfile = storedState
        ? JSON.parse(storedState).state?.userProfile
        : null;
      const currentSessionId = storedState
        ? JSON.parse(storedState).state?.currentSessionId
        : null;

      if (!userProfile?.id) {
        console.error("No user profile found");
        set({ loading: false });
        return;
      }

      // Create/reuse session
      let sessionId = currentSessionId;
      if (!sessionId) {
        const sessionResponse = await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userProfile.id }),
        });
        if (!sessionResponse.ok) throw new Error("Failed to create session");
        const { session } = await sessionResponse.json();
        sessionId = session.id;
        if (storedState) {
          const parsed = JSON.parse(storedState);
          parsed.state.currentSessionId = sessionId;
          localStorage.setItem("health-companion-storage", JSON.stringify(parsed));
        }
      }

      // Send to chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userProfile.id, sessionId, message: text }),
      });
      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();
      const rawContent: string = data.message.content || "";

      // Parse emotion tags
      const emotions = extractEmotionTags(rawContent);
      const primaryEmotion = emotions[0] || "happy";
      const cleanText = stripEmotionTags(rawContent);

      // Add AI message to display history
      const aiDisplayMsg: DisplayMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        text: cleanText,
        rawText: rawContent,
        emotion: primaryEmotion,
        timestamp: new Date(),
      };
      set((state) => ({ displayMessages: [...state.displayMessages, aiDisplayMsg] }));

      // Build avatar message (uses clean text for TTS fallback)
      const avatarMsg: AvatarMessage = {
        text: cleanText,
        audio: data.message.audio || "",
        lipsync: data.message.lipsync || { mouthCues: [] },
        facialExpression: data.message.facialExpression || "smile",
        animation: data.message.animation || "Talking_1",
      };

      set((state) => ({
        messages: [...state.messages, avatarMsg],
        message: avatarMsg,
        loading: false,
      }));
    } catch (error) {
      console.error("Error in chat:", error);
      set({ loading: false });
    }
  },

  onMessagePlayed: () => {
    set((state) => {
      const remaining = state.messages.slice(1);
      return {
        messages: remaining,
        message: remaining[0] || null,
      };
    });
  },

  setCameraZoomed: (zoomed: boolean) => set({ cameraZoomed: zoomed }),

  clearHistory: () => set({ displayMessages: [], messages: [], message: null }),
}));
