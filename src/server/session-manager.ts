import { getDb } from "@/lib/db/mongodb";
import { logger } from "@/lib/observability/logging";
import type { VoiceSession } from "@/types/realtime";

const activeSessions = new Map<string, VoiceSession>();

export class SessionManager {
  async createSession(userId: string): Promise<VoiceSession> {
    const db = await getDb();
    const session: VoiceSession = {
      id: crypto.randomUUID(),
      userId,
      startedAt: new Date(),
      duration: 0,
      status: "active",
      messageCount: 0,
    };

    await db.collection("voice_sessions").insertOne({
      _id: session.id,
      userId: session.userId,
      startedAt: session.startedAt,
      duration: 0,
      status: "active",
      messageCount: 0,
    });

    activeSessions.set(session.id, session);
    logger.info("Voice session created", { sessionId: session.id, userId });
    return session;
  }

  async endSession(sessionId: string): Promise<void> {
    const session = activeSessions.get(sessionId);
    if (!session) {
      const db = await getDb();
      const existing = await db.collection("voice_sessions").findOne({ _id: sessionId });
      if (!existing) return;
      const endedAt = new Date();
      await db.collection("voice_sessions").updateOne(
        { _id: sessionId },
        { $set: { endedAt, duration: Date.now() - new Date(existing.startedAt).getTime(), status: "ended" } }
      );
      return;
    }

    session.endedAt = new Date();
    session.duration = Date.now() - session.startedAt.getTime();
    session.status = "ended";

    const db = await getDb();
    await db.collection("voice_sessions").updateOne(
      { _id: sessionId },
      {
        $set: {
          endedAt: session.endedAt,
          duration: session.duration,
          status: "ended",
        },
      }
    );

    activeSessions.delete(sessionId);
    logger.info("Voice session ended", { sessionId, duration: session.duration });
  }

  getSession(sessionId: string): VoiceSession | undefined {
    return activeSessions.get(sessionId);
  }

  async getSessionFromDb(sessionId: string): Promise<VoiceSession | null> {
    const db = await getDb();
    const doc = await db.collection("voice_sessions").findOne({ _id: sessionId });
    if (!doc) return null;
    return {
      id: doc._id as string,
      userId: doc.userId,
      startedAt: doc.startedAt,
      duration: doc.duration || 0,
      status: doc.status || "ended",
      messageCount: doc.messageCount || 0,
    };
  }

  incrementMessageCount(sessionId: string): void {
    const session = activeSessions.get(sessionId);
    if (session) {
      session.messageCount++;
    }
  }

  async logVoiceEvent(sessionId: string, userId: string, event: string, data: unknown): Promise<void> {
    const db = await getDb();
    await db.collection("voice_events").insertOne({
      sessionId,
      userId,
      event,
      data,
      timestamp: new Date(),
    });
  }

  async generateCallSummary(sessionId: string, userId: string): Promise<void> {
    try {
      const session = activeSessions.get(sessionId) || (await this.getSessionFromDb(sessionId));
      if (!session) return;

      const db = await getDb();
      const events = await db
        .collection("voice_events")
        .find({ sessionId })
        .sort({ timestamp: 1 })
        .toArray();

      const userTurns = events.filter((e: any) => e.event === "transcript.final").length;
      const aiTurns = events.filter((e: any) => e.event === "ai.tokens.complete").length;

      const finalTranscripts = events
        .filter((e: any) => e.event === "transcript.final")
        .map((e: any) => e.data?.text || "")
        .filter(Boolean);

      const aiResponses = events
        .filter((e: any) => e.event === "ai.tokens.complete")
        .map((e: any) => e.data?.fullText || "")
        .filter(Boolean);

      const combinedText = [...finalTranscripts, ...aiResponses].join("\n");

      const summary = {
        sessionId,
        userId,
        duration: session.duration,
        messageCount: session.messageCount,
        userTurns,
        aiTurns,
        topics: extractTopics(combinedText),
        emotions: extractEmotions(events),
        summary: combinedText.slice(0, 500),
        healthMentions: extractHealthMentions(combinedText),
        createdAt: new Date(),
      };

      await db.collection("call_summaries").insertOne(summary);

      await db.collection("voice_analytics").insertOne({
        sessionId,
        userId,
        duration: session.duration,
        userTurns,
        aiTurns,
        avgResponseTime: 0,
        interruptions: events.filter((e: any) => e.event === "interrupt").length,
        createdAt: new Date(),
      });

      logger.info("Call summary generated", { sessionId });
    } catch (error) {
      logger.error("Failed to generate call summary", { sessionId, error: String(error) });
    }
  }
}

function extractTopics(text: string): string[] {
  const topics: string[] = [];
  const keywords: Record<string, RegExp[]> = {
    health: [/health/i, /wellness/i, /exercise/i, /diet/i],
    diabetes: [/diabetes/i, /blood sugar/i, /glucose/i],
    mental_health: [/stress/i, /anxiety/i, /mood/i, /depression/i],
    sleep: [/sleep/i, /insomnia/i, /rest/i],
    nutrition: [/food/i, /diet/i, /nutrition/i, /meal/i],
    exercise: [/workout/i, /exercise/i, /running/i, /gym/i],
    medication: [/medication/i, /medicine/i, /pill/i, /prescription/i],
    goals: [/goal/i, /target/i, /progress/i, /streak/i],
  };

  for (const [topic, patterns] of Object.entries(keywords)) {
    if (patterns.some((p) => p.test(text))) {
      topics.push(topic);
    }
  }

  return [...new Set(topics)];
}

function extractHealthMentions(text: string): string[] {
  const mentions: string[] = [];
  const patterns = [
    /blood\s*(sugar|pressure|glucose)/gi,
    /(weight|bmi|body\s*mass)/gi,
    /(heart|cardio|cardiovascular)/gi,
    /(medication|medicine|prescription)/gi,
    /(exercise|workout|physical\s*activity)/gi,
    /(sleep|rest|insomnia)/gi,
    /(stress|anxiety|depression|mood)/gi,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) mentions.push(match[0].toLowerCase());
  }

  return [...new Set(mentions)];
}

function extractEmotions(events: any[]): { emotion: string; count: number }[] {
  const emotionCounts: Record<string, number> = {};
  const detected = events.filter((e: any) => e.event === "emotion.detected");
  for (const event of detected) {
    const emotion = event.data?.emotion || "neutral";
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
  }
  return Object.entries(emotionCounts).map(([emotion, count]) => ({ emotion, count }));
}

export const sessionManager = new SessionManager();
