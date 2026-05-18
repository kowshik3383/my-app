import { MongoClient, Db, ObjectId } from "mongodb";

if (!process.env.DATABASE_URL) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

const uri = process.env.DATABASE_URL;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db("health-companion");
}

export async function ensureCollections(): Promise<void> {
  const db = await getDb();
  const collections = await db.listCollections().toArray();
  const names = collections.map((c) => c.name);

  const required = ["users", "sessions", "messages", "health_metrics", "goals", "goal_progress", "memories", "memory_summaries", "ai_insights", "voice_sessions", "voice_events", "voice_analytics", "emotion_signals", "call_summaries"];
  const createOps = required
    .filter((name) => !names.includes(name))
    .map((name) => db.createCollection(name).catch(() => {}));

  await Promise.all(createOps);

  if (!names.includes("health_metrics")) {
    try {
      await db.createCollection("health_metrics", {
        timeseries: { timeField: "timestamp", metaField: "metadata", granularity: "hours" },
      });
    } catch {
      await db.createCollection("health_metrics");
    }
  }
}

export { ObjectId };
