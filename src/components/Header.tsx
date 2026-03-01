"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Settings, LogOut } from "lucide-react";
import SettingsPanel from "./SettingsPanel";
import { getRoleConfig } from "@/lib/roleSystem";
import { ROLE_CONFIGS } from "@/lib/roleSystem";

// Build a label map from all role configs
const ROLE_LABEL_MAP = Object.fromEntries(
  Object.values(ROLE_CONFIGS).map((c) => [c.id, c.label])
);

export default function Header() {
  const [showSettings, setShowSettings] = useState(false);
  const { userProfile, setIsOnboarded, setUserProfile, setMessages, setCurrentSessionId } = useStore();

  const role = userProfile?.aiRole ?? "friend";
  const roleConfig = getRoleConfig(role);
  const roleLabel = ROLE_LABEL_MAP[role] ?? role;

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout? This will clear your current session.")) {
      setIsOnboarded(false);
      setUserProfile(null);
      setMessages([]);
      setCurrentSessionId(null);
    }
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 px-3 sm:px-4 py-3 flex items-center justify-between shadow-sm transition-all duration-500">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Role-colored avatar circle */}
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md transition-all duration-500"
            style={{ background: `linear-gradient(135deg, ${roleConfig.theme.primaryColor}, ${roleConfig.theme.secondaryColor})` }}
          >
            <span className="text-lg sm:text-xl select-none">
              {getRoleEmoji(role)}
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
              AI Health Companion
            </h1>
            {userProfile && (
              <p className="text-xs sm:text-sm text-gray-500 truncate flex items-center gap-1.5">
                {/* Role badge */}
                <span
                  className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium transition-all duration-500"
                  style={{
                    backgroundColor: `${roleConfig.theme.primaryColor}18`,
                    color: roleConfig.theme.primaryColor,
                  }}
                >
                  {roleLabel}
                </span>
                <span>•</span>
                <span className="capitalize">{userProfile.diseaseFocus.replace("_", " ")}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </>
  );
}

// Role → emoji mapping for the header icon
function getRoleEmoji(role: string): string {
  const map: Record<string, string> = {
    mother: "💗", father: "💙", sister: "💜", brother: "💚",
    grandparent: "🌟", doctor: "🩺", therapist: "🌿", nurse: "🩹",
    coach: "🔥", mentor: "🦉", teacher: "📚", friend: "😊",
    best_friend: "⚡", girlfriend: "💖", partner: "💑",
    leader: "👑", boss: "💼", teammate: "🤝",
    spiritual_guide: "🌙", motivator: "🚀", caregiver: "🌸",
  };
  return map[role] ?? "✨";
}
