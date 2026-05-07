import { generateEmbedding, generateEmbeddings } from "@/lib/ai/client";

export async function getEmbedding(text: string): Promise<number[]> {
  return generateEmbedding(text);
}

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  return generateEmbeddings(texts);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

export function normalizeScore(rawScore: number): number {
  return Math.max(0, Math.min(1, (rawScore + 1) / 2));
}
