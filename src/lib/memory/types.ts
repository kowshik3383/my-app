import type { MemoryType } from "@/types/memory";

export const MEMORY_TYPES: MemoryType[] = ["episodic", "health_fact", "behavioral", "emotional", "summary"];

export const IMPORTANCE_THRESHOLDS = {
  low: 0.3,
  medium: 0.6,
  high: 0.8,
} as const;

export const TOKEN_BUDGETS = {
  memory_context: 2048,
  summary_context: 1024,
  goal_context: 512,
} as const;
