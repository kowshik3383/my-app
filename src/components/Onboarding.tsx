"use client";

import { useState } from "react";
import { useStore, type AIRole, type AIModulation, type Language, type DiseaseFocus } from "@/store/useStore";
import {
  Heart, Brain, Activity, Flower2, UserRound, Stethoscope, Trophy, Users,
  Smile, Zap, Briefcase, Sparkles, Moon,
  Globe, MessageCircle, ArrowRight, ArrowLeft, Check
} from "lucide-react";
import toast from "react-hot-toast";

const roles = [
  { value: "mother", label: "Mother", icon: Heart, description: "Caring & nurturing" },
  { value: "father", label: "Father", icon: UserRound, description: "Supportive & wise" },
  { value: "sister", label: "Sister", icon: Flower2, description: "Empathetic" },
  { value: "brother", label: "Brother", icon: Users, description: "Protective" },
  { value: "grandparent", label: "Grandparent", icon: Heart, description: "Loving & wise" },
  { value: "doctor", label: "Doctor", icon: Stethoscope, description: "Professional" },
  { value: "coach", label: "Coach", icon: Trophy, description: "Motivating" },
  { value: "friend", label: "Friend", icon: MessageCircle, description: "Companion" },
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
  { value: "weight_loss", label: "Weight Loss", icon: Activity, description: "Healthy weight" },
  { value: "pcos", label: "PCOS", icon: Flower2, description: "Hormonal balance" },
  { value: "mental_health", label: "Mental Health", icon: Brain, description: "Emotional well-being" },
  { value: "custom", label: "Custom Topic", icon: Globe, description: "Your specific need" },
] as const;

