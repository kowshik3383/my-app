import { GoogleGenAI } from "@google/genai";
import type {
  AIRole,
  AIModulation,
  Language,
  DiseaseFocus,
} from "@/store/useStore";

/* ===================================================== */
/* ================== INITIALIZE AI ==================== */
/* ===================================================== */

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

/* ===================================================== */
/* ================= AVAILABLE MODELS ================== */
/* ===================================================== */

// Only text-generation capable models
const AVAILABLE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-flash-latest",
  "gemini-pro-latest",
  "gemini-3-flash-preview", // correct preview name
];

let modelIndex = 0;

function getNextModel(): string {
  const model = AVAILABLE_MODELS[modelIndex];
  modelIndex = (modelIndex + 1) % AVAILABLE_MODELS.length;
  return model;
}

/* ===================================================== */
/* ================= DEBUG: LIST MODELS ================= */
/* ===================================================== */

export async function listModels() {
  const models = await ai.models.list();
  console.log("Available Models:");
  models.forEach((m: any) => {
    console.log(m.name);
  });
}

/* ===================================================== */
/* -------------------- ROLE PROMPTS -------------------- */
/* ===================================================== */

const rolePrompts: Record<string, string> = {
  mother: "You ARE this person's caring and nurturing mother.",
  father: "You ARE this person's supportive and wise father.",
  brother: "You ARE their older brother. Protective and loyal.",
  sister: "You ARE their caring sister.",
  grandparent: "You ARE their loving grandparent.",
  doctor: "You ARE their caring doctor.",
  therapist: "You ARE their compassionate therapist.",
  nurse: "You ARE their attentive nurse.",
  coach: "You ARE their energetic health coach.",
  mentor: "You ARE their wise mentor.",
  teacher: "You ARE their patient teacher.",
  friend: "You ARE their close friend.",
  best_friend: "You ARE their best friend.",
  girlfriend: "You ARE their loving girlfriend.",
  partner: "You ARE their committed partner.",
  leader: "You ARE their inspiring leader.",
  boss: "You ARE their structured but supportive boss.",
  teammate: "You ARE their dependable teammate.",
  spiritual_guide: "You ARE their calm spiritual guide.",
  motivator: "You ARE their energetic motivator.",
  caregiver: "You ARE their gentle caregiver.",
};

/* ===================================================== */
/* -------------------- MODULATION ---------------------- */
/* ===================================================== */

const modulationPrompts: Record<AIModulation, string> = {
  soft_caring: "Tone: Gentle and compassionate.",
  strict_motivational: "Tone: Direct and firm but warm.",
  professional: "Tone: Professional and evidence-based.",
  energetic: "Tone: Enthusiastic and upbeat.",
  calm: "Tone: Soothing and relaxed.",
};

/* ===================================================== */
/* -------------------- DISEASE FOCUS ------------------- */
/* ===================================================== */

const diseasePrompts: Record<DiseaseFocus, string> = {
  diabetes: "Focus: Diabetes management.",
  heart: "Focus: Cardiovascular health.",
  weight_loss: "Focus: Sustainable weight management.",
  pcos: "Focus: PCOS hormonal support.",
  mental_health: "Focus: Emotional wellness.",
  custom: "Focus: Personalized health guidance.",
};

/* ===================================================== */
/* -------------------- LANGUAGE ------------------------ */
/* ===================================================== */

const languageNames: Record<Language, string> = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  bn: "Bengali",
};

/* ===================================================== */
/* ---------------- EMOTION RULES ----------------------- */
/* ===================================================== */

const emotionTagInstructions = `
You MUST start every response with one tag:
[happy] [sadly] [playfully] [angrily] [whispers] [giggles] [sarcastically]

Never break character.
Never say you are an AI.
Keep responses short (2-4 sentences).
Use emojis naturally.
`;

/* ===================================================== */
/* ================= MAIN RESPONSE FUNCTION ============ */
/* ===================================================== */

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
  // Use env override OR rotate automatically
  const MODEL =
    process.env.GEMINI_MODEL && process.env.GEMINI_MODEL !== ""
      ? process.env.GEMINI_MODEL
      : getNextModel();

  console.log("Using model:", MODEL);

  const rolePrompt =
    rolePrompts[context.role] ||
    `You are their trusted companion named ${context.role}.`;

  const systemPrompt = `
${rolePrompt}
${modulationPrompts[context.modulation]}
${diseasePrompts[context.diseaseFocus]}
${context.customTopic ? `Specific topic: ${context.customTopic}` : ""}

${emotionTagInstructions}

Respond ONLY in ${languageNames[context.language]}.
Stay fully in character.
`;

  const historyText =
    context.conversationHistory
      ?.map((msg) =>
        msg.role === "user"
          ? `User: ${msg.content}`
          : `You: ${msg.content}`
      )
      .join("\n") || "";

  const fullPrompt = `
SYSTEM:
${systemPrompt}

CONVERSATION:
${historyText}

User: ${userMessage}
`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: fullPrompt,
    });

    return (
      response.text ??
      "[sadly] I'm having trouble responding right now. Please try again."
    );
  } catch (error) {
    console.error("Gemini Error:", error);

    return "[sadly] Something went wrong while responding. Please try again.";
  }
}