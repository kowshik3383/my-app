/**
 * Persistent Avatar Memory System
 * Multi-layer: Short-term | Long-term | Episodic | Emotional
 * Uses MongoDB with text indexes for semantic retrieval + importance scoring
 */

import { getDb, ObjectId } from "@/lib/mongodb";
import { EmotionStateMachine, analyzeEmotionSignals } from "@/lib/emotion";
import type {
  ShortTermMemory,
  LongTermMemory,
  EpisodicMemory,
  EmotionalMemory,
  MemoryContext,
  ExtractedMemory,
  EmotionLabel,
  ConversationTurn,
} from "@/types/memory";

// ─── Importance + Recency Scoring ─────────────────────────────────────────────
const IMPORTANCE_KEYWORDS = new Set([
  "goal","started","beginning","achieved","milestone","decided","diagnosed",
  "surgery","hospital","doctor","prescribed","lost","gained","quit","joined",
  "first time","important","never","always","stressed","crisis","breakthrough",
  "won","completed","exam","job","married","born","died","moved",
]);

function computeImportanceScore(text: string, emotionalValence: number): number {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  let keywordHits = 0;
  words.forEach((w) => {
    if (IMPORTANCE_KEYWORDS.has(w.replace(/[^a-z]/g, ""))) keywordHits++;
  });
  const keywordScore = Math.min(1, keywordHits / 3);
  const emotionScore = Math.abs(emotionalValence) * 0.5;
  return Math.min(1, keywordScore * 0.6 + emotionScore * 0.4);
}

function computeRecencyScore(createdAt: Date): number {
  const daysSince = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  // Exponential decay: half-life of ~14 days
  return Math.exp(-daysSince / 14);
}

// ─── Text Extraction Helpers ───────────────────────────────────────────────────
const NAME_PATTERNS = [
  /(?:my name is|i'm|i am|call me|they call me)\s+([A-Z][a-z]{1,20})/i,
  /(?:name's)\s+([A-Z][a-z]{1,20})/i,
];

const GOAL_PATTERNS = [
  /(?:i want to|i'm trying to|my goal is|i need to|i plan to|i aim to)\s+(.{10,80}?)(?:\.|$)/gi,
  /(?:want|trying|planning|hoping|going)\s+to\s+(.{5,60}?)(?:\.|,|$)/gi,
];

function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    "the","a","an","and","or","but","in","on","at","to","for","of","with","is","are","was","were","be","been","being","have","has","had","do","does","did","will","would","could","should","may","might","must","shall","can","need","dare","ought","used","it","its","i","me","my","you","your","we","our","they","their","he","she","his","her","this","that","these","those","what","which","who","whom","whose","when","where","why","how","all","each","every","both","few","more","most","some","any","no","not","only","same","so","than","then","too","very","just","also","up","down","out","off","over","under","again","further","once",
  ]);
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3 && !stopWords.has(w))
    .slice(0, 20);
}

export function extractMemoryFromText(
  userMessage: string,
  assistantMessage: string
): ExtractedMemory {
  const combined = `${userMessage} ${assistantMessage}`;
  const engine = new EmotionStateMachine();
  engine.analyzeAndTransition(assistantMessage);

  // Extract name
  let userName: string | undefined;
  for (const pattern of NAME_PATTERNS) {
    const match = userMessage.match(pattern);
    if (match) {
      userName = match[1];
      break;
    }
  }

  // Extract goals
  const goals: string[] = [];
  GOAL_PATTERNS.forEach((pattern) => {
    const matches = userMessage.matchAll(pattern);
    for (const match of matches) {
      const goal = match[1]?.trim();
      if (goal && goal.length > 5) goals.push(goal);
    }
  });

  // Extract topics (keywords from user message)
  const topics = extractKeywords(userMessage).slice(0, 5);

  // Extract important events
  const events: string[] = [];
  const eventPatterns = [
    /(?:i (?:started|began|joined|quit|stopped|finished|completed|achieved|lost|gained))\s+(.{5,60}?)(?:\.|$)/gi,
    /(?:i (?:was diagnosed|had|got|received|was told))\s+(.{5,60}?)(?:\.|$)/gi,
  ];
  eventPatterns.forEach((pattern) => {
    const matches = userMessage.matchAll(pattern);
    for (const match of matches) {
      const event = match[0]?.trim();
      if (event) events.push(event);
    }
  });

  // Compute sentiment
  const signals = analyzeEmotionSignals(userMessage);

  return {
    userName,
    goals,
    topics,
    events,
    preferences: {},
    sentimentScore: signals.valence,
    emotionLabel: engine.currentState as EmotionLabel,
  };
}

