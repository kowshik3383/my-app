"use client";

import { Lightbulb, TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import type { AIInsight } from "@/types/health";

interface Props {
  insights: AIInsight[];
  weeklySummary: string;
}

const iconMap = {
  trend: TrendingUp,
  anomaly: AlertCircle,
  observation: Lightbulb,
  motivation: Sparkles,
};

export default function WeeklyInsights({ insights, weeklySummary }: Props) {
  return (
    <div className="insights-root">
      {weeklySummary && (
        <div className="insights-summary">
          <p>{weeklySummary}</p>
        </div>
      )}
      {insights && insights.length > 0 && (
        <div className="insights-list">
          {insights.filter(i => !i.dismissed).map((insight, idx) => {
            const Icon = iconMap[insight.type] || Lightbulb;
            return (
              <div key={idx} className="insight-item">
                <Icon size={14} strokeWidth={1.5} />
                <span>{insight.content}</span>
              </div>
            );
          })}
        </div>
      )}
      {(!insights || insights.length === 0) && !weeklySummary && (
        <div className="insights-empty">
          <Lightbulb size={20} strokeWidth={1} />
          <p>No insights yet. Keep tracking to receive AI-powered observations.</p>
        </div>
      )}
      <style jsx>{`
        .insights-root { }
        .insights-summary {
          font-size: 13px;
          line-height: 1.6;
          color: var(--text);
          padding: 12px 16px;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          margin-bottom: 12px;
          border-left: 2px solid var(--text);
        }
        .insights-summary p { margin: 0; }
        .insights-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .insight-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.5;
          padding: 6px 0;
        }
        .insight-item span { flex: 1; }
        .insights-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 24px;
          color: var(--text-tertiary);
          font-size: 12px;
          text-align: center;
        }
        .insights-empty p { margin: 0; }
      `}</style>
    </div>
  );
}