const steps = [
  { number: 1, label: "Companion" },
  { number: 2, label: "Style" },
  { number: 3, label: "Language" },
  { number: 4, label: "Focus" },
];

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

  const handleNext = () => { if (step < totalSteps) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };

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

  const canProceed =
    (step === 1 && !!selectedRole) ||
    (step === 2 && !!selectedModulation) ||
    step === 3 ||
    (step === 4 && !!selectedDisease && !(selectedDisease === "custom" && !customTopic.trim()));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .ob-root {
          min-height: 100vh;
          background: #f9f7f4;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          font-family: 'DM Sans', sans-serif;
        }

        .ob-card {
          width: 100%;
          max-width: 740px;
          background: #ffffff;
          border-radius: 24px;
          padding: 56px 48px 40px;
          box-shadow: 0 2px 40px rgba(0,0,0,0.06);
        }

        /* Step indicators */
        .ob-steps {
          display: flex;
          align-items: center;
          gap: 0;
          margin-bottom: 52px;
        }
        .ob-step-item {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }
        .ob-step-item:last-child { flex: none; }
        .ob-step-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.01em;
          flex-shrink: 0;
          transition: all 0.3s ease;
          border: 1.5px solid #e0ddd9;
          background: #fff;
          color: #b0aca6;
        }
        .ob-step-dot.active {
          background: #1a1a1a;
          border-color: #1a1a1a;
          color: #fff;
        }
        .ob-step-dot.done {
          background: #1a1a1a;
          border-color: #1a1a1a;
          color: #fff;
        }
        .ob-step-label {
          font-size: 12px;
          color: #b0aca6;
          font-weight: 400;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          transition: color 0.3s;
        }
        .ob-step-label.active { color: #1a1a1a; font-weight: 500; }
        .ob-step-line {
          flex: 1;
          height: 1px;
          background: #e0ddd9;
          margin: 0 10px;
        }
        .ob-step-line.done { background: #1a1a1a; }

        /* Heading */
        .ob-heading {
          margin-bottom: 36px;
        }
        .ob-step-tag {
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #b0aca6;
          font-weight: 500;
          margin-bottom: 10px;
        }
        .ob-title {
          font-family: 'DM Serif Display', serif;
          font-size: 32px;
          color: #1a1a1a;
          line-height: 1.2;
          font-weight: 400;
        }
        .ob-subtitle {
          font-size: 15px;
          color: #888480;
          margin-top: 8px;
          font-weight: 300;
        }

        /* Grids */
        .ob-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .ob-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .ob-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }

        @media (max-width: 600px) {
          .ob-card { padding: 32px 20px 28px; }
          .ob-grid-4 { grid-template-columns: repeat(2, 1fr); }
          .ob-grid-3 { grid-template-columns: repeat(2, 1fr); }
          .ob-title { font-size: 26px; }
        }

        /* Option cards */
        .ob-option {
          border: 1.5px solid #eeebe7;
          border-radius: 14px;
          padding: 18px 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #fff;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: relative;
          outline: none;
        }
        .ob-option:hover {
          border-color: #c8c4be;
          background: #faf9f7;
          transform: translateY(-1px);
        }
        .ob-option.selected {
          border-color: #1a1a1a;
          background: #1a1a1a;
        }
        .ob-option.selected .ob-option-icon { color: rgba(255,255,255,0.9); }
        .ob-option.selected .ob-option-name { color: #fff; }
        .ob-option.selected .ob-option-desc { color: rgba(255,255,255,0.55); }

        .ob-option-icon {
          color: #a09c96;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          transition: color 0.2s;
        }
        .ob-option-name {
          font-size: 14px;
          font-weight: 500;
          color: #1a1a1a;
          transition: color 0.2s;
          line-height: 1.2;
        }
        .ob-option-desc {
          font-size: 12px;
          color: #a09c96;
          font-weight: 300;
          transition: color 0.2s;
          line-height: 1.4;
        }

        /* Language specific */
        .ob-lang-flag { font-size: 26px; margin-bottom: 4px; display: block; }
        .ob-lang-name { font-size: 14px; font-weight: 500; color: #1a1a1a; }
        .ob-option.selected .ob-lang-name { color: #fff; }

        /* Custom input */
        .ob-input-wrap { margin-top: 20px; }
        .ob-input-label {
          display: block;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #a09c96;
          font-weight: 500;
          margin-bottom: 8px;
        }
        .ob-input {
          width: 100%;
          padding: 12px 16px;
          border: 1.5px solid #eeebe7;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #1a1a1a;
          background: #fff;
          outline: none;
          transition: border-color 0.2s;
        }
        .ob-input:focus { border-color: #1a1a1a; }
        .ob-input::placeholder { color: #c8c4be; }

        /* Footer */
        .ob-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 44px;
          padding-top: 28px;
          border-top: 1px solid #eeebe7;
        }

        .ob-btn-back {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 0;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #b0aca6;
          font-weight: 400;
          transition: color 0.2s;
        }
        .ob-btn-back:hover:not(:disabled) { color: #1a1a1a; }
        .ob-btn-back:disabled { opacity: 0.3; cursor: not-allowed; }

        .ob-btn-next {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          background: #1a1a1a;
          border: none;
          border-radius: 100px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #fff;
          font-weight: 500;
          transition: all 0.2s ease;
          letter-spacing: 0.01em;
        }
        .ob-btn-next:hover:not(:disabled) {
          background: #333;
          transform: translateX(2px);
        }
        .ob-btn-next:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          transform: none;
        }

        /* Fade animation */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ob-step-content { animation: fadeUp 0.35s ease both; }
      `}</style>

      <div className="ob-root">
        <div className="ob-card">

          {/* Step indicators */}
          <div className="ob-steps">
            {steps.map((s, i) => (
              <>
                <div className="ob-step-item" key={s.number}>
                  <div className={`ob-step-dot ${step === s.number ? "active" : step > s.number ? "done" : ""}`}>
                    {step > s.number ? <Check size={12} strokeWidth={2.5} /> : s.number}
                  </div>
                  <span className={`ob-step-label ${step === s.number ? "active" : ""}`}>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`ob-step-line ${step > s.number ? "done" : ""}`} key={`line-${i}`} />
                )}
              </>
            ))}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div className="ob-step-content">
              <div className="ob-heading">
                <p className="ob-step-tag">Step 1 of 4</p>
                <h2 className="ob-title">Who guides you?</h2>
                <p className="ob-subtitle">Choose the companion persona for your AI</p>
              </div>
              <div className="ob-grid-4">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.value}
                      onClick={() => setSelectedRole(role.value)}
                      className={`ob-option ${selectedRole === role.value ? "selected" : ""}`}
                    >
                      <Icon className="ob-option-icon" size={20} />
                      <span className="ob-option-name">{role.label}</span>
                      <span className="ob-option-desc">{role.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="ob-step-content">
              <div className="ob-heading">
                <p className="ob-step-tag">Step 2 of 4</p>
                <h2 className="ob-title">How should it speak?</h2>
                <p className="ob-subtitle">Pick a communication style that suits you</p>
              </div>
              <div className="ob-grid-2">
                {modulations.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <button
                      key={mod.value}
                      onClick={() => setSelectedModulation(mod.value)}
                      className={`ob-option ${selectedModulation === mod.value ? "selected" : ""}`}
                    >
                      <Icon className="ob-option-icon" size={20} />
                      <span className="ob-option-name">{mod.label}</span>
                      <span className="ob-option-desc">{mod.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="ob-step-content">
              <div className="ob-heading">
                <p className="ob-step-tag">Step 3 of 4</p>
                <h2 className="ob-title">Your language</h2>
                <p className="ob-subtitle">We'll respond in your preferred tongue</p>
              </div>
              <div className="ob-grid-3" style={{ maxWidth: 480 }}>
                {languages.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => setSelectedLanguage(lang.value)}
                    className={`ob-option ${selectedLanguage === lang.value ? "selected" : ""}`}
                    style={{ alignItems: "flex-start" }}
                  >
                    <span className="ob-lang-flag">{lang.flag}</span>
                    <span className="ob-lang-name">{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="ob-step-content">
              <div className="ob-heading">
                <p className="ob-step-tag">Step 4 of 4</p>
                <h2 className="ob-title">What's your focus?</h2>
                <p className="ob-subtitle">Select a health area to personalise your experience</p>
              </div>
              <div className="ob-grid-3">
                {diseases.map((disease) => {
                  const Icon = disease.icon;
                  return (
                    <button
                      key={disease.value}
                      onClick={() => setSelectedDisease(disease.value)}
                      className={`ob-option ${selectedDisease === disease.value ? "selected" : ""}`}
                    >
                      <Icon className="ob-option-icon" size={20} />
                      <span className="ob-option-name">{disease.label}</span>
                      <span className="ob-option-desc">{disease.description}</span>
                    </button>
                  );
                })}
              </div>
              {selectedDisease === "custom" && (
                <div className="ob-input-wrap">
                  <label className="ob-input-label" htmlFor="customTopic">Your topic</label>
                  <input
                    type="text"
                    id="customTopic"
                    className="ob-input"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="e.g. Sleep disorders, Nutrition…"
                    autoFocus
                  />
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="ob-footer">
            <button onClick={handleBack} disabled={step === 1} className="ob-btn-back">
              <ArrowLeft size={15} />
              Back
            </button>
            {step < totalSteps ? (
              <button onClick={handleNext} disabled={!canProceed} className="ob-btn-next">
                Continue
                <ArrowRight size={15} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed || isSubmitting}
                className="ob-btn-next"
              >
                {isSubmitting ? "Creating…" : "Get started"}
                {!isSubmitting && <ArrowRight size={15} />}
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
}