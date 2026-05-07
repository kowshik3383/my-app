"use client";

import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

interface WeeklyInsightsProps {
  insights: string[];
  weeklySummary: string;
}

export default function WeeklyInsights({ insights, weeklySummary }: WeeklyInsightsProps) {
  const getIcon = (index: number) => {
    const icons = [Lightbulb, TrendingUp, CheckCircle];
    const Icon = icons[index % icons.length];
    return <Icon className="w-4 h-4" />;
  };

  const getColor = (index: number) => {
    const colors = [
      "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
      "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Weekly Insights</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{weeklySummary}</p>
      {insights.length > 0 && (
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <span className={`p-1.5 rounded-full ${getColor(i)}`}>
                {getIcon(i)}
              </span>
              <p className="text-sm text-gray-700 dark:text-gray-300">{insight}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
