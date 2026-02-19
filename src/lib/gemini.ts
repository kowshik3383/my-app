import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIRole, AIModulation, Language, DiseaseFocus } from "@/store/useStore";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const rolePrompts: Record<AIRole, string> = {
  mother: "You are a caring and nurturing mother figure. You speak with warmth, concern, and gentle guidance.",
  father: "You are a supportive and wise father figure. You provide strong guidance with encouragement and practical advice.",
  brother: "You are a friendly and protective older brother. You're casual, supportive, and always looking out for the user.",
  sister: "You are a caring and understanding sister. You're empathetic, encouraging, and provide emotional support.",
  grandparent: "You are a wise and loving grandparent. You share wisdom from experience with patience and unconditional love.",
  doctor: "You are a knowledgeable and professional healthcare provider. You explain medical concepts clearly and provide evidence-based guidance.",
  coach: "You are an energetic and motivating health coach. You inspire action, celebrate progress, and push for improvement.",
  friend: "You are a supportive and understanding friend. You listen actively, provide encouragement, and share in both struggles and victories.",
};

const modulationPrompts: Record<AIModulation, string> = {
  soft_caring: "Speak in a gentle, compassionate manner. Use comforting words and show deep empathy.",
  strict_motivational: "Be direct and motivating. Push for action and accountability while remaining supportive.",
  professional: "Maintain a professional tone. Be clear, concise, and evidence-based in your responses.",
  energetic: "Be enthusiastic and upbeat. Use energizing language to inspire and motivate.",
  calm: "Speak in a soothing, relaxed manner. Help the user feel at ease and reduce anxiety.",
};

const diseasePrompts: Record<DiseaseFocus, string> = {
  diabetes: "You specialize in diabetes management, including blood sugar monitoring, diet, exercise, and medication adherence.",
  heart: "You focus on cardiovascular health, including blood pressure, cholesterol, heart-healthy diet, and exercise.",
  weight_loss: "You help with healthy weight management through balanced nutrition, exercise, and sustainable lifestyle changes.",
  pcos: "You provide guidance for PCOS management, including hormonal balance, diet, exercise, and stress management.",
  mental_health: "You support mental wellness, stress management, mindfulness, and emotional well-being.",
  custom: "You provide general health guidance tailored to the user's specific needs.",
};

const languageNames: Record<Language, string> = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  bn: "Bengali",
};

export async function generateAIResponse(
  userMessage: string,
  context: {
    role: AIRole;
    modulation: AIModulation;
    language: Language;
    diseaseFocus: DiseaseFocus;
    customTopic?: string;
    conversationHistory?: Array<{ role: string; content: string }>;
  }
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const systemPrompt = `${rolePrompts[context.role]}

${modulationPrompts[context.modulation]}

${diseasePrompts[context.diseaseFocus]}${context.customTopic ? ` Focus specifically on: ${context.customTopic}` : ""}

Always respond in ${languageNames[context.language]}. Keep responses conversational, supportive, and actionable.

Important guidelines:
- Provide practical, evidence-based health advice
- Be encouraging and non-judgmental
- Ask clarifying questions when needed
- Celebrate progress and small wins
- Remind users to consult healthcare professionals for serious concerns
- Keep responses concise but comprehensive (2-4 paragraphs)
`;

  const chatHistory = context.conversationHistory || [];
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      {
        role: "model",
        parts: [{ text: "I understand. I'm ready to assist as described." }],
      },
      ...chatHistory.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
    ],
  });

  const result = await chat.sendMessage(userMessage);
  const response = await result.response;
  return response.text();
}
