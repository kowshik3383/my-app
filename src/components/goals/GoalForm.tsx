"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { GoalType, CoachingStyle } from "@/types/goals";

interface GoalFormProps {
  userId: string;
  onClose: () => void;
  onCreated: () => void;
}

const GOAL_TYPES: { value: GoalType; label: string; unit: string }[] = [
  { value: "weight_loss", label: "Weight Loss", unit: "kg" },
  { value: "hbA1c_reduction", label: "HbA1c Reduction", unit: "%" },
  { value: "sleep", label: "Sleep Goal", unit: "hours" },
  { value: "water_intake", label: "Water Intake", unit: "L" },
  { value: "walking", label: "Walking Goal", unit: "steps" },
  { value: "medication", label: "Medication Adherence", unit: "%" },
  { value: "exercise", label: "Exercise", unit: "min" },
  { value: "custom", label: "Custom Goal", unit: "" },
];

const COACHING_STYLES: { value: CoachingStyle; label: string }[] = [
  { value: "strict_coach", label: "Strict Coach" },
  { value: "supportive_mentor", label: "Supportive Mentor" },
  { value: "calm_doctor", label: "Calm Doctor" },
  { value: "accountability_partner", label: "Accountability Partner" },
];

export default function GoalForm({ userId, onClose, onCreated }: GoalFormProps) {
  const [type, setType] = useState<GoalType>("weight_loss");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [coachingStyle, setCoachingStyle] = useState<CoachingStyle>("supportive_mentor");
  const [saving, setSaving] = useState(false);

  const selectedType = GOAL_TYPES.find((t) => t.value === type);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !targetValue) return;

    setSaving(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          type,
          title,
          description,
          targetValue: Number(targetValue),
          unit: selectedType?.unit || "",
          targetDate: targetDate || undefined,
          coachingStyle,
        }),
      });

      if (res.ok) {
        onCreated();
      }
    } catch (error) {
      console.error("Failed to create goal:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Goal</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Goal Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as GoalType)}
              className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              {GOAL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Lose 5kg"
              className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this goal involve?"
              className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target ({selectedType?.unit || "units"})
              </label>
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="e.g., 75"
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                required
                step="any"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coaching Style</label>
            <select
              value={coachingStyle}
              onChange={(e) => setCoachingStyle(e.target.value as CoachingStyle)}
              className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              {COACHING_STYLES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 p-2.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {saving ? "Creating..." : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
