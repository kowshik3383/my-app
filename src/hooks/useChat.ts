import { create } from "zustand";

interface Message {
  text: string;
  audio: string;
  lipsync: any;
  facialExpression: string;
  animation: string;
}

interface ChatState {
  messages: Message[];
  message: Message | null;
  loading: boolean;
  cameraZoomed: boolean;
  chat: (text: string) => Promise<void>;
  onMessagePlayed: () => void;
  setCameraZoomed: (zoomed: boolean) => void;
}

export const useChat = create<ChatState>((set, get) => ({
  messages: [],
  message: null,
  loading: false,
  cameraZoomed: true,

  chat: async (text: string) => {
    if (!text || text.trim() === "") {
      return;
    }

    set({ loading: true });

    try {
      // Get user profile from localStorage (zustand persisted state)
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

        if (!sessionResponse.ok) {
          throw new Error("Failed to create session");
        }

        const { session } = await sessionResponse.json();
        sessionId = session.id;

        // Update session in localStorage
        if (storedState) {
          const parsed = JSON.parse(storedState);
          parsed.state.currentSessionId = sessionId;
          localStorage.setItem("health-companion-storage", JSON.stringify(parsed));
        }
      }

      // Send message to chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userProfile.id,
          sessionId: sessionId,
          message: text,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      // Create message object for avatar
      const aiMessage: Message = {
        text: data.message.content,
        audio: data.message.audioBase64 || "",
        lipsync: data.message.lipsync || { mouthCues: [] },
        facialExpression: data.message.facialExpression || "smile",
        animation: data.message.animation || "Talking_1",
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
  },

  setCameraZoomed: (zoomed: boolean) => {
    set({ cameraZoomed: zoomed });
  },
}));
