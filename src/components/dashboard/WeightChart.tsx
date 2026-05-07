"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface WeightChartProps {
  data: { date: string; value: number }[];
  trend?: "up" | "down" | "stable";
  changePercent?: number;
}

export default function WeightChart({ data, trend, changePercent }: WeightChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weight Trend</h3>
        <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500">
          <p>No weight data yet. Start tracking to see trends.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weight Trend</h3>
        {trend && changePercent !== undefined && (
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
            trend === "down" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
            trend === "up" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
            "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
          }`}>
            {trend === "down" ? "↓" : trend === "up" ? "↑" : "→"} {Math.abs(changePercent).toFixed(1)}%
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
