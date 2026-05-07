import { NextRequest, NextResponse } from "next/server";
import { getDb, ObjectId } from "@/lib/db/mongodb";
import type { HealthMetric, MetricType } from "@/types/health";
import { METRIC_DEFINITIONS } from "@/types/health";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, metricType, value, unit, notes } = body;

    if (!userId || !metricType || value === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: userId, metricType, value" },
        { status: 400 }
      );
    }

    const validMetric = METRIC_DEFINITIONS[metricType as MetricType];
    if (!validMetric) {
      return NextResponse.json(
        { error: `Invalid metric type: ${metricType}` },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db.collection<HealthMetric>("health_metrics").insertOne({
      userId: new ObjectId(userId),
      metricType: metricType as MetricType,
      value: Number(value),
      unit: unit || validMetric.unit,
      notes,
      source: "manual",
      timestamp: new Date(),
    } as HealthMetric);

    return NextResponse.json({
      id: result.insertedId.toString(),
      metricType,
      value: Number(value),
      unit: unit || validMetric.unit,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error saving health metric:", error);
    return NextResponse.json({ error: "Failed to save metric" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const metricType = searchParams.get("metricType");
    const days = parseInt(searchParams.get("days") || "30");
    const limit = parseInt(searchParams.get("limit") || "100");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const db = await getDb();
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const query: any = {
      userId: new ObjectId(userId),
      timestamp: { $gte: since },
    };
    if (metricType) query.metricType = metricType;

    const metrics = await db
      .collection<HealthMetric>("health_metrics")
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    const grouped = metrics.reduce<Record<string, HealthMetric[]>>((acc, m) => {
      if (!acc[m.metricType]) acc[m.metricType] = [];
      acc[m.metricType].push(m);
      return acc;
    }, {});

    const result = Object.entries(grouped).map(([type, values]) => {
      const def = METRIC_DEFINITIONS[type as MetricType];
      const avg = values.reduce((s, v) => s + v.value, 0) / values.length;
      const sorted = [...values].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      return {
        type,
        label: def?.label || type,
        unit: def?.unit || "",
        count: values.length,
        average: Math.round(avg * 100) / 100,
        min: Math.round(Math.min(...values.map((v) => v.value)) * 100) / 100,
        max: Math.round(Math.max(...values.map((v) => v.value)) * 100) / 100,
        latest: sorted[sorted.length - 1],
        data: sorted.map((m) => ({
          date: m.timestamp.toISOString().split("T")[0],
          value: m.value,
          notes: m.notes,
        })),
      };
    });

    return NextResponse.json({ metrics: result });
  } catch (error) {
    console.error("Error fetching health metrics:", error);
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}
