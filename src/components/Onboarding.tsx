"use client";

import { useState } from "react";
import { useStore, type AIRole, type AIModulation, type Language, type DiseaseFocus } from "@/store/useStore";
import { 
  Heart, Brain, Activity, Flower2, UserRound, Stethoscope, Trophy, Users,
  Smile, Zap, Briefcase, Sparkles, Moon,
  Globe, MessageCircle
} from "lucide-react";
import toast from "react-hot-toast";

const roles = [
  { value: "mother", label: "Mother", icon: Heart, description: "Caring and nurturing guidance" },
  { value: "father", label: "Father", icon: UserRound, description: "Supportive and wise advice" },
  { value: "sister", label: "Sister", icon: Flower2, description: "Understanding and empathetic" },
  { value: "brother", label: "Brother", icon: Users, description: "Friendly and protective" },
  { value: "grandparent", label: "Grandparent", icon: Heart, description: "Wise and loving" },
  { value: "doctor", label: "Doctor", icon: Stethoscope, description: "Professional healthcare guidance" },
  { value: "coach", label: "Coach", icon: Trophy, description: "Motivating and energizing" },
  { value: "friend", label: "Friend", icon: MessageCircle, description: "Supportive companion" },
] as const;

const modulations = [
  { value: "soft_caring", label: "Soft & Caring", icon: Smile, description: "Gentle and compassionate" },
  { value: "strict_motivational", label: "Strict & Motivational", icon: Zap, description: "Direct and inspiring" },
  { value: "professional", label: "Professional", icon: Briefcase, description: "Clear and evidence-based" },
  { value: "energetic", label: "Energetic", icon: Sparkles, description: "Upbeat and enthusiastic" },
  { value: "calm", label: "Calm", icon: Moon, description: "Soothing and relaxed" },
] as const;

const languages = [
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "hi", label: "Hindi", flag: "🇮🇳" },
  { value: "ta", label: "Tamil", flag: "🇮🇳" },
  { value: "te", label: "Telugu", flag: "🇮🇳" },
  { value: "bn", label: "Bengali", flag: "🇮🇳" },
] as const;

const diseases = [
  { value: "diabetes", label: "Diabetes", icon: Activity, description: "Blood sugar management" },
  { value: "heart", label: "Heart Health", icon: Heart, description: "Cardiovascular wellness" },
  { value: "weight_loss", label: "Weight Loss", icon: Activity, description: "Healthy weight management" },
  { value: "pcos", label: "PCOS", icon: Flower2, description: "Hormonal balance" },
  { value: "mental_health", label: "Mental Health", icon: Brain, description: "Emotional well-being" },
  { value: "custom", label: "Custom Topic", icon: Globe, description: "Your specific need" },
] as const;

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<AIRole | null>(null);
  const [selectedModulation, setSelectedModulation] = useState<AIModulation | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("en");
  const [selectedDisease, setSelectedDisease] = useState<DiseaseFocus | null>(null);
  const [customTopic, setCustomTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setUserProfile, setIsOnboarded } = useStore();

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedRole || !selectedModulation || !selectedDisease) {
      toast.error("Please complete all steps");
      return;
    }

    if (selectedDisease === "custom" && !customTopic.trim()) {
      toast.error("Please enter your custom topic");
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
      });

      setIsOnboarded(true);
      toast.success("Profile created successfully!");
    } catch (error) {
      console.error("Error creating profile:", error);
      toast.error("Failed to create profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 animate-fade-in">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {step} of {totalSteps}</span>
            <span className="text-sm text-gray-500">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Select AI Role */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your AI Companion</h2>
              <p className="text-gray-600">Select the role that resonates with you</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.value}
                    onClick={() => setSelectedRole(role.value)}
                    className={`p-6 rounded-xl border-2 transition-all hover:shadow-md ${
                      selectedRole === role.value
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-3 ${
                      selectedRole === role.value ? "text-green-600" : "text-gray-600"
                    }`} />
                    <p className="font-semibold text-gray-900 mb-1">{role.label}</p>
                    <p className="text-xs text-gray-500">{role.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Select Modulation */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Communication Style</h2>
              <p className="text-gray-600">How would you like your AI companion to interact?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modulations.map((mod) => {
                const Icon = mod.icon;
                return (
                  <button
                    key={mod.value}
                    onClick={() => setSelectedModulation(mod.value)}
                    className={`p-6 rounded-xl border-2 transition-all hover:shadow-md text-left ${
                      selectedModulation === mod.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Icon className={`w-8 h-8 mb-3 ${
                      selectedModulation === mod.value ? "text-blue-600" : "text-gray-600"
                    }`} />
                    <p className="font-semibold text-gray-900 mb-1">{mod.label}</p>
                    <p className="text-sm text-gray-500">{mod.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Select Language */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Preferred Language</h2>
              <p className="text-gray-600">Choose the language for communication</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setSelectedLanguage(lang.value)}
                  className={`p-6 rounded-xl border-2 transition-all hover:shadow-md ${
                    selectedLanguage === lang.value
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-4xl mb-2 block">{lang.flag}</span>
                  <p className="font-semibold text-gray-900">{lang.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Select Disease Focus */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Health Focus Area</h2>
              <p className="text-gray-600">What area of health do you want to focus on?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {diseases.map((disease) => {
                const Icon = disease.icon;
                return (
                  <button
                    key={disease.value}
                    onClick={() => setSelectedDisease(disease.value)}
                    className={`p-6 rounded-xl border-2 transition-all hover:shadow-md text-left ${
                      selectedDisease === disease.value
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Icon className={`w-8 h-8 mb-3 ${
                      selectedDisease === disease.value ? "text-green-600" : "text-gray-600"
                    }`} />
                    <p className="font-semibold text-gray-900 mb-1">{disease.label}</p>
                    <p className="text-sm text-gray-500">{disease.description}</p>
                  </button>
                );
              })}
            </div>
            {selectedDisease === "custom" && (
              <div className="mt-6 max-w-md mx-auto">
                <label htmlFor="customTopic" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your custom health topic
                </label>
                <input
                  type="text"
                  id="customTopic"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g., Sleep disorders, Nutrition, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="px-6 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Back
          </button>
          {step < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={
                (step === 1 && !selectedRole) ||
                (step === 2 && !selectedModulation) ||
                (step === 4 && !selectedDisease)
              }
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={
                !selectedRole ||
                !selectedModulation ||
                !selectedDisease ||
                (selectedDisease === "custom" && !customTopic.trim()) ||
                isSubmitting
              }
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {isSubmitting ? "Creating Profile..." : "Get Started"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
