"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Settings, MessageCircle, LogOut, X } from "lucide-react";
import SettingsPanel from "./SettingsPanel";

export default function Header() {
  const [showSettings, setShowSettings] = useState(false);
  const { userProfile, setIsOnboarded, setUserProfile, setMessages, setCurrentSessionId } = useStore();

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout? This will clear your current session.")) {
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

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 px-3 sm:px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">AI Health Companion</h1>
            {userProfile && (
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                {getRoleLabel(userProfile.aiRole)} • {userProfile.diseaseFocus}
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

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}