// ─── Database Operations ───────────────────────────────────────────────────────

/** Get or create long-term memory for user */
export async function getLongTermMemory(userId: string): Promise<LongTermMemory | null> {
  const db = await getDb();
  const col = db.collection("long_term_memory");
  return col.findOne({ userId: new ObjectId(userId) }) as Promise<LongTermMemory | null>;
}

/** Update long-term memory with extracted data */
export async function updateLongTermMemory(
  userId: string,
  extracted: ExtractedMemory
): Promise<void> {
  const db = await getDb();
  const col = db.collection("long_term_memory");

  const existing = (await col.findOne({ userId: new ObjectId(userId) })) as LongTermMemory | null;

  if (!existing) {
    const newMemory: Omit<LongTermMemory, "_id"> = {
      userId: new ObjectId(userId),
      userName: extracted.userName,
      preferences: extracted.preferences,
      goals: extracted.goals.map((g) => ({
        goal: g,
        status: "active",
        addedAt: new Date(),
      })),
      recurringTopics: extracted.topics,
      personalityTraits: [],
      importanceScore: 0.5,
      updatedAt: new Date(),
    };
    await col.insertOne(newMemory);
    return;
  }

  const updateOps: Record<string, any> = { $set: { updatedAt: new Date() } };

  if (extracted.userName && !existing.userName) {
    updateOps.$set.userName = extracted.userName;
  }

  // Merge recurring topics (keep top 15)
  if (extracted.topics.length > 0) {
    const allTopics = [
      ...new Set([...existing.recurringTopics, ...extracted.topics]),
    ].slice(0, 15);
    updateOps.$set.recurringTopics = allTopics;
  }

  // Add new goals that don't already exist
  const existingGoalTexts = new Set(existing.goals.map((g) => g.goal.toLowerCase()));
  const newGoals = extracted.goals
    .filter((g) => !existingGoalTexts.has(g.toLowerCase()))
    .map((g) => ({ goal: g, status: "active" as const, addedAt: new Date() }));

  if (newGoals.length > 0) {
    updateOps.$push = { goals: { $each: newGoals } };
  }

  await col.updateOne({ userId: new ObjectId(userId) }, updateOps);
}

/** Save or update short-term memory for a session */
export async function updateShortTermMemory(
  userId: string,
  sessionId: string,
  turn: ConversationTurn,
  activeTopic: string,
  emotionalContext: EmotionLabel
): Promise<void> {
  const db = await getDb();
  const col = db.collection("short_term_memory");

  await col.updateOne(
    { userId: new ObjectId(userId), sessionId: new ObjectId(sessionId) },
    {
      $push: { turns: { $each: [turn], $slice: -30 } }, // keep last 30 turns
      $set: { activeTopic, emotionalContext, updatedAt: new Date() },
    },
    { upsert: true }
  );
}

/** Save an episodic memory (important event) */
export async function saveEpisodicMemory(
  userId: string,
  sessionId: string,
  event: string,
  summary: string,
  emotionalValence: number
): Promise<void> {
  const db = await getDb();
  const col = db.collection("episodic_memory");

  // Create text index if not exists
  try {
    await col.createIndex({ keywords: "text", event: "text" });
  } catch (_) {}

  const keywords = extractKeywords(event + " " + summary);
  const importanceScore = computeImportanceScore(event + " " + summary, emotionalValence);

  const episodic: Omit<EpisodicMemory, "_id"> = {
    userId: new ObjectId(userId),
    sessionId: new ObjectId(sessionId),
    event,
    summary,
    keywords,
    emotionalValence,
    importanceScore,
    recencyScore: 1.0,
    createdAt: new Date(),
  };

  await col.insertOne(episodic);
}

