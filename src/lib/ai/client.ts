import OpenAI from "openai";
import { getModelForTask, type ModelTask } from "./models";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }
    client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    });
  }
  return client;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  messages: ChatMessage[];
  task?: ModelTask;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export async function chatCompletion(options: ChatOptions): Promise<ChatResponse> {
  const modelConfig = getModelForTask(options.task || "fast_chat");
  const openai = getClient();

  const response = await openai.chat.completions.create({
    model: modelConfig.model,
    messages: options.messages,
    max_tokens: options.maxTokens || modelConfig.maxTokens,
    temperature: options.temperature ?? modelConfig.temperature,
  });

  return {
    content: response.choices[0]?.message?.content || "",
    model: response.model,
    usage: response.usage
      ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        }
      : undefined,
  };
}

export async function* chatCompletionStream(options: ChatOptions): AsyncGenerator<string> {
  const modelConfig = getModelForTask(options.task || "fast_chat");
  const openai = getClient();

  const stream = await openai.chat.completions.create({
    model: modelConfig.model,
    messages: options.messages,
    max_tokens: options.maxTokens || modelConfig.maxTokens,
    temperature: options.temperature ?? modelConfig.temperature,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    if (content) {
      yield content;
    }
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getClient();

  const response = await openai.embeddings.create({
    model: "openai/text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const openai = getClient();

  const response = await openai.embeddings.create({
    model: "openai/text-embedding-3-small",
    input: texts,
  });

  return response.data.map((d) => d.embedding);
}
