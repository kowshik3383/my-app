"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  unit: string;
  trend?: "up" | "down" | "stable";
  changePercent?: number;
  subtitle?: string;
}

export default function StatCard({ label, value, unit, trend, changePercent, subtitle }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value-row">
        <span className="stat-value">
          {value}
          <span className="stat-unit">{unit}</span>
        </span>
        {trend && (
          <span className={`stat-trend ${trend}`}>
            {trend === "up" && <TrendingUp size={12} strokeWidth={2} />}
            {trend === "down" && <TrendingDown size={12} strokeWidth={2} />}
            {trend === "stable" && <Minus size={12} strokeWidth={2} />}
            {changePercent != null && (
              <span className="stat-change">{Math.abs(changePercent)}%</span>
            )}
          </span>
        )}
      </div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      <style jsx>{`
        .stat-card {
          padding: 16px 20px;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-md);
          min-width: 0;
        }
        .stat-label {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-tertiary);
          margin-bottom: 6px;
        }
        .stat-value-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }
        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: var(--text);
          letter-spacing: -0.02em;
        }
        .stat-unit {
          font-size: 12px;
          font-weight: 400;
          color: var(--text-tertiary);
          margin-left: 2px;
        }
        .stat-trend {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          font-weight: 500;
        }
        .stat-trend.up { color: var(--text-secondary); }
        .stat-trend.down { color: var(--text-secondary); }
        .stat-trend.stable { color: var(--text-tertiary); }
        .stat-change {
          font-size: 11px;
        }
        .stat-subtitle {
          font-size: 11px;
          color: var(--text-tertiary);
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}
