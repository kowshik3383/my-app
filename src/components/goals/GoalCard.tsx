"use client";

import { Target, Flame, Circle, CheckCircle, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import type { Goal, GoalEvaluation } from "@/types/goals";
import { useState } from "react";

interface GoalCardProps {
  goal: Goal & { evaluation?: GoalEvaluation };
  onUpdate?: (goalId: string, value: number) => void;
  onToggle?: (goalId: string) => void;
}

export default function GoalCard({ goal, onUpdate, onToggle }: GoalCardProps) {
  const [expanded, setExpanded] = useState(false);

  const progress = goal.targetValue > 0
    ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
    : 0;

  return (
    <div className="goal-card">
      <div className="goal-main">
        <div className="goal-left">
          <button onClick={() => onToggle?.(goal._id!.toString())} className="goal-toggle">
            {goal.status === "active" ? (
              <Circle size={16} strokeWidth={1.5} />
            ) : (
              <CheckCircle size={16} strokeWidth={1.5} />
            )}
          </button>
          <div className="goal-info">
            <div className="goal-title-row">
              <span className="goal-title">{goal.title}</span>
              <span className={`goal-badge ${goal.evaluation?.status || "on_track"}`}>
                {goal.evaluation?.status?.replace(/_/g, " ") || "active"}
              </span>
            </div>
            <div className="goal-progress-row">
              <div className="goal-bar-track">
                <div className="goal-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="goal-progress-text">
                {goal.currentValue}/{goal.targetValue} {goal.unit}
              </span>
              <span className="goal-percent">{progress}%</span>
            </div>
          </div>
        </div>
        <div className="goal-right">
          <div className="goal-streak">
            <Flame size={13} strokeWidth={1.5} />
            <span>{goal.streak}d</span>
          </div>
          <button className="goal-expand-btn" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronDown size={14} strokeWidth={1.5} /> : <ChevronRight size={14} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="goal-details">
          {goal.description && <p className="goal-desc">{goal.description}</p>}
          {goal.evaluation?.message && (
            <div className="goal-eval">
              <AlertCircle size={12} strokeWidth={1.5} />
              <span>{goal.evaluation.message}</span>
            </div>
          )}
          {goal.evaluation?.suggestion && (
            <div className="goal-suggestion">
              <span>Suggestion:</span> {goal.evaluation.suggestion}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .goal-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }
        .goal-card:hover {
          border-color: var(--text-tertiary);
        }
        .goal-main {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          gap: 12px;
        }
        .goal-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }
        .goal-toggle {
          flex-shrink: 0;
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
          transition: color var(--transition-fast);
        }
        .goal-toggle:hover { color: var(--text); }
        .goal-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .goal-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .goal-title {
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .goal-badge {
          font-size: 9px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 1px 6px;
          border-radius: 3px;
          flex-shrink: 0;
        }
        .goal-badge.on_track { background: var(--bg-tertiary); color: var(--text-secondary); }
        .goal-badge.needs_attention { background: var(--bg-tertiary); color: var(--text); }
        .goal-badge.off_track { background: var(--bg-tertiary); color: var(--text); }
        .goal-badge.completed { background: var(--bg-tertiary); color: var(--text); }
        .goal-progress-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .goal-bar-track {
          flex: 1;
          height: 4px;
          background: var(--bg-tertiary);
          border-radius: 2px;
          overflow: hidden;
        }
        .goal-bar-fill {
          height: 100%;
          background: var(--text);
          border-radius: 2px;
          transition: width 0.4s ease;
        }
        .goal-progress-text {
          font-size: 10px;
          color: var(--text-tertiary);
          white-space: nowrap;
        }
        .goal-percent {
          font-size: 11px;
          font-weight: 600;
          color: var(--text);
          min-width: 32px;
          text-align: right;
        }
        .goal-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .goal-streak {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          color: var(--text-tertiary);
        }
        .goal-expand-btn {
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
        }
        .goal-expand-btn:hover { color: var(--text); }
        .goal-details {
          padding: 0 16px 14px 42px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .goal-desc {
          font-size: 12px;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.5;
        }
        .goal-eval {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          font-size: 11px;
          color: var(--text-secondary);
        }
        .goal-suggestion {
          font-size: 11px;
          color: var(--text-tertiary);
          font-style: italic;
        }
        .goal-suggestion span {
          font-style: normal;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
