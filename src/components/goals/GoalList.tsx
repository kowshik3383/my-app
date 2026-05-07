"use client";

import { useState, useEffect } from "react";
import GoalCard from "./GoalCard";
import GoalForm from "./GoalForm";
import { Plus, Loader2, Target } from "lucide-react";
import { useStore } from "@/store/useStore";
import type { Goal } from "@/types/goals";

export default function GoalList() {
  const { userProfile } = useStore();
  const userId = userProfile?.id;

  const [goals, setGoals] = useState<(Goal & { evaluation?: any })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>("active");

  useEffect(() => {
    if (userId) fetchGoals();
  }, [userId, filter]);

  async function fetchGoals() {
    if (!userId) return;
    try {
      setLoading(true);
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

  if (!userId) return null;

  if (loading) {
    return (
      <div className="gl-loading">
        <Loader2 size={18} strokeWidth={1.5} className="gl-spinner" />
      </div>
    );
  }

  return (
    <div className="gl-root">
      <div className="gl-toolbar">
        <div className="gl-filters">
          {["active", "completed", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`gl-filter-btn ${filter === f ? "active" : ""}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="gl-new-btn"
        >
          <Plus size={13} strokeWidth={1.5} />
          New Goal
        </button>
      </div>

      {showForm && userId && (
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
        <div className="gl-empty">
          <Target size={24} strokeWidth={1} />
          <p>No goals yet. Create your first health goal!</p>
        </div>
      ) : (
        <div className="gl-grid">
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

      <style jsx>{`
        .gl-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 0;
          color: var(--text-tertiary);
        }
        .gl-spinner { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .gl-root { }
        .gl-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .gl-filters {
          display: flex;
          gap: 4px;
          background: var(--bg-secondary);
          border-radius: 8px;
          padding: 3px;
        }
        .gl-filter-btn {
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          cursor: pointer;
          transition: all var(--transition-fast);
          font-family: var(--font-sans);
        }
        .gl-filter-btn:hover { color: var(--text-secondary); }
        .gl-filter-btn.active {
          background: var(--bg);
          color: var(--text);
          box-shadow: var(--shadow-sm);
        }
        .gl-new-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--bg);
          color: var(--text);
          cursor: pointer;
          transition: all var(--transition-fast);
          font-family: var(--font-sans);
        }
        .gl-new-btn:hover {
          border-color: var(--text);
        }
        .gl-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 48px 24px;
          color: var(--text-tertiary);
          text-align: center;
        }
        .gl-empty p {
          font-size: 13px;
          margin: 0;
        }
        .gl-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      `}</style>
    </div>
  );
}
