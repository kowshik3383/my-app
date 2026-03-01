import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIRole, AIModulation, Language, DiseaseFocus } from "@/store/useStore";
import type { MemoryContext } from "@/types/memory";
import { formatMemoryContext } from "@/lib/memory";
import { getRolePersonality, getMemoryBiasPrompt } from "@/lib/roleSystem";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// ─── Disease Context ───────────────────────────────────────────────────────────

const diseasePrompts: Record<DiseaseFocus, string> = {
  diabetes:      "You specialize in diabetes management including blood sugar monitoring, diet, exercise, and medication adherence.",
  heart:         "You focus on cardiovascular health including blood pressure, cholesterol, heart-healthy diet, and exercise.",
  weight_loss:   "You help with healthy weight management through balanced nutrition, exercise, and sustainable lifestyle changes.",
  pcos:          "You provide guidance for PCOS management including hormonal balance, diet, exercise, and stress management.",
  mental_health: "You support mental wellness, stress management, mindfulness, and emotional well-being.",
  custom:        "You provide general health guidance tailored to the user's specific needs.",
};

const languageNames: Record<Language, string> = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  bn: "Bengali",
};

// Legacy modulation prompts — used as a fallback tone layer
const modulationPrompts: Record<AIModulation, string> = {
  soft_caring:         "Layer in gentleness and deep compassion in your word choice.",
  strict_motivational: "Add a direct, accountability-focused edge to your tone.",
  professional:        "Maintain clarity, precision, and evidence-based framing.",
  energetic:           "Infuse extra enthusiasm and upbeat energy into your language.",
  calm:                "Keep a soothing, unhurried, peace-inducing quality throughout.",
};

// ─── Main Response Generator ───────────────────────────────────────────────────

export async function generateAIResponse(
  userMessage: string,
  context: {
    role: AIRole;
    modulation: AIModulation;
    language: Language;
    diseaseFocus: DiseaseFocus;
    customTopic?: string;
    conversationHistory?: Array<{ role: string; content: string }>;
    memoryContext?: MemoryContext | null;
  }
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Pull role-based personality from the role system
  const rolePersonality = getRolePersonality(context.role);
  const memoryBiasPrompt = getMemoryBiasPrompt(context.role);

  // Build memory context string
  const memorySection = context.memoryContext
    ? formatMemoryContext(context.memoryContext)
    : "";

  // ── System Prompt Construction ──────────────────────────────────────────────
  const systemPrompt = `${rolePersonality.systemPrompt}

## Tone & Communication
${rolePersonality.toneDescription}
${modulationPrompts[context.modulation]}

## Response Structure
${rolePersonality.responseStructurePrompt}
${rolePersonality.maxResponseLength === "short" ? "Keep responses concise — 1-2 paragraphs maximum." : ""}
${rolePersonality.maxResponseLength === "long" ? "You may use longer, step-by-step explanations when helpful." : ""}

## Health Domain
${diseasePrompts[context.diseaseFocus]}${context.customTopic ? ` Focus specifically on: ${context.customTopic}` : ""}

## Language
Always respond entirely in ${languageNames[context.language]}.

## Memory Guidance
${memoryBiasPrompt}
${memorySection ? `\n${memorySection}\n` : ""}

## Core Guidelines
- Stay completely in character — never break role or reveal you are an AI unless directly asked
- If you know the user's name from memory, use it naturally (not every sentence)
- Reference their goals or past experiences when relevant for continuity
- Be encouraging and non-judgmental at all times
- Remind users to consult healthcare professionals for serious medical concerns
- Celebrate small wins and progress authentically`;

  const chatHistory = context.conversationHistory || [];

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      {
        role: "model",
        parts: [{ text: `Understood. I'm fully in character as your ${context.role} — ready to support you with warmth and purpose.` }],
      },
      ...chatHistory.map((msg) => ({
        role: msg.role === "user" ? "user" : ("model" as "user" | "model"),
        parts: [{ text: msg.content }],
      })),
    ],
  });

  const result = await chat.sendMessage(userMessage);
  const response = await result.response;
  return response.text();
}
