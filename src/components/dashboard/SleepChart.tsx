"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Props {
  data: { date: string; value: number }[];
}

export default function SleepChart({ data }: Props) {
  if (!data || data.length === 0) return null;

  return (
    <div className="chart-wrap">
      <div className="chart-header">
        <span className="chart-label">Sleep</span>
        <span className="chart-unit">hours</span>
      </div>
      <div className="chart-body">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 12]}
              tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--text)",
              }}
              labelStyle={{ color: "var(--text-secondary)" }}
            />
            <Bar
              dataKey="value"
              fill="var(--chart-line)"
              radius={[3, 3, 0, 0]}
              maxBarSize={24}
              opacity={0.8}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <style jsx>{`
        .chart-wrap { margin-bottom: 0; }
        .chart-header {
          display: flex;
          align-items: baseline;
          gap: 6px;
          padding: 0 0 12px;
        }
        .chart-label { font-size: 13px; font-weight: 500; color: var(--text); }
        .chart-unit { font-size: 11px; color: var(--text-tertiary); }
        .chart-body { margin: 0 -8px; }
      `}</style>
    </div>
  );
}
