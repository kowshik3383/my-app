"use client";

import { useState, useEffect } from "react";
import { useStore, type AIRole, type AIModulation, type Language, type DiseaseFocus } from "@/store/useStore";
import { X, Save } from "lucide-react";
import toast from "react-hot-toast";

interface SettingsPanelProps {
  onClose: () => void;
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { userProfile, setUserProfile } = useStore();
  
  const [aiRole, setAiRole] = useState<AIRole>(userProfile?.aiRole || "doctor");
  const [aiModulation, setAiModulation] = useState<AIModulation>(userProfile?.aiModulation || "professional");
  const [language, setLanguage] = useState<Language>(userProfile?.language || "en");
  const [diseaseFocus, setDiseaseFocus] = useState<DiseaseFocus>(userProfile?.diseaseFocus || "diabetes");
  const [customTopic, setCustomTopic] = useState(userProfile?.customTopic || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!userProfile?.id) return;

    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userProfile.id,
          aiRole,
          aiModulation,
          language,
          diseaseFocus,
          customTopic: diseaseFocus === "custom" ? customTopic : undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const { user } = await response.json();

      setUserProfile({
        id: user.id,
        aiRole,
        aiModulation,
        language,
        diseaseFocus,
        customTopic: diseaseFocus === "custom" ? customTopic : undefined,
      });

      toast.success("Settings updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* AI Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Role
            </label>
            <select
              value={aiRole}
              onChange={(e) => setAiRole(e.target.value as AIRole)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="mother">Mother</option>
              <option value="father">Father</option>
              <option value="sister">Sister</option>
              <option value="brother">Brother</option>
              <option value="grandparent">Grandparent</option>
              <option value="doctor">Doctor</option>
              <option value="coach">Coach</option>
              <option value="friend">Friend</option>
            </select>
          </div>

          {/* AI Modulation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Communication Style
            </label>
            <select
              value={aiModulation}
              onChange={(e) => setAiModulation(e.target.value as AIModulation)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="soft_caring">Soft & Caring</option>
              <option value="strict_motivational">Strict & Motivational</option>
              <option value="professional">Professional</option>
              <option value="energetic">Energetic</option>
              <option value="calm">Calm</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="en">🇬🇧 English</option>
              <option value="hi">🇮🇳 Hindi</option>
              <option value="ta">🇮🇳 Tamil</option>
              <option value="te">🇮🇳 Telugu</option>
              <option value="bn">🇮🇳 Bengali</option>
            </select>
          </div>

          {/* Disease Focus */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Health Focus Area
            </label>
            <select
              value={diseaseFocus}
              onChange={(e) => setDiseaseFocus(e.target.value as DiseaseFocus)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="diabetes">Diabetes</option>
              <option value="heart">Heart Health</option>
              <option value="weight_loss">Weight Loss</option>
              <option value="pcos">PCOS</option>
              <option value="mental_health">Mental Health</option>
              <option value="custom">Custom Topic</option>
            </select>
          </div>

          {/* Custom Topic (conditional) */}
          {diseaseFocus === "custom" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Health Topic
              </label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g., Sleep disorders, Nutrition, etc."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || (diseaseFocus === "custom" && !customTopic.trim())}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
