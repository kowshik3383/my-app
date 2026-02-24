"use client";

import { useState } from "react";
import { useStore, type AIRole, type AIModulation, type Language, type DiseaseFocus } from "@/store/useStore";
import { X, Brain, Target, Mic2, CheckCircle2, Clock, Trophy } from "lucide-react";
import toast from "react-hot-toast";
import VoiceSelector from "./VoiceSelector";

interface SettingsPanelProps {
  onClose: () => void;
}

type TabId = "profile" | "voice" | "memory";

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { userProfile, setUserProfile } = useStore();

  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [aiRole, setAiRole] = useState<AIRole>(userProfile?.aiRole || "doctor");
  const [aiModulation, setAiModulation] = useState<AIModulation>(userProfile?.aiModulation || "professional");
  const [language, setLanguage] = useState<Language>(userProfile?.language || "en");
  const [diseaseFocus, setDiseaseFocus] = useState<DiseaseFocus>(userProfile?.diseaseFocus || "diabetes");
  const [customTopic, setCustomTopic] = useState(userProfile?.customTopic || "");
  const [selectedVoiceId, setSelectedVoiceId] = useState(userProfile?.selectedVoiceId || "");
  const [isSaving, setIsSaving] = useState(false);
  const [memoryData, setMemoryData] = useState<any>(null);
  const [loadingMemory, setLoadingMemory] = useState(false);

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
          selectedVoiceId: selectedVoiceId || undefined,
        }),
      });
      if (!response.ok) throw new Error("Failed");

      setUserProfile({
        id: userProfile.id,
        aiRole,
        aiModulation,
        language,
        diseaseFocus,
        customTopic: diseaseFocus === "custom" ? customTopic : undefined,
        selectedVoiceId: selectedVoiceId || userProfile.selectedVoiceId,
        userName: userProfile.userName,
      });

      toast.success("Settings saved!");
      onClose();
    } catch {
      toast.error("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  const loadMemory = async () => {
    if (!userProfile?.id) return;
    setLoadingMemory(true);
    try {
      const res = await fetch(`/api/memory?userId=${userProfile.id}`);
      const data = await res.json();
      setMemoryData(data.memory);
    } catch {
      toast.error("Failed to load memory");
    } finally {
      setLoadingMemory(false);
    }
  };

  const handleSummarizeSession = async () => {
    if (!userProfile?.id) return;
    const storedState = localStorage.getItem("health-companion-storage");
    const sessionId = storedState ? JSON.parse(storedState).state.currentSessionId : null;
    if (!sessionId) { toast.error("No active session"); return; }
    try {
      const res = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userProfile.id, sessionId }),
      });
      if (res.ok) {
        toast.success("Session saved to memory!");
        loadMemory();
      }
    } catch {
      toast.error("Failed to summarize session");
    }
  };

  const TABS: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
    { id: "profile", label: "Profile",  icon: <Target className="w-4 h-4" /> },
    { id: "voice",   label: "Voice",    icon: <Mic2 className="w-4 h-4" /> },
    { id: "memory",  label: "Memory",   icon: <Brain className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 flex-shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "memory" && !memoryData) loadMemory();
              }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Profile Tab ──────────────────────────────────────────────────── */}
          {activeTab === "profile" && (
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">AI Role</label>
                <select value={aiRole} onChange={(e) => setAiRole(e.target.value as AIRole)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 text-sm bg-white">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Communication Style</label>
                <select value={aiModulation} onChange={(e) => setAiModulation(e.target.value as AIModulation)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 text-sm bg-white">
                  <option value="soft_caring">Soft &amp; Caring</option>
                  <option value="strict_motivational">Strict &amp; Motivational</option>
                  <option value="professional">Professional</option>
                  <option value="energetic">Energetic</option>
                  <option value="calm">Calm</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 text-sm bg-white">
                  <option value="en">🇬🇧 English</option>
                  <option value="hi">🇮🇳 Hindi</option>
                  <option value="ta">🇮🇳 Tamil</option>
                  <option value="te">🇮🇳 Telugu</option>
                  <option value="bn">🇮🇳 Bengali</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Health Focus</label>
                <select value={diseaseFocus} onChange={(e) => setDiseaseFocus(e.target.value as DiseaseFocus)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 text-sm bg-white">
                  <option value="diabetes">Diabetes</option>
                  <option value="heart">Heart Health</option>
                  <option value="weight_loss">Weight Loss</option>
                  <option value="pcos">PCOS</option>
                  <option value="mental_health">Mental Health</option>
                  <option value="custom">Custom Topic</option>
                </select>
              </div>

              {diseaseFocus === "custom" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Custom Topic</label>
                  <input type="text" value={customTopic} onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="e.g., Sleep disorders, Nutrition..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 text-sm" />
                </div>
              )}
            </div>
          )}

          {/* ── Voice Tab ─────────────────────────────────────────────────────── */}
          {activeTab === "voice" && (
            <div className="p-6">
              <VoiceSelector
                selectedVoiceId={selectedVoiceId || userProfile?.selectedVoiceId}
                language={language}
                onSelect={(id) => setSelectedVoiceId(id)}
                showTitle={false}
              />
            </div>
          )}

          {/* ── Memory Tab ────────────────────────────────────────────────────── */}
          {activeTab === "memory" && (
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-500" />
                  Avatar Memory
                </h3>
                <button
                  onClick={handleSummarizeSession}
                  className="text-xs px-3 py-1.5 bg-purple-50 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors font-medium"
                >
                  Save Current Session
                </button>
              </div>

              {loadingMemory && (
                <div className="text-center py-8 text-sm text-gray-400">Loading memory...</div>
              )}

              {!loadingMemory && !memoryData && (
                <div className="text-center py-8">
                  <Brain className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No memory data yet. Start chatting to build memory.</p>
                </div>
              )}

              {!loadingMemory && memoryData && (
                <div className="space-y-4">
                  {/* User name */}
                  {(memoryData.userName || memoryData.longTerm?.userName) && (
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                      <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Known As</p>
                      <p className="text-sm font-medium text-gray-800">
                        {memoryData.userName || memoryData.longTerm?.userName}
                      </p>
                    </div>
                  )}

                  {/* Active Goals */}
                  {memoryData.longTerm?.goals?.length > 0 && (
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Active Goals</p>
                      <ul className="space-y-1.5">
                        {memoryData.longTerm.goals
                          .filter((g: any) => g.status === "active")
                          .slice(0, 5)
                          .map((goal: any, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <Trophy className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                              {goal.goal}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {/* Emotional pattern */}
                  {memoryData.emotionalPattern && (
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Emotional Pattern</p>
                      <p className="text-sm text-gray-700 capitalize">
                        Dominant mood: <strong>{memoryData.emotionalPattern.dominantPattern}</strong>
                      </p>
                    </div>
                  )}

                  {/* Recent Episodes */}
                  {memoryData.recentEpisodes?.length > 0 && (
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                      <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">Remembered Events</p>
                      <ul className="space-y-1.5">
                        {memoryData.recentEpisodes.slice(0, 3).map((ep: any, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <Clock className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                            {ep.event}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recurring topics */}
                  {memoryData.longTerm?.recurringTopics?.length > 0 && (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Common Topics</p>
                      <div className="flex flex-wrap gap-1.5">
                        {memoryData.longTerm.recurringTopics.slice(0, 8).map((t: string, i: number) => (
                          <span key={i} className="text-xs px-2.5 py-1 bg-white border border-gray-200 rounded-full text-gray-600">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer (only for profile + voice tabs) */}
        {(activeTab === "profile" || activeTab === "voice") && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
            <button onClick={onClose}
              className="px-5 py-2.5 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-colors text-sm">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || (diseaseFocus === "custom" && !customTopic.trim())}
              className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-blue-600 disabled:opacity-50 transition-all shadow-md text-sm flex items-center gap-2"
            >
              {isSaving ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
