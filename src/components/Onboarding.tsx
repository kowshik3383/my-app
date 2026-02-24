"use client";

import { useState } from "react";
import { useStore, type AIRole, type AIModulation, type Language, type DiseaseFocus } from "@/store/useStore";
import {
  Heart, Brain, Activity, Flower2, UserRound, Stethoscope, Trophy, Users,
  Smile, Zap, Briefcase, Sparkles, Moon, Globe, MessageCircle, ChevronRight, Mic2,
} from "lucide-react";
import toast from "react-hot-toast";
import VoiceSelector from "./VoiceSelector";

const roles = [
  { value: "mother",      label: "Mother",      icon: Heart,         description: "Caring and nurturing guidance" },
  { value: "father",      label: "Father",       icon: UserRound,     description: "Supportive and wise advice" },
  { value: "sister",      label: "Sister",       icon: Flower2,       description: "Understanding and empathetic" },
  { value: "brother",     label: "Brother",      icon: Users,         description: "Friendly and protective" },
  { value: "grandparent", label: "Grandparent",  icon: Heart,         description: "Wise and loving" },
  { value: "doctor",      label: "Doctor",       icon: Stethoscope,   description: "Professional healthcare guidance" },
  { value: "coach",       label: "Coach",        icon: Trophy,        description: "Motivating and energizing" },
  { value: "friend",      label: "Friend",       icon: MessageCircle, description: "Supportive companion" },
] as const;

const modulations = [
  { value: "soft_caring",         label: "Soft & Caring",       icon: Smile,    description: "Gentle and compassionate" },
  { value: "strict_motivational", label: "Strict & Motivational", icon: Zap,     description: "Direct and inspiring" },
  { value: "professional",        label: "Professional",         icon: Briefcase, description: "Clear and evidence-based" },
  { value: "energetic",           label: "Energetic",            icon: Sparkles, description: "Upbeat and enthusiastic" },
  { value: "calm",                label: "Calm",                 icon: Moon,     description: "Soothing and relaxed" },
] as const;

const languages = [
  { value: "en", label: "English",  flag: "🇬🇧" },
  { value: "hi", label: "Hindi",    flag: "🇮🇳" },
  { value: "ta", label: "Tamil",    flag: "🇮🇳" },
  { value: "te", label: "Telugu",   flag: "🇮🇳" },
  { value: "bn", label: "Bengali",  flag: "🇮🇳" },
] as const;

const diseases = [
  { value: "diabetes",      label: "Diabetes",      icon: Activity, description: "Blood sugar management" },
  { value: "heart",         label: "Heart Health",  icon: Heart,    description: "Cardiovascular wellness" },
  { value: "weight_loss",   label: "Weight Loss",   icon: Activity, description: "Healthy weight management" },
  { value: "pcos",          label: "PCOS",          icon: Flower2,  description: "Hormonal balance" },
  { value: "mental_health", label: "Mental Health", icon: Brain,    description: "Emotional well-being" },
  { value: "custom",        label: "Custom Topic",  icon: Globe,    description: "Your specific need" },
] as const;

const TOTAL_STEPS = 5;

