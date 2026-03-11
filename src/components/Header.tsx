"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import {
  Settings,
  MessageCircle,
  LogOut,
  Moon,
  Sun,
  Phone,
} from "lucide-react";
import SettingsPanel from "./SettingsPanel";

const ROLE_LABELS: Record<string, string> = {
  mother: "Mother",
  father: "Father",
  brother: "Brother",
  sister: "Sister",
  grandparent: "Grandparent",
  doctor: "Doctor",
  therapist: "Therapist",
  nurse: "Nurse",
  coach: "Coach",
  mentor: "Mentor",
  teacher: "Teacher",
  friend: "Friend",
  best_friend: "Best Friend",
  girlfriend: "Girlfriend",
  partner: "Partner",
  leader: "Leader",
  boss: "Boss",
  teammate: "Teammate",
  spiritual_guide: "Spiritual Guide",
  motivator: "Motivator",
  caregiver: "Caregiver",
};

const FOCUS_LABELS: Record<string, string> = {
  diabetes: "Diabetes",
  heart: "Heart Health",
  weight_loss: "Weight Loss",
  pcos: "PCOS",
  mental_health: "Mental Health",
  custom: "Custom",
};

export default function Header() {
  const [showSettings, setShowSettings] = useState(false);
  const {
    userProfile,
    setIsOnboarded,
    setUserProfile,
    setMessages,
    setCurrentSessionId,
    isDarkMode,
    toggleDarkMode,
    interactionMode,
    setInteractionMode,
  } = useStore();

  const dark = isDarkMode;

  const handleLogout = () => {
    if (
      confirm(
        "Are you sure you want to logout? This will clear your current session.",
      )
    ) {
      setIsOnboarded(false);
      setUserProfile(null);
      setMessages([]);
      setCurrentSessionId(null);
    }
  };

  const roleLabel =
    ROLE_LABELS[userProfile?.aiRole || ""] || (userProfile?.aiRole ?? "AI");
  const focusLabel =
    FOCUS_LABELS[userProfile?.diseaseFocus || ""] ||
    userProfile?.diseaseFocus ||
    "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500&display=swap');
        .font-dm-serif { font-family: 'DM Serif Display', serif; }
        .font-dm-sans { font-family: 'DM Sans', sans-serif; }
        @keyframes statusPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-status-pulse { animation: statusPulse 2.5s ease-in-out infinite; }
      `}</style>

      <header
        className={`
          font-dm-sans bg-transparent border-none
          px-[18px] h-14 flex items-center justify-between
          sticky top-0 z-50 transition-[background,border-color] duration-[250ms] ease-in-out
        `}
      >
        {/* Left */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Icon */}
          <div
            className={`
              w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0
              ${dark ? "bg-[#f0f0f0]" : "bg-[#1a1a1a]"}
            `}
          >
            <MessageCircle
              size={15}
              color={dark ? "#1a1a1a" : "#ffffff"}
              strokeWidth={1.8}
            />
          </div>

          {/* Text */}
          <div className="min-w-0">
            <h1
              className={`
                font-dm-serif text-[15px] font-normal leading-tight
                whitespace-nowrap overflow-hidden text-ellipsis
                ${dark ? "text-[#f0f0f0]" : "text-[#1a1a1a]"}
              `}
            >
              AI Companion
            </h1>

            {userProfile && (
              <div className="flex items-center gap-[5px] mt-[1px]">
                {/* Status dot */}
                <span
                  className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0 animate-status-pulse"
                />

                {/* Role pill */}
                <span
                  className={`
                    inline-block px-2 py-[1px] rounded-full text-[11px] font-medium tracking-[0.01em]
                    ${dark ? "bg-[#1e1e22] text-[#bbb]" : "bg-[#f5f3f0] text-[#666]"}
                  `}
                >
                  {roleLabel}
                </span>

                {focusLabel && (
                  <>
                    {/* Separator dot */}
                    <span
                      className={`
                        w-[3px] h-[3px] rounded-full flex-shrink-0
                        ${dark ? "bg-[#333]" : "bg-[#d0ccc7]"}
                      `}
                    />
                    {/* Focus tag */}
                    <span
                      className={`
                        text-[11px] font-normal tracking-[0.01em] whitespace-nowrap
                        ${dark ? "text-[#666]" : "text-[#a09c96]"}
                      `}
                    >
                      {focusLabel}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            title={dark ? "Light mode" : "Dark mode"}
            className={`
              w-[34px] h-[34px] rounded-lg border-none bg-transparent cursor-pointer
              flex items-center justify-center transition-all duration-150 ease-in-out
              active:scale-95
              ${dark
                ? "text-[#555] hover:bg-[#1e1e22] hover:text-[#f0f0f0]"
                : "text-[#a09c96] hover:bg-[#f5f3f0] hover:text-[#1a1a1a]"
              }
            `}
          >
            {dark ? (
              <Sun size={16} strokeWidth={1.8} />
            ) : (
              <Moon size={16} strokeWidth={1.8} />
            )}
          </button>

          {/* Voice call mode toggle */}
          <button
            onClick={() =>
              setInteractionMode(
                interactionMode === "chat" ? "voice_call" : "chat",
              )
            }
            aria-label={
              interactionMode === "voice_call"
                ? "Switch to chat"
                : "Switch to voice call"
            }
            title={
              interactionMode === "voice_call"
                ? "Back to chat"
                : "Voice call mode"
            }
            className={`
              w-[34px] h-[34px] rounded-lg border-none cursor-pointer
              flex items-center justify-center transition-all duration-150 ease-in-out
              active:scale-95
              ${interactionMode === "voice_call"
                ? dark
                  ? "bg-[#1e1e22] text-[#f0f0f0]"
                  : "bg-[#1a1a1a] text-white"
                : dark
                  ? "bg-transparent text-[#555] hover:bg-[#1e1e22] hover:text-[#f0f0f0]"
                  : "bg-transparent text-[#a09c96] hover:bg-[#f5f3f0] hover:text-[#1a1a1a]"
              }
            `}
          >
            <Phone size={16} strokeWidth={1.8} />
          </button>

          {/* Divider */}
          <div
            className={`
              w-px h-4 mx-[3px]
              ${dark ? "bg-[#262628]" : "bg-[#eeebe7]"}
            `}
          />

          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            aria-label="Settings"
            className={`
              w-[34px] h-[34px] rounded-lg border-none bg-transparent cursor-pointer
              flex items-center justify-center transition-all duration-150 ease-in-out
              active:scale-95
              ${dark
                ? "text-[#555] hover:bg-[#1e1e22] hover:text-[#f0f0f0]"
                : "text-[#a09c96] hover:bg-[#f5f3f0] hover:text-[#1a1a1a]"
              }
            `}
          >
            <Settings size={16} strokeWidth={1.8} />
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            aria-label="Logout"
            className={`
              w-[34px] h-[34px] rounded-lg border-none bg-transparent cursor-pointer
              flex items-center justify-center transition-all duration-150 ease-in-out
              active:scale-95
              ${dark
                ? "text-[#555] hover:bg-[#1e1e22] hover:text-[#f0f0f0]"
                : "text-[#a09c96] hover:bg-[#f5f3f0] hover:text-[#1a1a1a]"
              }
            `}
          >
            <LogOut size={16} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </>
  );
}