/** Update emotional memory with a new sentiment point */
export async function updateEmotionalMemory(
  userId: string,
  sessionId: string,
  sentimentValue: number,
  emotionLabel: EmotionLabel
): Promise<void> {
  const db = await getDb();
  const col = db.collection("emotional_memory");

  const sentimentPoint = { value: sentimentValue, label: emotionLabel, timestamp: new Date() };

  await col.updateOne(
    { userId: new ObjectId(userId) },
    {
      $push: {
        sentimentHistory: { $each: [sentimentPoint], $slice: -100 }, // keep last 100
      },
      $set: {
        dominantPattern: emotionLabel,
        sessionId: new ObjectId(sessionId),
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}

/** Semantic retrieval: find relevant episodic memories for current message */
export async function retrieveRelevantEpisodes(
  userId: string,
  message: string,
  limit = 4
): Promise<EpisodicMemory[]> {
  const db = await getDb();
  const col = db.collection("episodic_memory");

  const keywords = extractKeywords(message);
  const objectUserId = new ObjectId(userId);

  // ---------- 1️⃣ TEXT SEARCH ----------
  let textResults: EpisodicMemory[] = [];

  try {
    textResults = await col
      .find(
        {
          userId: objectUserId,
          $text: { $search: keywords.join(" ") },
        },
        { projection: { score: { $meta: "textScore" } } }
      )
      .sort({ score: { $meta: "textScore" } })
      .limit(limit * 2)
      .toArray() as EpisodicMemory[];
  } catch (e) {
    // text index may not exist yet — safe fallback
    textResults = [];
  }

  // ---------- 2️⃣ KEYWORD FALLBACK ----------
  const keywordResults = await col
    .find({
      userId: objectUserId,
      keywords: { $in: keywords },
    })
    .limit(limit * 2)
    .toArray() as EpisodicMemory[];

  // ---------- 3️⃣ MERGE + DEDUPE ----------
  const map = new Map<string, EpisodicMemory>();

  [...textResults, ...keywordResults].forEach((ep: any) => {
    map.set(String(ep._id), ep);
  });

  const merged = Array.from(map.values());

  // ---------- 4️⃣ COMPOSITE SCORING ----------
  const scored = merged.map((ep) => ({
    ep,
    compositeScore:
      ep.importanceScore * 0.4 +
      computeRecencyScore(ep.createdAt) * 0.3 +
      (keywords.filter((k) => ep.keywords.includes(k)).length /
        Math.max(keywords.length, 1)) *
        0.3,
  }));

  scored.sort((a, b) => b.compositeScore - a.compositeScore);

  return scored.slice(0, limit).map((s) => s.ep);
}

/** Full memory context retrieval — called before every AI response */
export async function retrieveMemoryContext(
  userId: string,
  sessionId: string,
  currentMessage: string
): Promise<MemoryContext> {
  const db = await getDb();

  const [longTerm, shortTerm, emotionalPattern, relevantEpisodes] = await Promise.all([
    db.collection("long_term_memory").findOne({ userId: new ObjectId(userId) }) as Promise<LongTermMemory | null>,
    db.collection("short_term_memory").findOne({ userId: new ObjectId(userId), sessionId: new ObjectId(sessionId) }) as Promise<ShortTermMemory | null>,
    db.collection("emotional_memory").findOne({ userId: new ObjectId(userId) }) as Promise<EmotionalMemory | null>,
    retrieveRelevantEpisodes(userId, currentMessage),
  ]);

  return {
    longTerm: longTerm || null,
    shortTerm: shortTerm || null,
    emotionalPattern: emotionalPattern || null,
    recentEpisodes: relevantEpisodes,
  };
}

/** Convert memory context to AI-injectable string */
export function formatMemoryContext(ctx: MemoryContext): string {
  const parts: string[] = [];

  if (ctx.longTerm) {
    const lt = ctx.longTerm;
    if (lt.userName) parts.push(`User's name: ${lt.userName}`);

    const goalsArr = Array.isArray(lt.goals) ? lt.goals : [];
    const activeGoals = goalsArr.filter((g) => g.status === "active").slice(0, 3);
    if (activeGoals.length > 0) {
      parts.push(`Active goals: ${activeGoals.map((g) => g.goal).join("; ")}`);
    }

    const topicsArr = Array.isArray(lt.recurringTopics) ? lt.recurringTopics : [];
    if (topicsArr.length > 0) {
      parts.push(`Common topics: ${topicsArr.slice(0, 5).join(", ")}`);
    }

    const traitsArr = Array.isArray(lt.personalityTraits) ? lt.personalityTraits : [];
    if (traitsArr.length > 0) {
      parts.push(`Personality: ${traitsArr.join(", ")}`);
    }
  }

  if (ctx.emotionalPattern) {
    const ep: any = ctx.emotionalPattern;
    const dominant = ep?.dominantPattern ?? "neutral";
    parts.push(`Dominant emotional pattern: ${dominant}`);

    const stress: string[] = Array.isArray(ep?.stressIndicators) ? ep.stressIndicators : [];
    if (stress.length > 0) {
      parts.push(`Known stress triggers: ${stress.slice(0, 3).join(", ")}`);
    }
  }

  const episodesArr = Array.isArray(ctx.recentEpisodes) ? ctx.recentEpisodes : [];
  if (episodesArr.length > 0) {
    const episodesSummary = episodesArr
      .slice(0, 3)
      .map((e) => `• ${e.event}`)
      .join("\n");
    parts.push(`Important past events:\n${episodesSummary}`);
  }

  if (ctx.shortTerm) {
    if ((ctx.shortTerm as any).activeTopic) {
      parts.push(`Current session topic: ${ctx.shortTerm.activeTopic}`);
    }
    if ((ctx.shortTerm as any).emotionalContext) {
      parts.push(`Current emotional context: ${ctx.shortTerm.emotionalContext}`);
    }
  }

  if (parts.length === 0) return "";

  return `## User Memory Context\n${parts.join("\n")}\n\nUse this context to personalize responses. Reference the user by name if known. Acknowledge goals and past events naturally.`;
}

/** Summarize a session into episodic memory (call after session ends) */
export async function summarizeSessionToEpisodic(
  userId: string,
  sessionId: string,
  messages: Array<{ role: string; content: string }>
): Promise<void> {
  if (messages.length < 2) return;

  const userMessages = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ");

  const extracted = extractMemoryFromText(
    userMessages,
    messages.filter((m) => m.role === "assistant").map((m) => m.content).join(" ")
  );

  // Save significant events
  for (const event of extracted.events) {
    await saveEpisodicMemory(
      userId,
      sessionId,
      event,
      `From session: ${event}`,
      extracted.sentimentScore
    );
  }

  // Update long-term memory
  await updateLongTermMemory(userId, extracted);

  // Update emotional memory
  await updateEmotionalMemory(userId, sessionId, extracted.sentimentScore, extracted.emotionLabel);
}

/** Ensure MongoDB indexes for memory collections */
export async function ensureMemoryIndexes(): Promise<void> {
  try {
    const db = await getDb();
    await Promise.all([
      db.collection("episodic_memory").createIndex({ userId: 1 }),
      db.collection("episodic_memory").createIndex({ keywords: "text", event: "text" }),
      db.collection("long_term_memory").createIndex({ userId: 1 }, { unique: true }),
      db.collection("short_term_memory").createIndex({ userId: 1, sessionId: 1 }, { unique: true }),
      db.collection("emotional_memory").createIndex({ userId: 1 }, { unique: true }),
    ]);
  } catch (_) {
    // Indexes may already exist
  }
}
