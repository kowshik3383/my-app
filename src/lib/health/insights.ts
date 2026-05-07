import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import { chatCompletion } from "@/lib/ai/client";
import type { HealthMetric, AIInsight, MetricType, DashboardData } from "@/types/health";

export async function generateWeeklyInsights(userId: string): Promise<string[]> {
  const db = await getDb();
  const uid = new ObjectId(userId);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const recentMetrics = await db
    .collection<HealthMetric>("health_metrics")
    .find({ userId: uid, timestamp: { $gte: weekAgo } })
    .sort({ timestamp: -1 })
    .toArray();

  if (recentMetrics.length === 0) {
    return ["Start tracking your health metrics to receive personalized insights."];
  }

  const metricsByType = recentMetrics.reduce<Record<string, HealthMetric[]>>((acc, m) => {
    if (!acc[m.metricType]) acc[m.metricType] = [];
    acc[m.metricType].push(m);
    return acc;
  }, {});

  const summary = Object.entries(metricsByType)
    .map(([type, values]) => {
      const avg = values.reduce((s, v) => s + v.value, 0) / values.length;
      const recent = values.slice(-3).reduce((s, v) => s + v.value, 0) / Math.min(3, values.length);
      const prev = values.slice(0, -3).reduce((s, v) => s + v.value, 0) / Math.max(1, values.length - Math.min(3, values.length));
      return `${type}: avg=${avg.toFixed(1)}, recent=${recent.toFixed(1)}, previous=${prev.toFixed(1)}`;
    })
    .join("\n");

  const prompt = `Analyze this week's health metrics and provide 2-3 brief, actionable insights:

${summary}

Return as a JSON array of strings. Each insight should be 1 sentence and include specific numbers where relevant.`;

  const result = await chatCompletion({
    messages: [
      { role: "system", content: "You generate health insights from metric data. Return ONLY valid JSON." },
      { role: "user", content: prompt },
    ],
    task: "insight",
    temperature: 0.5,
  });

  try {
    const clean = result.content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const insights = JSON.parse(clean);
    if (Array.isArray(insights)) {
      for (const insight of insights.slice(0, 3)) {
        await db.collection<AIInsight>("ai_insights").insertOne({
          userId: uid,
          type: "trend",
          content: insight,
          severity: "info",
          dismissed: false,
          createdAt: new Date(),
        } as AIInsight);
      }
      return insights.slice(0, 3);
    }
  } catch {
    // fallback
  }

  return ["Continue tracking your metrics for personalized insights."];
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const db = await getDb();
  const uid = new ObjectId(userId);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const metricTypes: MetricType[] = ["weight", "glucose", "sleep", "mood", "steps", "water", "exercise", "medication"];

  const metrics = await Promise.all(
    metricTypes.map(async (type) => {
      const recent = await db
        .collection<HealthMetric>("health_metrics")
        .find({ userId: uid, metricType: type, timestamp: { $gte: weekAgo } })
        .sort({ timestamp: 1 })
        .toArray();

      const previous = await db
        .collection<HealthMetric>("health_metrics")
        .find({ userId: uid, metricType: type, timestamp: { $gte: twoWeeksAgo, $lt: weekAgo } })
        .toArray();

      const current =
        recent.length > 0
          ? recent.reduce((s, m) => s + m.value, 0) / recent.length
          : 0;
      const prevAvg =
        previous.length > 0
          ? previous.reduce((s, m) => s + m.value, 0) / previous.length
          : 0;

      const changePercent = prevAvg > 0 ? ((current - prevAvg) / prevAvg) * 100 : 0;

      let trend: "up" | "down" | "stable";
      if (Math.abs(changePercent) < 3) {
        trend = "stable";
      } else if (
        type === "weight" ||
        type === "glucose"
      ) {
        trend = changePercent < 0 ? "down" : "up";
      } else {
        trend = changePercent > 0 ? "up" : "down";
      }

      const metricDef = (await import("@/types/health")).METRIC_DEFINITIONS[type];

      return {
        type,
        label: metricDef.label,
        unit: metricDef.unit,
        current: Math.round(current * 10) / 10,
        previous: Math.round(prevAvg * 10) / 10,
        trend,
        changePercent: Math.round(changePercent * 10) / 10,
        data: recent.map((m) => ({
          date: m.timestamp.toISOString().split("T")[0],
          value: m.value,
        })),
      };
    })
  );

  const insights = await db
    .collection<AIInsight>("ai_insights")
    .find({ userId: uid, dismissed: false })
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

  const allMetrics = await Promise.all(metricTypes.map(async (type) => {
    const data = await db
      .collection<HealthMetric>("health_metrics")
      .find({ userId: uid, metricType: type, timestamp: { $gte: weekAgo } })
      .toArray();
    return { type, count: data.length };
  }));

  const hasData = allMetrics.some((m) => m.count > 0);
  const weeklySummary = hasData
    ? `You tracked ${allMetrics.filter((m) => m.count > 0).length} metrics this week. ${insights.length > 0 ? insights[0].content : "Keep tracking for more insights."}`
    : "Start tracking your health metrics to see your weekly summary.";

  return {
    userId,
    metrics,
    insights: insights.map((i) => i.content),
    weeklySummary,
  };
}
