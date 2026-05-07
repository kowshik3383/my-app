import { ObjectId } from "mongodb";

export type MetricType =
  | "weight"
  | "glucose"
  | "hbA1c"
  | "sleep"
  | "hydration"
  | "mood"
  | "exercise"
  | "steps"
  | "medication"
  | "water";

export interface HealthMetric {
  _id?: ObjectId;
  userId: ObjectId;
  metricType: MetricType;
  value: number;
  unit: string;
  notes?: string;
  source?: "manual" | "ai_extracted" | "imported";
  timestamp: Date;
}

export interface MetricDefinition {
  type: MetricType;
  label: string;
  unit: string;
  icon: string;
  color: string;
  min?: number;
  max?: number;
  target?: number;
}

export const METRIC_DEFINITIONS: Record<MetricType, MetricDefinition> = {
  weight: { type: "weight", label: "Weight", unit: "kg", icon: "scale", color: "#10b981", min: 30, max: 300 },
  glucose: { type: "glucose", label: "Blood Glucose", unit: "mg/dL", icon: "droplet", color: "#f59e0b", min: 50, max: 500 },
  hbA1c: { type: "hbA1c", label: "HbA1c", unit: "%", icon: "test-tube", color: "#ef4444", min: 3, max: 15 },
  sleep: { type: "sleep", label: "Sleep", unit: "hours", icon: "moon", color: "#8b5cf6", min: 0, max: 24 },
  hydration: { type: "hydration", label: "Hydration", unit: "glasses", icon: "droplets", color: "#3b82f6", min: 0, max: 20 },
  mood: { type: "mood", label: "Mood", unit: "score", icon: "smile", color: "#ec4899", min: 1, max: 10 },
  exercise: { type: "exercise", label: "Exercise", unit: "min", icon: "activity", color: "#22c55e", min: 0, max: 480 },
  steps: { type: "steps", label: "Steps", unit: "steps", icon: "footprints", color: "#a855f7", min: 0, max: 100000 },
  medication: { type: "medication", label: "Medication", unit: "%", icon: "pill", color: "#06b6d4", min: 0, max: 100 },
  water: { type: "water", label: "Water", unit: "L", icon: "glass-water", color: "#2563eb", min: 0, max: 10 },
};

export interface DashboardData {
  userId: string;
  metrics: {
    type: MetricType;
    label: string;
    unit: string;
    current: number;
    previous: number;
    trend: "up" | "down" | "stable";
    changePercent: number;
    data: { date: string; value: number }[];
  }[];
  insights: string[];
  weeklySummary: string;
}

export interface AIInsight {
  _id?: ObjectId;
  userId: ObjectId;
  type: "trend" | "anomaly" | "observation" | "motivation";
  content: string;
  metricType?: MetricType;
  severity: "info" | "warning" | "success";
  dismissed: boolean;
  createdAt: Date;
}
