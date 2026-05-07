"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { MetricType } from "@/types/health";

interface MetricSummary {
  type: MetricType;
  label: string;
  unit: string;
  current: number;
  previous: number;
  trend: "up" | "down" | "stable";
  changePercent: number;
}

interface Props {
  metrics: MetricSummary[];
}

export default function HealthOverview({ metrics }: Props) {
  if (!metrics || metrics.length === 0) {
    return (
      <div className="overview-empty">
        <p>No health metrics recorded yet</p>
      </div>
    );
  }

  return (
    <div className="overview-grid">
      {metrics.map((m) => (
        <div key={m.type} className="overview-card">
          <div className="overview-label">{m.label}</div>
          <div className="overview-value-row">
            <span className="overview-value">{m.current}</span>
            <span className="overview-unit">{m.unit}</span>
            <span className={`overview-trend ${m.trend}`}>
              {m.trend === "up" && <TrendingUp size={11} strokeWidth={2} />}
              {m.trend === "down" && <TrendingDown size={11} strokeWidth={2} />}
              {m.trend === "stable" && <Minus size={11} strokeWidth={2} />}
            </span>
          </div>
        </div>
      ))}
      <style jsx>{`
        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
        }
        .overview-card {
          padding: 12px 16px;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
        }
        .overview-label {
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-tertiary);
          margin-bottom: 4px;
        }
        .overview-value-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .overview-value {
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
          letter-spacing: -0.02em;
        }
        .overview-unit {
          font-size: 10px;
          color: var(--text-tertiary);
        }
        .overview-trend {
          margin-left: auto;
          display: flex;
          align-items: center;
        }
        .overview-trend.up { color: var(--text-secondary); }
        .overview-trend.down { color: var(--text-secondary); }
        .overview-trend.stable { color: var(--text-tertiary); }
        .overview-empty {
          padding: 24px;
          text-align: center;
          color: var(--text-tertiary);
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
