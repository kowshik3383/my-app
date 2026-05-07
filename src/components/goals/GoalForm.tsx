"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { GoalType, CoachingStyle } from "@/types/goals";

interface GoalFormProps {
  userId: string;
  onClose: () => void;
  onCreated: () => void;
}

const GOAL_TYPES: { value: GoalType; label: string }[] = [
  { value: "weight_loss", label: "Weight Loss" },
  { value: "hbA1c_reduction", label: "HbA1c Reduction" },
  { value: "sleep", label: "Sleep" },
  { value: "water_intake", label: "Water Intake" },
  { value: "walking", label: "Walking" },
  { value: "medication", label: "Medication" },
  { value: "exercise", label: "Exercise" },
  { value: "custom", label: "Custom" },
];

const COACHING_STYLES: { value: CoachingStyle; label: string }[] = [
  { value: "strict_coach", label: "Strict Coach" },
  { value: "supportive_mentor", label: "Supportive Mentor" },
  { value: "calm_doctor", label: "Calm Doctor" },
  { value: "accountability_partner", label: "Accountability Partner" },
];

export default function GoalForm({ userId, onClose, onCreated }: GoalFormProps) {
  const [type, setType] = useState<GoalType>("custom");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [coachingStyle, setCoachingStyle] = useState<CoachingStyle>("supportive_mentor");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !targetValue) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          type,
          title: title.trim(),
          description: description.trim() || undefined,
          targetValue: parseFloat(targetValue),
          currentValue: 0,
          unit: unit || undefined,
          targetDate: targetDate || undefined,
          coachingStyle,
        }),
      });

      if (res.ok) {
        onCreated();
      } else {
        console.error("Failed to create goal");
      }
    } catch (error) {
      console.error("Error creating goal:", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="gf-overlay" onClick={onClose}>
      <div className="gf-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gf-header">
          <h3>New Goal</h3>
          <button className="gf-close" onClick={onClose}>
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="gf-form">
          <div className="gf-field">
            <label className="gf-label">Goal Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as GoalType)}
              className="gf-input"
            >
              {GOAL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="gf-field">
            <label className="gf-label">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lose 5kg"
              className="gf-input"
              required
            />
          </div>

          <div className="gf-field">
            <label className="gf-label">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this goal mean to you?"
              className="gf-input gf-textarea"
              rows={2}
            />
          </div>

          <div className="gf-row">
            <div className="gf-field">
              <label className="gf-label">Target Value</label>
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="e.g. 75"
                className="gf-input"
                required
                step="0.1"
              />
            </div>
            <div className="gf-field">
              <label className="gf-label">Unit (optional)</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. kg"
                className="gf-input"
              />
            </div>
          </div>

          <div className="gf-field">
            <label className="gf-label">Target Date (optional)</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="gf-input"
            />
          </div>

          <div className="gf-field">
            <label className="gf-label">Coaching Style</label>
            <select
              value={coachingStyle}
              onChange={(e) => setCoachingStyle(e.target.value as CoachingStyle)}
              className="gf-input"
            >
              {COACHING_STYLES.map((cs) => (
                <option key={cs.value} value={cs.value}>{cs.label}</option>
              ))}
            </select>
          </div>

          <div className="gf-actions">
            <button type="button" className="gf-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="gf-submit"
              disabled={submitting || !title.trim() || !targetValue}
            >
              {submitting ? "Creating…" : "Create Goal"}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .gf-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }
        .gf-modal {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          width: 440px;
          max-width: 90vw;
          max-height: 85vh;
          overflow-y: auto;
        }
        .gf-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }
        .gf-header h3 {
          font-size: 15px;
          font-weight: 600;
          margin: 0;
        }
        .gf-close {
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }
        .gf-close:hover { color: var(--text); }
        .gf-form {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .gf-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .gf-label {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .gf-input {
          padding: 8px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 13px;
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-sans);
          outline: none;
          transition: border-color var(--transition-fast);
        }
        .gf-input:focus {
          border-color: var(--text);
        }
        .gf-input::placeholder {
          color: var(--text-tertiary);
        }
        .gf-input.gf-textarea {
          resize: vertical;
          min-height: 60px;
        }
        select.gf-input {
          cursor: pointer;
        }
        .gf-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .gf-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding-top: 8px;
        }
        .gf-cancel {
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--bg);
          color: var(--text-secondary);
          cursor: pointer;
          font-family: var(--font-sans);
        }
        .gf-submit {
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 8px;
          border: none;
          background: var(--text);
          color: var(--accent-text);
          cursor: pointer;
          transition: opacity var(--transition-fast);
          font-family: var(--font-sans);
        }
        .gf-submit:hover { opacity: 0.85; }
        .gf-submit:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
