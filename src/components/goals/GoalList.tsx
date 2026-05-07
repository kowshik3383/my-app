"use client";

import { useState, useEffect } from "react";
import GoalCard from "./GoalCard";
import GoalForm from "./GoalForm";
import { Plus, Loader2, Target } from "lucide-react";
import type { Goal } from "@/types/goals";

interface GoalListProps {
  userId: string;
}

export default function GoalList({ userId }: GoalListProps) {
  const [goals, setGoals] = useState<(Goal & { evaluation?: any })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>("active");

  useEffect(() => {
    fetchGoals();
  }, [userId, filter]);

  async function fetchGoals() {
    try {
      const res = await fetch(`/api/goals?userId=${userId}&status=${filter}`);
      const data = await res.json();
      setGoals(data.goals || []);
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(goalId: string, value: number) {
    try {
      await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId, currentValue: value }),
      });
      fetchGoals();
    } catch (error) {
      console.error("Failed to update goal:", error);
    }
  }

  async function handleToggle(goalId: string) {
    try {
      const goal = goals.find((g) => g._id?.toString() === goalId);
      const newStatus = goal?.status === "active" ? "paused" : "active";
      await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId, status: newStatus }),
      });
      fetchGoals();
    } catch (error) {
      console.error("Failed to toggle goal:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {["active", "completed", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === f
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          New Goal
        </button>
      </div>

      {showForm && (
        <GoalForm
          userId={userId}
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            fetchGoals();
          }}
        />
      )}

      {goals.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No goals yet. Create your first health goal!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard
              key={goal._id?.toString()}
              goal={goal}
              onUpdate={handleUpdate}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
