"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { Loader2, LayoutDashboard, ChevronDown, ChevronRight } from "lucide-react";
import Card from "@/components/ui/Card";
import StatCard from "@/components/dashboard/StatCard";
import WeightChart from "@/components/dashboard/WeightChart";
import GlucoseChart from "@/components/dashboard/GlucoseChart";
import SleepChart from "@/components/dashboard/SleepChart";
import MoodTimeline from "@/components/dashboard/MoodTimeline";
import MedicationTracker from "@/components/dashboard/MedicationTracker";
import WeeklyInsights from "@/components/dashboard/WeeklyInsights";
import type { DashboardData } from "@/types/health";
import type { AIInsight } from "@/types/health";

export default function DashboardPage() {
  const { userProfile } = useStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState({
    weight: true,
    glucose: true,
    sleep: true,
    mood: true,
    medication: true,
    insights: true,
  });

  useEffect(() => {
    if (!userProfile?.id) return;
    fetchDashboard();
    fetchInsights();
  }, [userProfile?.id]);

  async function fetchDashboard() {
    try {
      setLoading(true);
      const res = await fetch(`/api/dashboard?userId=${userProfile!.id}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchInsights() {
    try {
      const res = await fetch(`/api/health/insights?userId=${userProfile!.id}&limit=10`);
      if (res.ok) {
        const json = await res.json();
        setInsights(json.insights || json || []);
      }
    } catch (err) {
      console.error("Failed to fetch insights:", err);
    }
  }

  function toggleSection(key: keyof typeof sections) {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  if (loading) {
    return (
      <div className="dash-loading">
        <Loader2 size={20} strokeWidth={1.5} className="dash-spinner" />
        <style jsx>{`
          .dash-loading {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-tertiary);
          }
          .dash-spinner { animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  const metrics = data?.metrics || [];

  const findMetric = (type: string) => metrics.find((m) => m.type === type);

  const weightMetric = findMetric("weight");
  const glucoseMetric = findMetric("glucose");
  const hba1cMetric = findMetric("hbA1c");
  const sleepMetric = findMetric("sleep");
  const moodMetric = findMetric("mood");

  return (
    <div className="dash-root scrollbar-thin">
      <div className="dash-header">
        <div className="dash-title-row">
          <LayoutDashboard size={18} strokeWidth={1.5} />
          <h1>Dashboard</h1>
        </div>
        <p className="dash-subtitle">Your health at a glance</p>
      </div>

      <div className="dash-body">
        {/* Stat Cards */}
        <div className="dash-stats">
          {weightMetric && (
            <StatCard
              label="Weight"
              value={weightMetric.current}
              unit={weightMetric.unit}
              trend={weightMetric.trend}
              changePercent={weightMetric.changePercent}
            />
          )}
          {hba1cMetric && (
            <StatCard
              label="HbA1c"
              value={hba1cMetric.current}
              unit={hba1cMetric.unit}
              trend={hba1cMetric.trend}
              changePercent={hba1cMetric.changePercent}
            />
          )}
          {sleepMetric && (
            <StatCard
              label="Sleep"
              value={sleepMetric.current}
              unit={sleepMetric.unit}
              trend={sleepMetric.trend}
              changePercent={sleepMetric.changePercent}
              subtitle={sleepMetric.current >= 7 ? "Optimal range" : "Below target"}
            />
          )}
          {moodMetric && (
            <StatCard
              label="Mood"
              value={moodMetric.current}
              unit={moodMetric.unit}
              trend={moodMetric.trend}
              changePercent={moodMetric.changePercent}
            />
          )}
        </div>

        {/* Chart Sections */}
        {weightMetric?.data && weightMetric.data.length > 0 && (
          <Card padding="lg" variant="bordered">
            <button className="dash-section-toggle" onClick={() => toggleSection("weight")}>
              {sections.weight ? <ChevronDown size={14} strokeWidth={1.5} /> : <ChevronRight size={14} strokeWidth={1.5} />}
              Weight Tracking
            </button>
            {sections.weight && <WeightChart data={weightMetric.data} />}
          </Card>
        )}

        {glucoseMetric?.data && glucoseMetric.data.length > 0 && (
          <Card padding="lg" variant="bordered">
            <button className="dash-section-toggle" onClick={() => toggleSection("glucose")}>
              {sections.glucose ? <ChevronDown size={14} strokeWidth={1.5} /> : <ChevronRight size={14} strokeWidth={1.5} />}
              Blood Glucose
            </button>
            {sections.glucose && <GlucoseChart data={glucoseMetric.data} />}
          </Card>
        )}

        {sleepMetric?.data && sleepMetric.data.length > 0 && (
          <Card padding="lg" variant="bordered">
            <button className="dash-section-toggle" onClick={() => toggleSection("sleep")}>
              {sections.sleep ? <ChevronDown size={14} strokeWidth={1.5} /> : <ChevronRight size={14} strokeWidth={1.5} />}
              Sleep
            </button>
            {sections.sleep && <SleepChart data={sleepMetric.data} />}
          </Card>
        )}

        {moodMetric?.data && moodMetric.data.length > 0 && (
          <Card padding="lg" variant="bordered">
            <button className="dash-section-toggle" onClick={() => toggleSection("mood")}>
              {sections.mood ? <ChevronDown size={14} strokeWidth={1.5} /> : <ChevronRight size={14} strokeWidth={1.5} />}
              Mood
            </button>
            {sections.mood && <MoodTimeline data={moodMetric.data} />}
          </Card>
        )}

        {/* Insights */}
        <Card padding="lg" variant="bordered">
          <button className="dash-section-toggle" onClick={() => toggleSection("insights")}>
            {sections.insights ? <ChevronDown size={14} strokeWidth={1.5} /> : <ChevronRight size={14} strokeWidth={1.5} />}
            Weekly Insights
          </button>
          {sections.insights && (
            <WeeklyInsights insights={insights} weeklySummary={data?.weeklySummary || ""} />
          )}
        </Card>

        {metrics.length === 0 && (
          <div className="dash-empty">
            <p>No health data yet. Start tracking to see your dashboard populate.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .dash-root {
          height: 100%;
          overflow-y: auto;
          background: var(--bg);
        }
        .dash-header {
          padding: 32px 32px 20px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .dash-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }
        .dash-title-row h1 {
          font-size: 20px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--text);
          margin: 0;
        }
        .dash-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0 0 0 28px;
        }
        .dash-body {
          padding: 24px 32px 32px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .dash-stats {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 12px;
          margin-bottom: 8px;
        }
        .dash-section-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          background: none;
          border: none;
          font-size: 14px;
          font-weight: 500;
          color: var(--text);
          padding: 0 0 0;
          cursor: pointer;
          font-family: var(--font-sans);
          text-align: left;
          transition: color var(--transition-fast);
        }
        .dash-section-toggle:hover {
          color: var(--text-secondary);
        }
        .dash-empty {
          padding: 32px;
          text-align: center;
          color: var(--text-tertiary);
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
