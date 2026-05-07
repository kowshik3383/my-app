"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Settings, MessageCircle, LogOut, BarChart3, Sparkles } from "lucide-react";
import SettingsPanel from "./SettingsPanel";
import MemoryIndicator from "./memory/MemoryIndicator";

export default function Header() {
  const [showSettings, setShowSettings] = useState(false);
  const {
    userProfile,
    setIsOnboarded,
    setUserProfile,
    setMessages,
    setCurrentSessionId,
    setShowDashboard,
    showDashboard,
    isDarkMode,
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

  const roleLabel =
    ROLE_LABELS[userProfile?.aiRole || ""] || (userProfile?.aiRole ?? "AI");
  const focusLabel =
    FOCUS_LABELS[userProfile?.diseaseFocus || ""] ||
    userProfile?.diseaseFocus ||
    "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        .hdr-root {
          font-family: 'DM Sans', sans-serif;
          position: sticky;
          top: 0;
          z-index: 50;
          padding: 0 20px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: background 300ms ease, border-color 300ms ease, backdrop-filter 300ms ease;
        }

        /* Light */
        .hdr-root.light {
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(18px) saturate(1.6);
          -webkit-backdrop-filter: blur(18px) saturate(1.6);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 1px 0 rgba(255,255,255,0.8), 0 2px 12px rgba(0,0,0,0.04);
        }

        /* Dark */
        .hdr-root.dark {
          background: rgba(14, 14, 16, 0.78);
          backdrop-filter: blur(18px) saturate(1.4);
          -webkit-backdrop-filter: blur(18px) saturate(1.4);
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          box-shadow: 0 1px 0 rgba(255,255,255,0.04), 0 2px 16px rgba(0,0,0,0.25);
        }

        /* Brand icon */
        .hdr-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
          transition: transform 200ms ease;
        }
        .hdr-icon:hover { transform: scale(1.05); }
        .hdr-icon.light {
          background: linear-gradient(135deg, #1a1a1a 0%, #3a3a3a 100%);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.12);
        }
        .hdr-icon.dark {
          background: linear-gradient(135deg, #f0f0f0 0%, #d8d8d8 100%);
          box-shadow: 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.6);
        }

        /* Title */
        .hdr-title {
          font-family: 'Instrument Serif', serif;
          font-size: 16px;
          font-weight: 400;
          line-height: 1.2;
          letter-spacing: -0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 200ms ease;
        }
        .hdr-title.light { color: #111; }
        .hdr-title.dark  { color: #f0f0f0; }

        /* Status row */
        .hdr-status-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
        }

        /* Live dot */
        .hdr-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          background: #22c55e;
          position: relative;
        }
        .hdr-dot::after {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          background: rgba(34, 197, 94, 0.3);
          animation: hdrPing 2s ease-in-out infinite;
        }
        @keyframes hdrPing {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 0; transform: scale(2.2); }
        }

        /* Role pill */
        .hdr-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 1px 8px 1px 6px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.02em;
          transition: background 200ms ease, color 200ms ease;
        }
        .hdr-pill.light {
          background: rgba(0,0,0,0.06);
          color: #444;
          border: 1px solid rgba(0,0,0,0.06);
        }
        .hdr-pill.dark {
          background: rgba(255,255,255,0.08);
          color: #ccc;
          border: 1px solid rgba(255,255,255,0.08);
        }

        /* Focus tag */
        .hdr-focus {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.02em;
        }
        .hdr-focus.light { color: #999; }
        .hdr-focus.dark  { color: #555; }

        /* Separator */
        .hdr-sep {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .hdr-sep.light { background: #d0ccc7; }
        .hdr-sep.dark  { background: #333; }

        /* Right group */
        .hdr-actions {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        /* Divider */
        .hdr-vdivider {
          width: 1px;
          height: 20px;
          margin: 0 6px;
          flex-shrink: 0;
        }
        .hdr-vdivider.light { background: rgba(0,0,0,0.1); }
        .hdr-vdivider.dark  { background: rgba(255,255,255,0.1); }

        /* Icon buttons */
        .hdr-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 150ms ease, color 150ms ease, transform 120ms ease;
          position: relative;
        }
        .hdr-btn:active { transform: scale(0.92); }

        /* Button tooltip */
        .hdr-btn::before {
          content: attr(data-tip);
          position: absolute;
          bottom: -30px;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 6px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 150ms ease 300ms;
          z-index: 100;
        }
        .hdr-btn:hover::before { opacity: 1; }

        .hdr-btn.light {
          color: #9a9690;
        }
        .hdr-btn.light::before {
          background: #111;
          color: #fff;
        }
        .hdr-btn.light:hover {
          background: rgba(0,0,0,0.06);
          color: #111;
        }

        .hdr-btn.dark {
          color: #555;
        }
        .hdr-btn.dark::before {
          background: #f0f0f0;
          color: #111;
        }
        .hdr-btn.dark:hover {
          background: rgba(255,255,255,0.08);
          color: #f0f0f0;
        }

        /* Active dashboard button */
        .hdr-btn.active-light {
          background: rgba(0,0,0,0.08);
          color: #111;
        }
        .hdr-btn.active-dark {
          background: rgba(255,255,255,0.1);
          color: #f0f0f0;
        }

        /* Logout — slightly different hover */
        .hdr-btn.logout.light:hover {
          background: rgba(239,68,68,0.08);
          color: #ef4444;
        }
        .hdr-btn.logout.dark:hover {
          background: rgba(239,68,68,0.12);
          color: #f87171;
        }
      `}</style>

      <header className={`hdr-root ${dark ? "dark" : "light"}`}>
        {/* ── Left: brand + context ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <div className={`hdr-icon ${dark ? "dark" : "light"}`}>
            <Sparkles
              size={15}
              color={dark ? "#1a1a1a" : "#ffffff"}
              strokeWidth={1.8}
            />
          </div>

          <div style={{ minWidth: 0 }}>
            <h1 className={`hdr-title ${dark ? "dark" : "light"}`}>
              AI Companion
            </h1>

            {userProfile && (
              <div className="hdr-status-row">
                <span className="hdr-dot" />

                <span className={`hdr-pill ${dark ? "dark" : "light"}`}>
                  <MessageCircle size={9} strokeWidth={2.2} />
                  {roleLabel}
                </span>

                {focusLabel && (
                  <>
                    <span className={`hdr-sep ${dark ? "dark" : "light"}`} />
                    <span className={`hdr-focus ${dark ? "dark" : "light"}`}>
                      {focusLabel}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: actions ── */}
        <div className="hdr-actions">
          {userProfile?.id && <MemoryIndicator userId={userProfile.id} />}

          <div className={`hdr-vdivider ${dark ? "dark" : "light"}`} />

          <button
            onClick={() => setShowDashboard(!showDashboard)}
            className={`hdr-btn ${dark ? "dark" : "light"} ${
              showDashboard
                ? dark ? "active-dark" : "active-light"
                : ""
            }`}
            aria-label="Dashboard"
            data-tip="Dashboard"
          >
            <BarChart3 size={16} strokeWidth={1.8} />
          </button>

          <button
            onClick={() => setShowSettings(true)}
            aria-label="Settings"
            data-tip="Settings"
            className={`hdr-btn ${dark ? "dark" : "light"}`}
          >
            <Settings size={16} strokeWidth={1.8} />
          </button>

          <button
            onClick={handleLogout}
            aria-label="Logout"
            data-tip="Logout"
            className={`hdr-btn logout ${dark ? "dark" : "light"}`}
          >
            <LogOut size={16} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </>
  );
}