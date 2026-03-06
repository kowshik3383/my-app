"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import {
  Settings, MessageCircle, LogOut, Moon, Sun, Phone,
} from "lucide-react";
import SettingsPanel from "./SettingsPanel";

const ROLE_LABELS: Record<string, string> = {
  mother: "Mother", father: "Father", brother: "Brother", sister: "Sister",
  grandparent: "Grandparent", doctor: "Doctor", therapist: "Therapist",
  nurse: "Nurse", coach: "Coach", mentor: "Mentor", teacher: "Teacher",
  friend: "Friend", best_friend: "Best Friend", girlfriend: "Girlfriend",
  partner: "Partner", leader: "Leader", boss: "Boss", teammate: "Teammate",
  spiritual_guide: "Spiritual Guide", motivator: "Motivator", caregiver: "Caregiver",
};

const FOCUS_LABELS: Record<string, string> = {
  diabetes: "Diabetes", heart: "Heart Health", weight_loss: "Weight Loss",
  pcos: "PCOS", mental_health: "Mental Health", custom: "Custom",
};

export default function Header() {
  const [showSettings, setShowSettings] = useState(false);
  const {
    userProfile,
    setIsOnboarded, setUserProfile, setMessages, setCurrentSessionId,
    isDarkMode, toggleDarkMode,
    interactionMode, setInteractionMode,
  } = useStore();

  const dark = isDarkMode;

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout? This will clear your current session.")) {
      setIsOnboarded(false);
      setUserProfile(null);
      setMessages([]);
      setCurrentSessionId(null);
    }
  };

  const roleLabel = ROLE_LABELS[userProfile?.aiRole || ""] || (userProfile?.aiRole ?? "AI");
  const focusLabel = FOCUS_LABELS[userProfile?.diseaseFocus || ""] || userProfile?.diseaseFocus || "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500&display=swap');

        .hdr-root {
          font-family: 'DM Sans', sans-serif;
          background: ${dark ? "#111114" : "#ffffff"};
          border-bottom: 1px solid ${dark ? "#262628" : "#eeebe7"};
          padding: 0 18px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
          transition: background 0.25s ease, border-color 0.25s ease;
        }

        .hdr-left {
          display: flex; align-items: center; gap: 10px; min-width: 0;
        }

        .hdr-icon {
          width: 32px; height: 32px; border-radius: 9px;
          background: ${dark ? "#f0f0f0" : "#1a1a1a"};
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .hdr-text { min-width: 0; }

        .hdr-title {
          font-family: 'DM Serif Display', serif;
          font-size: 15px; color: ${dark ? "#f0f0f0" : "#1a1a1a"};
          font-weight: 400; line-height: 1.2;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .hdr-meta { display: flex; align-items: center; gap: 5px; margin-top: 1px; }

        .hdr-status-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #22c55e;
          animation: statusPulse 2.5s ease-in-out infinite; flex-shrink: 0;
        }
        @keyframes statusPulse {
          0%,100% { opacity:1; } 50% { opacity:0.5; }
        }

        .hdr-tag {
          font-size: 11px; color: ${dark ? "#666" : "#a09c96"};
          font-weight: 400; letter-spacing: 0.01em; white-space: nowrap;
        }
        .hdr-role-pill {
          display: inline-block; padding: 1px 8px;
          background: ${dark ? "#1e1e22" : "#f5f3f0"};
          border-radius: 100px; font-size: 11px;
          color: ${dark ? "#bbb" : "#666"};
          font-weight: 500; letter-spacing: 0.01em;
        }
        .hdr-dot {
          width: 3px; height: 3px; border-radius: 50%;
          background: ${dark ? "#333" : "#d0ccc7"}; flex-shrink: 0;
        }

        .hdr-right { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }

        .hdr-btn {
          width: 34px; height: 34px; border-radius: 8px; border: none;
          background: transparent; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: ${dark ? "#555" : "#a09c96"}; transition: all 0.15s ease;
        }
        .hdr-btn:hover {
          background: ${dark ? "#1e1e22" : "#f5f3f0"};
          color: ${dark ? "#f0f0f0" : "#1a1a1a"};
        }
        .hdr-btn:active { transform: scale(0.93); }
        .hdr-btn-active {
          background: ${dark ? "#1e1e22" : "#1a1a1a"} !important;
          color: ${dark ? "#f0f0f0" : "#fff"} !important;
        }

        .hdr-divider {
          width: 1px; height: 16px;
          background: ${dark ? "#262628" : "#eeebe7"}; margin: 0 3px;
        }
      `}</style>

      <header className="hdr-root">
        <div className="hdr-left">
          <div className="hdr-icon">
            <MessageCircle
              size={15}
              color={dark ? "#1a1a1a" : "#ffffff"}
              strokeWidth={1.8}
            />
          </div>
          <div className="hdr-text">
            <h1 className="hdr-title">AI Companion</h1>
            {userProfile && (
              <div className="hdr-meta">
                <span className="hdr-status-dot" />
                <span className="hdr-role-pill">{roleLabel}</span>
                {focusLabel && (
                  <>
                    <span className="hdr-dot" />
                    <span className="hdr-tag">{focusLabel}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="hdr-right">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="hdr-btn"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            title={dark ? "Light mode" : "Dark mode"}
          >
            {dark
              ? <Sun size={16} strokeWidth={1.8} />
              : <Moon size={16} strokeWidth={1.8} />
            }
          </button>

          {/* Voice call mode toggle */}
          <button
            onClick={() => setInteractionMode(interactionMode === "chat" ? "voice_call" : "chat")}
            className={`hdr-btn ${interactionMode === "voice_call" ? "hdr-btn-active" : ""}`}
            aria-label={interactionMode === "voice_call" ? "Switch to chat" : "Switch to voice call"}
            title={interactionMode === "voice_call" ? "Back to chat" : "Voice call mode"}
          >
            <Phone size={16} strokeWidth={1.8} />
          </button>

          <div className="hdr-divider" />

          <button onClick={() => setShowSettings(true)} className="hdr-btn" aria-label="Settings">
            <Settings size={16} strokeWidth={1.8} />
          </button>
          <button onClick={handleLogout} className="hdr-btn" aria-label="Logout">
            <LogOut size={16} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </>
  );
}
