import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AIRole =
  | "mother" | "father" | "brother" | "sister" | "grandparent"
  | "doctor" | "therapist" | "nurse"
  | "coach" | "mentor" | "teacher"
  | "friend" | "best_friend" | "girlfriend" | "partner"
  | "leader" | "boss" | "teammate"
  | "spiritual_guide" | "motivator" | "caregiver";

export type AIModulation = "soft_caring" | "strict_motivational" | "professional" | "energetic" | "calm";
export type Language = "en" | "hi" | "ta" | "te" | "bn";
export type DiseaseFocus = "diabetes" | "heart" | "weight_loss" | "pcos" | "mental_health" | "custom";

export type CoachingStyle = "strict_coach" | "supportive_mentor" | "calm_doctor" | "accountability_partner";

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
  coachingStyle?: CoachingStyle;
}

export type ViewType = "chat" | "dashboard" | "goals" | "memory";

interface Store {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  isOnboarded: boolean;
  setIsOnboarded: (value: boolean) => void;

  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;

  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  isRecording: boolean;
  setIsRecording: (value: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;

  showDashboard: boolean;
  setShowDashboard: (value: boolean) => void;
  coachingStyle: CoachingStyle;
  setCoachingStyle: (style: CoachingStyle) => void;

  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  interactionMode: string;
  setInteractionMode: (value: string) => void;

  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      userProfile: null,
      setUserProfile: (profile) => set({ userProfile: profile }),
      isOnboarded: false,
      setIsOnboarded: (value) => set({ isOnboarded: value }),

      currentSessionId: null,
      setCurrentSessionId: (id) => set({ currentSessionId: id }),
      messages: [],
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

      isLoading: false,
      setIsLoading: (value) => set({ isLoading: value }),
      isRecording: false,
      setIsRecording: (value) => set({ isRecording: value }),
      isSidebarOpen: false,
      setIsSidebarOpen: (value) => set({ isSidebarOpen: value }),

      showDashboard: false,
      setShowDashboard: (value) => set({ showDashboard: value }),
      coachingStyle: "supportive_mentor",
      setCoachingStyle: (style) => set({ coachingStyle: style }),

      isDarkMode: false,
      setIsDarkMode: (value) => set({ isDarkMode: value }),
      interactionMode: "chat",
      setInteractionMode: (value) => set({ interactionMode: value }),

      currentView: "chat",
      setCurrentView: (view) => set({ currentView: view }),
    }),
    {
      name: "health-companion-storage",
      partialize: (state) => ({
        userProfile: state.userProfile,
        isOnboarded: state.isOnboarded,
        currentSessionId: state.currentSessionId,
        showDashboard: state.showDashboard,
        coachingStyle: state.coachingStyle,
      }),
    }
  )
);
