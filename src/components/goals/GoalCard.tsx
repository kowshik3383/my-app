"use client";

import { Target, Flame, CheckCircle, Circle, AlertTriangle } from "lucide-react";
import type { Goal, GoalEvaluation } from "@/types/goals";

interface GoalCardProps {
  goal: Goal & { evaluation?: GoalEvaluation };
  onUpdate?: (goalId: string, value: number) => void;
  onToggle?: (goalId: string) => void;
}

export default function GoalCard({ goal, onUpdate, onToggle }: GoalCardProps) {
  const progress = goal.targetValue > 0
    ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
    : 0;

  const statusColor = {
    on_track: "bg-green-500",
    needs_attention: "bg-yellow-500",
    off_track: "bg-red-500",
    completed: "bg-blue-500",
  }[goal.evaluation?.status || "on_track"];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">{goal.title}</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor} text-white`}>
              {goal.evaluation?.status?.replace(/_/g, " ") || "active"}
            </span>
          </div>
          {goal.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{goal.description}</p>
          )}
        </div>
        <button
          onClick={() => onToggle?.(goal._id!.toString())}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {goal.status === "active" ? (
            <Circle className="w-5 h-5 text-gray-400" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
        </button>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">
            {goal.currentValue} / {goal.targetValue} {goal.unit}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              progress >= 80 ? "bg-green-500" :
              progress >= 50 ? "bg-yellow-500" :
              "bg-blue-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-orange-500">
          <Flame className="w-4 h-4" />
          <span>{goal.streak} day streak</span>
        </div>

        {goal.evaluation && (
          <div className="flex items-center gap-1">
            {goal.evaluation.status === "off_track" ? (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            ) : (
              <Target className="w-4 h-4 text-blue-500" />
            )}
            <span className="text-gray-500 dark:text-gray-400 text-xs">
              {goal.evaluation.message}
            </span>
          </div>
        )}
      </div>

      {goal.evaluation?.suggestion && (
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 italic">
          💡 {goal.evaluation.suggestion}
        </p>
      )}
    </div>
  );
}
