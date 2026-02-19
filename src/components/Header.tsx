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
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">AI Health Companion</h1>
            {userProfile && (
              <p className="text-sm text-gray-500">
                {getRoleLabel(userProfile.aiRole)} • {userProfile.diseaseFocus}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
