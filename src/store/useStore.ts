import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EmotionState } from "@/lib/emotion";

// ─── Expanded Role Type (all 20 roles) ────────────────────────────────────────
export type AIRole =
  | "mother" | "father" | "sister" | "brother" | "grandparent"
  | "doctor" | "therapist" | "nurse"
  | "coach" | "mentor" | "teacher"
  | "friend" | "best_friend" | "girlfriend" | "partner"
  | "leader" | "boss" | "teammate"
  | "spiritual_guide" | "motivator" | "caregiver";

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
  selectedVoiceId?: string;
  userName?: string;
}

interface EmotionHUD {
  currentEmotion: EmotionState;
  intensity: number;
  isVisible: boolean;
}

interface SpeechControl {
  isSpeaking: boolean;
  isInterrupted: boolean;
  interruptProgress: number;
}

interface Store {
  // User profile
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  updateUserName: (name: string) => void;
  updateSelectedVoice: (voiceId: string) => void;
  isOnboarded: boolean;
  setIsOnboarded: (value: boolean) => void;

  // Chat state
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;

  // Emotion HUD
  emotionHUD: EmotionHUD;
  setEmotionHUD: (hud: Partial<EmotionHUD>) => void;

  // Speech control
  speechControl: SpeechControl;
  setSpeechControl: (ctrl: Partial<SpeechControl>) => void;

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
      updateUserName: (name) =>
        set((state) => ({
          userProfile: state.userProfile ? { ...state.userProfile, userName: name } : null,
        })),
      updateSelectedVoice: (voiceId) =>
        set((state) => ({
          userProfile: state.userProfile
            ? { ...state.userProfile, selectedVoiceId: voiceId }
            : null,
        })),
      isOnboarded: false,
      setIsOnboarded: (value) => set({ isOnboarded: value }),

      // Chat state
      currentSessionId: null,
      setCurrentSessionId: (id) => set({ currentSessionId: id }),
      messages: [],
      setMessages: (messages) => set({ messages }),
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),

      // Emotion HUD
      emotionHUD: { currentEmotion: "neutral", intensity: 0, isVisible: true },
      setEmotionHUD: (hud) =>
        set((state) => ({ emotionHUD: { ...state.emotionHUD, ...hud } })),

      // Speech control
      speechControl: { isSpeaking: false, isInterrupted: false, interruptProgress: 0 },
      setSpeechControl: (ctrl) =>
        set((state) => ({ speechControl: { ...state.speechControl, ...ctrl } })),

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
        emotionHUD: { isVisible: state.emotionHUD.isVisible },
      }),
    }
  )
);
