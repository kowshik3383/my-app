import { create } from "zustand";
import { useStore } from "@/store/useStore";

export interface AvatarMessage {
  text: string;
  audio: string;
  lipsync: any;
  facialExpression: string;
  animation: string;
  emotionState?: string;
  emotionIntensity?: number;
}

interface ChatState {
  messages: AvatarMessage[];
  message: AvatarMessage | null;
  loading: boolean;
  cameraZoomed: boolean;
  /** Signal to interrupt current speech immediately */
  interruptSignal: number;
  chat: (text: string) => Promise<void>;
  onMessagePlayed: () => void;
  setCameraZoomed: (zoomed: boolean) => void;
  triggerInterrupt: () => void;
}

export const useChat = create<ChatState>((set, get) => ({
  messages: [],
  message: null,
  loading: false,
  cameraZoomed: true,
  interruptSignal: 0,

  chat: async (text: string) => {
    if (!text || text.trim() === "") return;

    // If avatar is currently speaking, interrupt it first
    if (get().message) {
      get().triggerInterrupt();
    }

    set({ loading: true });

    try {
      const storedState = localStorage.getItem("health-companion-storage");
      const userProfile = storedState
        ? JSON.parse(storedState).state.userProfile
        : null;
      const currentSessionId = storedState
        ? JSON.parse(storedState).state.currentSessionId
        : null;

      if (!userProfile?.id) {
        console.error("No user profile found");
        set({ loading: false });
        return;
      }

      // Initialize session if not exists
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

        // Update session in persisted state
        if (storedState) {
          const parsed = JSON.parse(storedState);
          parsed.state.currentSessionId = sessionId;
          localStorage.setItem("health-companion-storage", JSON.stringify(parsed));
        }

        // Also update zustand store
        useStore.getState().setCurrentSessionId(sessionId);
      }

      // Send message to chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userProfile.id, sessionId, message: text }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();

      // Update emotion HUD in store
      if (data.message.emotionState) {
        useStore.getState().setEmotionHUD({
          currentEmotion: data.message.emotionState,
          intensity: data.message.emotionIntensity || 0.5,
        });
      }

      const aiMessage: AvatarMessage = {
        text: data.message.content,
        audio: data.message.audioBase64 || "",
        lipsync: data.message.lipsync || { mouthCues: [] },
        facialExpression: data.message.facialExpression || "smile",
        animation: data.message.animation || "Talking_1",
        emotionState: data.message.emotionState,
        emotionIntensity: data.message.emotionIntensity,
      };

      set((state) => ({
        messages: [...state.messages, aiMessage],
        message: aiMessage,
        loading: false,
      }));
    } catch (error) {
      console.error("Error in chat:", error);
      set({ loading: false });
    }
  },

  onMessagePlayed: () => {
    set({ message: null });
    useStore.getState().setSpeechControl({ isSpeaking: false });
  },

  setCameraZoomed: (zoomed: boolean) => {
    set({ cameraZoomed: zoomed });
  },

  triggerInterrupt: () => {
    set((state) => ({
      interruptSignal: state.interruptSignal + 1,
      message: null,
    }));
    useStore.getState().setSpeechControl({ isSpeaking: false, isInterrupted: true });
  },
}));