const STEP_LABELS = [
  "Choose Role",
  "Communication",
  "Language",
  "Health Focus",
  "Select Voice",
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<AIRole | null>(null);
  const [selectedModulation, setSelectedModulation] = useState<AIModulation | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("en");
  const [selectedDisease, setSelectedDisease] = useState<DiseaseFocus | null>(null);
  const [customTopic, setCustomTopic] = useState("");
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setUserProfile, setIsOnboarded } = useStore();

  const canProceed = () => {
    switch (step) {
      case 1: return !!selectedRole;
      case 2: return !!selectedModulation;
      case 3: return true; // language always selected
      case 4: return !!selectedDisease && (selectedDisease !== "custom" || customTopic.trim().length > 0);
      case 5: return true; // voice is optional
      default: return false;
    }
  };

  const handleNext = () => { if (step < TOTAL_STEPS) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const handleSubmit = async () => {
    if (!selectedRole || !selectedModulation || !selectedDisease) {
      toast.error("Please complete all steps");
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiRole: selectedRole,
          aiModulation: selectedModulation,
          language: selectedLanguage,
          diseaseFocus: selectedDisease,
          customTopic: selectedDisease === "custom" ? customTopic : undefined,
          selectedVoiceId,
        }),
      });

      if (!response.ok) throw new Error("Failed to create profile");
      const { user } = await response.json();

      setUserProfile({
        id: user.id,
        aiRole: selectedRole,
        aiModulation: selectedModulation,
        language: selectedLanguage,
        diseaseFocus: selectedDisease,
        customTopic: selectedDisease === "custom" ? customTopic : undefined,
        selectedVoiceId: selectedVoiceId || user.selectedVoiceId,
      });

      setIsOnboarded(true);
      toast.success("Welcome! Your AI companion is ready 🎉");
    } catch (error) {
      toast.error("Failed to create profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Step progress header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 px-8 py-5">
          <div className="flex justify-between items-center mb-3">
            {STEP_LABELS.map((label, i) => (
              <div
                key={i}
                className={`flex items-center gap-1.5 text-xs font-medium transition-all ${
                  i + 1 === step ? "text-white scale-105" :
                  i + 1 < step ? "text-green-200" : "text-white/40"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  i + 1 < step ? "bg-white text-green-600 border-white" :
                  i + 1 === step ? "bg-white text-green-600 border-white" :
                  "border-white/40 text-white/40"
                }`}>
                  {i + 1 < step ? "✓" : i + 1}
                </div>
                <span className="hidden sm:block">{label}</span>
              </div>
            ))}
          </div>
          <div className="w-full h-1.5 bg-white/20 rounded-full">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* Step 1: AI Role */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Choose Your AI Companion</h2>
                <p className="text-gray-500">Select the role that resonates with you</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.value;
                  return (
                    <button key={role.value} onClick={() => setSelectedRole(role.value)}
                      className={`p-5 rounded-xl border-2 transition-all hover:shadow-md ${
                        isSelected ? "border-green-500 bg-green-50 shadow-sm" : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      <Icon className={`w-7 h-7 mx-auto mb-2.5 ${isSelected ? "text-green-600" : "text-gray-500"}`} />
                      <p className="font-semibold text-gray-900 text-sm mb-0.5">{role.label}</p>
                      <p className="text-xs text-gray-500">{role.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Modulation */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Communication Style</h2>
                <p className="text-gray-500">How should your companion speak to you?</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {modulations.map((mod) => {
                  const Icon = mod.icon;
                  const isSelected = selectedModulation === mod.value;
                  return (
                    <button key={mod.value} onClick={() => setSelectedModulation(mod.value)}
                      className={`p-5 rounded-xl border-2 transition-all hover:shadow-md text-left ${
                        isSelected ? "border-blue-500 bg-blue-50 shadow-sm" : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <Icon className={`w-7 h-7 mb-2.5 ${isSelected ? "text-blue-600" : "text-gray-500"}`} />
                      <p className="font-semibold text-gray-900 mb-0.5">{mod.label}</p>
                      <p className="text-sm text-gray-500">{mod.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Language */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Preferred Language</h2>
                <p className="text-gray-500">Your companion will speak in this language</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-2xl mx-auto">
                {languages.map((lang) => (
                  <button key={lang.value} onClick={() => setSelectedLanguage(lang.value)}
                    className={`p-5 rounded-xl border-2 transition-all hover:shadow-md ${
                      selectedLanguage === lang.value
                        ? "border-purple-500 bg-purple-50 shadow-sm"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <span className="text-4xl mb-2 block">{lang.flag}</span>
                    <p className="font-semibold text-gray-900">{lang.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Health Focus */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Health Focus Area</h2>
                <p className="text-gray-500">Your companion will remember and focus on this area</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {diseases.map((disease) => {
                  const Icon = disease.icon;
                  const isSelected = selectedDisease === disease.value;
                  return (
                    <button key={disease.value} onClick={() => setSelectedDisease(disease.value)}
                      className={`p-5 rounded-xl border-2 transition-all hover:shadow-md text-left ${
                        isSelected ? "border-green-500 bg-green-50 shadow-sm" : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      <Icon className={`w-7 h-7 mb-2.5 ${isSelected ? "text-green-600" : "text-gray-500"}`} />
                      <p className="font-semibold text-gray-900 mb-0.5">{disease.label}</p>
                      <p className="text-sm text-gray-500">{disease.description}</p>
                    </button>
                  );
                })}
              </div>
              {selectedDisease === "custom" && (
                <div className="max-w-md mx-auto">
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="e.g., Sleep disorders, Nutrition, etc."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 5: Voice Selection */}
          {step === 5 && (
            <div className="space-y-4">
              <VoiceSelector
                selectedVoiceId={selectedVoiceId}
                language={selectedLanguage}
                onSelect={setSelectedVoiceId}
                showTitle
              />
              <p className="text-center text-xs text-gray-400">
                You can change the voice anytime in Settings
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-5 border-t border-gray-100">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="px-6 py-2.5 text-gray-600 font-medium rounded-xl hover:bg-gray-100 disabled:opacity-40 transition-colors"
            >
              ← Back
            </button>

            {step < TOTAL_STEPS ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-blue-600 disabled:opacity-50 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="px-8 py-2.5 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-blue-600 disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
              >
                {isSubmitting ? "Setting up..." : "🚀 Get Started"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
