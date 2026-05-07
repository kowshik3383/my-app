"use client";

import { useStore } from "@/store/useStore";
import GoalList from "@/components/goals/GoalList";
import { Target } from "lucide-react";

export default function GoalsPage() {
  const { isDarkMode } = useStore();
  const dark = isDarkMode;

  return (
    <div className="goals-page">
      <div className="goals-header">
        <div className="goals-title-row">
          <Target size={18} strokeWidth={1.5} />
          <h1>Goals</h1>
        </div>
        <p className="goals-subtitle">
          Track and manage your health objectives
        </p>
      </div>
      <div className="goals-content scrollbar-thin">
        <GoalList />
      </div>

      <style jsx>{`
        .goals-page {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: var(--bg);
        }
        .goals-header {
          padding: 32px 32px 24px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .goals-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }
        .goals-title-row h1 {
          font-size: 20px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--text);
          margin: 0;
        }
        .goals-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0 0 0 28px;
        }
        .goals-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px 32px;
        }
      `}</style>
    </div>
  );
}
