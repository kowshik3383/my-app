import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AIRole = "mother" | "father" | "brother" | "sister" | "grandparent" | "doctor" | "coach" | "friend";
export type AIModulation = "soft_caring" | "strict_motivational" | "professional" | "energetic" | "calm";
export type Language = "en" | "hi" | "ta" | "te" | "bn";
export type DiseaseFocus = "diabetes" | "heart" | "weight_loss" | "pcos" | "mental_health" | "custom";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
  createdAt: Date;
}

interface UserProfile {
  id?: string;
  aiRole: AIRole;
  aiModulation: AIModulation;
  language: Language;
  diseaseFocus: DiseaseFocus;
  customTopic?: string;
}

interface Store {
  // User profile
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  isOnboarded: boolean;
  setIsOnboarded: (value: boolean) => void;

  // Chat state
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  
  // UI state
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  isRecording: boolean;
  setIsRecording: (value: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      // User profile
      userProfile: null,
      setUserProfile: (profile) => set({ userProfile: profile }),
      isOnboarded: false,
      setIsOnboarded: (value) => set({ isOnboarded: value }),

      // Chat state
      currentSessionId: null,
      setCurrentSessionId: (id) => set({ currentSessionId: id }),
      messages: [],
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

      // UI state
      isLoading: false,
      setIsLoading: (value) => set({ isLoading: value }),
      isRecording: false,
      setIsRecording: (value) => set({ isRecording: value }),
      isSidebarOpen: false,
      setIsSidebarOpen: (value) => set({ isSidebarOpen: value }),
    }),
    {
      name: "health-companion-storage",
      partialize: (state) => ({
        userProfile: state.userProfile,
        isOnboarded: state.isOnboarded,
        currentSessionId: state.currentSessionId,
      }),
    }
  )
);
