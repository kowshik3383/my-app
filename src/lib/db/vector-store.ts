import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import { cosineSimilarity, normalizeScore } from "@/lib/memory/embeddings";

export interface VectorDocument {
  _id?: ObjectId;
  collection: string;
  documentId: string;
  embedding: number[];
  text: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export async function storeVector(
  collection: string,
  documentId: string,
  embedding: number[],
  text: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const db = await getDb();
  await db.collection<VectorDocument>("vector_store").updateOne(
    { collection, documentId },
    {
      $set: {
        collection,
        documentId,
        embedding,
        text,
        metadata,
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
}

export async function searchVectors(
  collection: string,
  queryEmbedding: number[],
  limit: number = 10,
  minScore: number = 0.5
): Promise<{ document: VectorDocument; score: number }[]> {
  const db = await getDb();
  const docs = await db
    .collection<VectorDocument>("vector_store")
    .find({ collection })
    .limit(100)
    .toArray();

  const scored = docs
    .map((doc) => ({
      document: doc,
      score: normalizeScore(cosineSimilarity(doc.embedding, queryEmbedding)),
    }))
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

export async function deleteVector(collection: string, documentId: string): Promise<void> {
  const db = await getDb();
  await db.collection("vector_store").deleteOne({ collection, documentId });
}
