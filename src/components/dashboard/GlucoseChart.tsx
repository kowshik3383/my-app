"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

interface Props {
  data: { date: string; value: number }[];
}

export default function GlucoseChart({ data }: Props) {
  if (!data || data.length === 0) return null;

  return (
    <div className="chart-wrap">
      <div className="chart-header">
        <span className="chart-label">Blood Glucose</span>
        <span className="chart-unit">mg/dL</span>
      </div>
      <div className="chart-body">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <ReferenceLine y={70} stroke="var(--chart-line-secondary)" strokeDasharray="4 4" strokeWidth={1} />
            <ReferenceLine y={140} stroke="var(--chart-line-secondary)" strokeDasharray="4 4" strokeWidth={1} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              domain={["auto", "auto"]}
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
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--chart-line)"
              strokeWidth={1.5}
              dot={{ r: 3, fill: "var(--chart-line)", stroke: "none" }}
              activeDot={{ r: 4, fill: "var(--chart-line)", stroke: "var(--bg)", strokeWidth: 2 }}
            />
          </LineChart>
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
