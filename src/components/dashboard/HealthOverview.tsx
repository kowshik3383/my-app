"use client";

import { Scale, Droplet, Moon, Smile, Footprints, Activity } from "lucide-react";
import type { DashboardData } from "@/types/health";

interface HealthOverviewProps {
  data: DashboardData;
}

const iconMap: Record<string, React.ElementType> = {
  Scale,
  Droplet,
  Moon,
  Smile,
  Footprints,
  Activity,
};

export default function HealthOverview({ data }: HealthOverviewProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Health Overview</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.metrics.filter((m) => m.current > 0).slice(0, 8).map((metric) => {
          const TrendIcon = metric.trend === "up"
            ? (metric.type === "weight" || metric.type === "glucose" ? "↓" : "↑")
            : metric.trend === "down"
            ? (metric.type === "weight" || metric.type === "glucose" ? "↑" : "↓")
            : "→";

          const isPositive = metric.type === "weight" || metric.type === "glucose"
            ? metric.trend === "down"
            : metric.trend === "up";

          return (
            <div
              key={metric.type}
              className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{metric.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {metric.current}
                <span className="text-xs font-normal text-gray-400 ml-1">{metric.unit}</span>
              </p>
              <span className={`text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}>
                {TrendIcon} {Math.abs(metric.changePercent).toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
