"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { BarChart3, Loader2, RefreshCw } from "lucide-react";
import WeightChart from "@/components/dashboard/WeightChart";
import GlucoseChart from "@/components/dashboard/GlucoseChart";
import SleepChart from "@/components/dashboard/SleepChart";
import MoodTimeline from "@/components/dashboard/MoodTimeline";
import MedicationTracker from "@/components/dashboard/MedicationTracker";
import WeeklyInsights from "@/components/dashboard/WeeklyInsights";
import HealthOverview from "@/components/dashboard/HealthOverview";
import GoalList from "@/components/goals/GoalList";
import type { DashboardData } from "@/types/health";

export default function DashboardPage() {
  const { userProfile, setShowDashboard } = useStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"health" | "goals">("health");

  useEffect(() => {
    if (!userProfile?.id) {
      setShowDashboard(false);
      return;
    }
    fetchDashboard();
  }, [userProfile?.id]);

  async function fetchDashboard() {
    if (!userProfile?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard?userId=${userProfile.id}`);
      if (res.ok) {
        const dashboardData = await res.json();
        setData(dashboardData);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!userProfile?.id) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const weightData = data?.metrics.find((m) => m.type === "weight");
  const glucoseData = data?.metrics.find((m) => m.type === "glucose");
  const sleepData = data?.metrics.find((m) => m.type === "sleep");
  const moodData = data?.metrics.find((m) => m.type === "mood");
  const medicationData = data?.metrics.find((m) => m.type === "medication");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Health Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboard}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDashboard(false)}
              className="px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Back to Chat
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("health")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "health"
                ? "bg-blue-500 text-white"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
            }`}
          >
            Health Metrics
          </button>
          <button
            onClick={() => setActiveTab("goals")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "goals"
                ? "bg-blue-500 text-white"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
            }`}
          >
            Goals
          </button>
        </div>

        {activeTab === "health" ? (
          <div className="space-y-6">
            {data && <HealthOverview data={data} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WeightChart
                data={weightData?.data || []}
                trend={weightData?.trend}
                changePercent={weightData?.changePercent}
              />
              <GlucoseChart data={glucoseData?.data || []} />
              <SleepChart data={sleepData?.data || []} />
              <MoodTimeline data={moodData?.data || []} />
              {medicationData && (
                <MedicationTracker
                  adherence={medicationData.current}
                  streak={7}
                />
              )}
            </div>

            {data && (
              <WeeklyInsights
                insights={data.insights}
                weeklySummary={data.weeklySummary}
              />
            )}

            {!data?.metrics.some((m) => m.current > 0) && (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Start Tracking Your Health
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Log your health metrics daily to unlock AI-powered insights, trends, and personalized recommendations.
                </p>
              </div>
            )}
          </div>
        ) : (
          <GoalList userId={userProfile.id} />
        )}
      </div>
    </div>
  );
}
