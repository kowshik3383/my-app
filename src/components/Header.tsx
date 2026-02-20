"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Settings, MessageCircle, LogOut } from "lucide-react";
import SettingsPanel from "./SettingsPanel";

export default function Header() {
  const [showSettings, setShowSettings] = useState(false);
  const {
    userProfile,
    setIsOnboarded,
    setUserProfile,
    setMessages,
    setCurrentSessionId,
  } = useStore();

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

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      mother: "Mother",
      father: "Father",
      brother: "Brother",
      sister: "Sister",
      grandparent: "Grandparent",
      doctor: "Doctor",
      coach: "Coach",
      friend: "Friend",
    };
    return roleMap[role] || role;
  };

  const getFocusLabel = (focus: string) => {
    const focusMap: Record<string, string> = {
      diabetes: "Diabetes",
      heart: "Heart Health",
      weight_loss: "Weight Loss",
      pcos: "PCOS",
      mental_health: "Mental Health",
      custom: "Custom",
    };
    return focusMap[focus] || focus;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500&display=swap');

        .hdr-root {
          font-family: 'DM Sans', sans-serif;
          background: #ffffff;
          border-bottom: 1px solid #eeebe7;
          padding: 0 20px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .hdr-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .hdr-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .hdr-text { min-width: 0; }

        .hdr-title {
          font-family: 'DM Serif Display', serif;
          font-size: 16px;
          color: #1a1a1a;
          font-weight: 400;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
        }

        .hdr-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
        }

        .hdr-tag {
          font-size: 11px;
          color: #a09c96;
          font-weight: 400;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }

        .hdr-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #d0ccc7;
          flex-shrink: 0;
        }

        .hdr-right {
          display: flex;
          align-items: center;
          gap: 2px;
          flex-shrink: 0;
        }

        .hdr-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a09c96;
          transition: all 0.15s ease;
        }

        .hdr-btn:hover {
          background: #f5f3f0;
          color: #1a1a1a;
        }

        .hdr-btn:active { transform: scale(0.94); }
        
        .hdr-divider {
          width: 1px;
          height: 18px;
          background: #eeebe7;
          margin: 0 4px;
        }
      `}</style>

      <header className="hdr-root">
        <div className="hdr-left">
          <div className="hdr-icon">
            <MessageCircle size={16} color="#ffffff" strokeWidth={1.8} />
          </div>
          <div className="hdr-text">
            <h1 className="hdr-title">AI Health Companion</h1>
            {userProfile && (
              <div className="hdr-meta">
                <span className="hdr-tag">
                  {getRoleLabel(userProfile.aiRole)}
                </span>
                <span className="hdr-dot" />
                <span className="hdr-tag">
                  {getFocusLabel(userProfile.diseaseFocus)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="hdr-right">
          <button
            onClick={() => setShowSettings(true)}
            className="hdr-btn"
            aria-label="Settings"
          >
            <Settings size={17} strokeWidth={1.8} />
          </button>
          <div className="hdr-divider" />
          <button
            onClick={handleLogout}
            className="hdr-btn"
            aria-label="Logout"
          >
            <LogOut size={17} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </>
  );
}
