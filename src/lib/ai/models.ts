export type ModelTask = "fast_chat" | "reasoning" | "memory" | "embedding" | "insight";

export interface ModelConfig {
  task: ModelTask;
  model: string;
  maxTokens: number;
  temperature: number;
  priority: number;
}

export const MODEL_ROUTES: Record<ModelTask, ModelConfig[]> = {
  fast_chat: [
    { task: "fast_chat", model: process.env.OPENROUTER_MODEL_FAST || "openai/gpt-4o-mini", maxTokens: 4096, temperature: 0.7, priority: 1 },
    { task: "fast_chat", model: "mistralai/mistral-small", maxTokens: 4096, temperature: 0.7, priority: 2 },
  ],
  reasoning: [
    { task: "reasoning", model: process.env.OPENROUTER_MODEL_REASONING || "anthropic/claude-sonnet-4", maxTokens: 8192, temperature: 0.3, priority: 1 },
    { task: "reasoning", model: "openai/gpt-4.1", maxTokens: 8192, temperature: 0.3, priority: 2 },
  ],
  memory: [
    { task: "memory", model: process.env.OPENROUTER_MODEL_MEMORY || "mistralai/mistral-small", maxTokens: 2048, temperature: 0.3, priority: 1 },
  ],
  embedding: [
    { task: "embedding", model: "openai/text-embedding-3-small", maxTokens: 0, temperature: 0, priority: 1 },
  ],
  insight: [
    { task: "insight", model: "mistralai/mistral-small", maxTokens: 1024, temperature: 0.5, priority: 1 },
  ],
};

export function getModelForTask(task: ModelTask): ModelConfig {
  const routes = MODEL_ROUTES[task];
  const preferred = process.env[`OPENROUTER_MODEL_${task.toUpperCase()}`];
  if (preferred) {
    const match = routes.find((r) => r.model === preferred);
    if (match) return match;
  }
  return routes[0];
}
