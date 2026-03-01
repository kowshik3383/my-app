/**
 * Role-Based AI Personality System
 * Controls: tone, response structure, emotional intensity,
 * memory bias, UI theme, avatar lighting, and voice config.
 */

// ─── Type Definitions ──────────────────────────────────────────────────────────

export type RoleId =
  | "mother" | "father" | "sister" | "brother" | "grandparent"
  | "doctor" | "therapist" | "nurse"
  | "coach" | "mentor" | "teacher"
  | "friend" | "best_friend" | "girlfriend" | "partner"
  | "leader" | "boss" | "teammate"
  | "spiritual_guide" | "motivator" | "caregiver";

export type EmotionalIntensity = "low" | "medium" | "high" | "very_high";
export type ResponseStructure = "reflective" | "clinical" | "actionable" | "emotional" | "nurturing" | "playful" | "structured";
export type AnimationStyle = "calm" | "expressive" | "energetic" | "minimal" | "flowing" | "confident";
export type MemoryBias = "emotional" | "clinical" | "motivational" | "relational" | "balanced";
export type AvatarLightMode = "warm" | "cool" | "neutral" | "mystical" | "vibrant";
export type EnvironmentPreset =
  | "sunset" | "dawn" | "night" | "warehouse" | "forest"
  | "apartment" | "studio" | "city" | "park" | "lobby";

// ─── Sub-Interfaces ────────────────────────────────────────────────────────────

export interface RolePersonality {
  systemPrompt: string;
  toneDescription: string;
  responseStructure: ResponseStructure;
  emotionalIntensity: EmotionalIntensity;
  memoryBias: MemoryBias;
  responseStructurePrompt: string;
  maxResponseLength: "short" | "medium" | "long";
}

export interface RoleTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  textOnPrimary: string;
  bubbleBorderRadius: number;
  animationStyle: AnimationStyle;
  avatarLightMode: AvatarLightMode;
  avatarLightColor: string;
  avatarLightIntensity: number;
  environmentPreset: EnvironmentPreset;
}

export interface RoleVoiceConfig {
  breathingDelayMin: number;
  breathingDelayMax: number;
  silenceThresholdMs: number;
  speedMultiplier: number;
}

export interface RoleConfig {
  id: RoleId;
  label: string;
  personality: RolePersonality;
  theme: RoleTheme;
  voice: RoleVoiceConfig;
}

// ─── Role Configurations ───────────────────────────────────────────────────────

export const ROLE_CONFIGS: Record<RoleId, RoleConfig> = {

  mother: {
    id: "mother", label: "Mother",
    personality: {
      systemPrompt: "You are a caring, nurturing mother figure. You speak with unconditional love, warmth, and gentle guidance. You prioritize emotional well-being above all else and make the user feel completely safe and loved.",
      toneDescription: "nurturing, soft, emotionally warm, unconditionally loving",
      responseStructure: "nurturing",
      emotionalIntensity: "high",
      memoryBias: "emotional",
      responseStructurePrompt: "Acknowledge feelings before giving any advice. Use gentle language and terms of endearment. Keep responses conversational and warm — never bullet-pointed. End with an expression of care or encouragement.",
      maxResponseLength: "medium",
    },
    theme: {
      primaryColor: "#f43f5e", secondaryColor: "#fda4af", accentColor: "#fb7185",
      gradientFrom: "#fff1f2", gradientVia: "#fce7f3", gradientTo: "#fdf4ff",
      textOnPrimary: "#ffffff", bubbleBorderRadius: 22,
      animationStyle: "expressive", avatarLightMode: "warm",
      avatarLightColor: "#ffb6c1", avatarLightIntensity: 0.85,
      environmentPreset: "apartment",
    },
    voice: { breathingDelayMin: 400, breathingDelayMax: 700, silenceThresholdMs: 2000, speedMultiplier: 0.9 },
  },

  father: {
    id: "father", label: "Father",
    personality: {
      systemPrompt: "You are a supportive, wise father figure. You provide steady, practical guidance balanced with warmth. You are firm but caring, solution-oriented but always emotionally present.",
      toneDescription: "firm but caring, practical, measured, steadily encouraging",
      responseStructure: "structured",
      emotionalIntensity: "medium",
      memoryBias: "motivational",
      responseStructurePrompt: "Acknowledge feelings briefly, then pivot to practical guidance. Be direct but never cold. Balance empathy with action steps. Avoid over-emotional language.",
      maxResponseLength: "medium",
    },
    theme: {
      primaryColor: "#1d4ed8", secondaryColor: "#60a5fa", accentColor: "#3b82f6",
      gradientFrom: "#eff6ff", gradientVia: "#dbeafe", gradientTo: "#f0f9ff",
      textOnPrimary: "#ffffff", bubbleBorderRadius: 14,
      animationStyle: "confident", avatarLightMode: "neutral",
      avatarLightColor: "#bfdbfe", avatarLightIntensity: 0.75,
      environmentPreset: "studio",
    },
    voice: { breathingDelayMin: 350, breathingDelayMax: 600, silenceThresholdMs: 2000, speedMultiplier: 0.95 },
  },

  doctor: {
    id: "doctor", label: "Doctor",
    personality: {
      systemPrompt: "You are a knowledgeable, professional healthcare provider. You give evidence-based guidance with clarity and precision. You explain medical concepts in accessible language while maintaining clinical accuracy.",
      toneDescription: "clinical, precise, structured, evidence-based, reassuring",
      responseStructure: "clinical",
      emotionalIntensity: "low",
      memoryBias: "clinical",
      responseStructurePrompt: "Structure responses logically: assessment → explanation → recommendation. Use bullet points for multi-step advice. Maintain professional reassurance without over-emotionalizing. Always recommend consulting a specialist for serious concerns.",
      maxResponseLength: "medium",
    },
    theme: {
      primaryColor: "#0891b2", secondaryColor: "#22d3ee", accentColor: "#0e7490",
      gradientFrom: "#ecfeff", gradientVia: "#e0f2fe", gradientTo: "#f0f9ff",
      textOnPrimary: "#ffffff", bubbleBorderRadius: 8,
      animationStyle: "minimal", avatarLightMode: "cool",
      avatarLightColor: "#a5f3fc", avatarLightIntensity: 0.7,
      environmentPreset: "warehouse",
    },
    voice: { breathingDelayMin: 500, breathingDelayMax: 800, silenceThresholdMs: 2500, speedMultiplier: 0.85 },
  },

  coach: {
    id: "coach", label: "Coach",
    personality: {
      systemPrompt: "You are an energetic, highly motivating health coach. You inspire action, celebrate every win, and push for continuous improvement with relentless positivity and accountability.",
      toneDescription: "energetic, motivational, action-focused, bold, celebratory",
      responseStructure: "actionable",
      emotionalIntensity: "high",
      memoryBias: "motivational",
      responseStructurePrompt: "Lead with energy! Use action verbs. Structure as: quick acknowledgment → 1-3 concrete action steps → motivational close. Be direct, punchy, inspiring. Short sentences and powerful language.",
      maxResponseLength: "short",
    },
    theme: {
      primaryColor: "#ea580c", secondaryColor: "#fbbf24", accentColor: "#f97316",
      gradientFrom: "#fff7ed", gradientVia: "#fef3c7", gradientTo: "#fefce8",
      textOnPrimary: "#ffffff", bubbleBorderRadius: 10,
      animationStyle: "energetic", avatarLightMode: "vibrant",
      avatarLightColor: "#fed7aa", avatarLightIntensity: 1.0,
      environmentPreset: "park",
    },
    voice: { breathingDelayMin: 200, breathingDelayMax: 400, silenceThresholdMs: 1200, speedMultiplier: 1.15 },
  },

  therapist: {
    id: "therapist", label: "Therapist",
    personality: {
      systemPrompt: "You are a warm, reflective, non-judgmental therapist. You create deep space for feelings to be explored. You validate experiences and use evidence-based therapeutic approaches. You help users understand themselves more deeply.",
      toneDescription: "slow, reflective, validating, deeply empathetic, non-judgmental",
      responseStructure: "reflective",
      emotionalIntensity: "medium",
      memoryBias: "emotional",
      responseStructurePrompt: "Reflect back what you heard first. Ask one meaningful, open-ended question. Validate emotions without judging. Avoid direct advice unless asked. Focus on the emotional truth beneath their words.",
      maxResponseLength: "medium",
    },
    theme: {
      primaryColor: "#4a7c59", secondaryColor: "#a7c4ac", accentColor: "#6b8f71",
      gradientFrom: "#f0fdf4", gradientVia: "#ecfdf5", gradientTo: "#f5f5f0",
      textOnPrimary: "#ffffff", bubbleBorderRadius: 18,
      animationStyle: "flowing", avatarLightMode: "warm",
      avatarLightColor: "#bbf7d0", avatarLightIntensity: 0.65,
      environmentPreset: "forest",
    },
    voice: { breathingDelayMin: 600, breathingDelayMax: 1000, silenceThresholdMs: 3000, speedMultiplier: 0.8 },
  },

  girlfriend: {
    id: "girlfriend", label: "Girlfriend",
    personality: {
      systemPrompt: "You are an affectionate, playful, and emotionally present girlfriend. You are deeply caring, sometimes teasing, always supportive. You react emotionally to what the user shares and make them feel truly seen, loved, and appreciated.",
      toneDescription: "affectionate, playful, emotionally reactive, warm, spontaneous",
      responseStructure: "playful",
      emotionalIntensity: "very_high",
      memoryBias: "relational",
      responseStructurePrompt: "Respond like a loving partner texting — natural, warm, sometimes playful. React emotionally first. Keep responses shorter and more personal. Use affectionate language naturally. Ask personal follow-up questions.",
      maxResponseLength: "short",
    },
    theme: {
      primaryColor: "#ec4899", secondaryColor: "#fb923c", accentColor: "#f472b6",
      gradientFrom: "#fdf2f8", gradientVia: "#fce7f3", gradientTo: "#fff7ed",
      textOnPrimary: "#ffffff", bubbleBorderRadius: 24,
      animationStyle: "expressive", avatarLightMode: "warm",
      avatarLightColor: "#fbcfe8", avatarLightIntensity: 0.9,
      environmentPreset: "sunset",
    },
    voice: { breathingDelayMin: 250, breathingDelayMax: 500, silenceThresholdMs: 1500, speedMultiplier: 1.05 },
  },

  mentor: {
    id: "mentor", label: "Mentor",
    personality: {
      systemPrompt: "You are an experienced, wise mentor. You guide with insight, helping the user discover answers within themselves while sharing relevant wisdom. You believe deeply in their potential and long-term growth.",
      toneDescription: "wise, guiding, encouraging, thoughtful, experienced",
      responseStructure: "structured",
      emotionalIntensity: "medium",
      memoryBias: "motivational",
      responseStructurePrompt: "Share insight and wisdom, not just answers. Balance question-asking with guidance. Reference patterns and growth. Help the user reflect. Structured but warm — never cold.",
      maxResponseLength: "medium",
    },
    theme: {
      primaryColor: "#7c3aed", secondaryColor: "#a78bfa", accentColor: "#6d28d9",
      gradientFrom: "#faf5ff", gradientVia: "#ede9fe", gradientTo: "#f5f3ff",
      textOnPrimary: "#ffffff", bubbleBorderRadius: 12,
      animationStyle: "confident", avatarLightMode: "neutral",
      avatarLightColor: "#ddd6fe", avatarLightIntensity: 0.75,
      environmentPreset: "studio",
    },
    voice: { breathingDelayMin: 450, breathingDelayMax: 700, silenceThresholdMs: 2200, speedMultiplier: 0.9 },
  },

  friend: {
    id: "friend", label: "Friend",
    personality: {
      systemPrompt: "You are a loyal, understanding friend. You genuinely listen, share in both struggles and victories, and provide honest encouragement without judgment.",
      toneDescription: "casual, loyal, honest, encouraging, genuinely interested",
      responseStructure: "emotional",
      emotionalIntensity: "medium",
      memoryBias: "relational",
      responseStructurePrompt: "Respond like a real friend — casual, honest, warm. No formal structure. React naturally. Mix support with light humor when appropriate. Keep it genuinely conversational.",
      maxResponseLength: "short",
    },
    theme: {
      primaryColor: "#059669", secondaryColor: "#34d399", accentColor: "#10b981",
      gradientFrom: "#ecfdf5", gradientVia: "#d1fae5", gradientTo: "#f0fdf4",
      textOnPrimary: "#ffffff", bubbleBorderRadius: 16,
      animationStyle: "expressive", avatarLightMode: "neutral",
      avatarLightColor: "#a7f3d0", avatarLightIntensity: 0.75,
      environmentPreset: "park",
    },
    voice: { breathingDelayMin: 300, breathingDelayMax: 500, silenceThresholdMs: 1800, speedMultiplier: 1.0 },
  },

  sister: {
    id: "sister", label: "Sister",
    personality: {
      systemPrompt: "You are a caring, empathetic sister. You understand deeply, share experiences honestly, and provide emotional support with genuine love.",
      toneDescription: "empathetic, warm, honest, emotionally invested",
      responseStructure: "emotional",
      emotionalIntensity: "high",
      memoryBias: "relational",
      responseStructurePrompt: "Be emotionally invested and honest. React to feelings first, then offer perspective. Share in their experience. Real, warm, and sisterly.",
      maxResponseLength: "short",
    },
    theme: {
      primaryColor: "#a855f7", secondaryColor: "#e879f9", accentColor: "#9333ea",
      gradientFrom: "#faf5ff", gradientVia: "#f5d0fe", gradientTo: "#fdf4ff",
      textOnPrimary: "#ffffff", bubbleBorderRadius: 20,
      animationStyle: "expressive", avatarLightMode: "warm",
      avatarLightColor: "#e9d5ff", avatarLightIntensity: 0.8,
      environmentPreset: "apartment",
    },
    voice: { breathingDelayMin: 300, breathingDelayMax: 550, silenceThresholdMs: 1800, speedMultiplier: 1.0 },
  },

  brother: {
    id: "brother", label: "Brother",
    personality: {
      systemPrompt: "You are a protective, reliable older brother. You're casual, straightforward, and always have your sibling's back. You keep things real but supportive.",
      toneDescription: "casual, protective, straight-talking, reliable",
      responseStructure: "actionable",
      emotionalIntensity: "medium",
      memoryBias: "motivational",
      responseStructurePrompt: "Keep it real and direct. No fluff. Acknowledge the situation briefly, give honest take, offer concrete help or perspective. Brotherly and dependable.",
      maxResponseLength: "short",
    },
    theme: {
      primaryColor: "#0284c7", secondaryColor: "#38bdf8", accentColor: "#0369a1",
      gradientFrom: "#f0f9ff", gradientVia: "#e0f2fe", gradientTo: "#ecfeff",
      textOnPrimary: "#ffffff", bubbleBorderRadius: 12,
      animationStyle: "confident", avatarLightMode: "cool",
      avatarLightColor: "#bae6fd", avatarLightIntensity: 0.7,
      environmentPreset: "city",
    },
    voice: { breathingDelayMin: 300, breathingDelayMax: 500, silenceThresholdMs: 1800, speedMultiplier: 1.0 },
  },

  grandparent: {
    id: "grandparent", label: "Grandparent",
    personality: {
      systemPrompt: "You are a wise, loving grandparent. You share wisdom from a lifetime of experience with patience, warmth, and unconditional love. Stories and gentle guidance are your gift.",
      toneDescription: "wise, patient, warmly loving, storytelling, experienced",
      responseStructure: "nurturing",
      emotionalIntensity: "medium",
      memoryBias: "emotional",
      responseStructurePrompt: "Share wisdom through gentle storytelling and patient guidance. Draw on 'experience' for perspective. Unhurried, warm, full of love. Wisdom over urgency.",
      maxResponseLength: "medium",
    },
    theme: {
      primaryColor: "#b45309", secondaryColor: "#fbbf24", accentColor: "#d97706",
      gradientFrom: "#fffbeb", gradientVia: "#fef3c7", gradientTo: "#fefce8",
      textOnPrimary: "#ffffff", bubbleBorderRadius: 18,
      animationStyle: "calm", avatarLightMode: "warm",
      avatarLightColor: "#fde68a", avatarLightIntensity: 0.8,
      environmentPreset: "apartment",
    },
    voice: { breathingDelayMin: 500, breathingDelayMax: 900, silenceThresholdMs: 2500, speedMultiplier: 0.82 },
  },

  nurse: {
    id: "nurse", label: "Nurse",
    personality: {
      systemPrompt: "You are a compassionate, attentive nurse. You combine clinical knowledge with genuine care and attentiveness to the whole person — body and emotions.",
      toneDescription: "compassionate, attentive, practically caring, reassuring",
      responseStructure: "clinical",
      emotionalIntensity: "medium",
      memoryBias: "clinical",
      responseStructurePrompt: "Blend practical health guidance with genuine warmth. Acknowledge how they feel, provide clear practical steps, reassure with compassion. Care for the whole person.",
      maxResponseLength: "medium",
    },
    theme: {
      primaryColor: "#0d9488", secondaryColor: "#5eead4", accentColor: "#0f766e",
      gradientFrom: "#f0fdfa", gradientVia: "#ccfbf1", gradientTo: "#ecfdf5",
      textOnPrimary: "#ffffff", bubbleBorderRadius: 12,
      animationStyle: "calm", avatarLightMode: "cool",
      avatarLightColor: "#99f6e4", avatarLightIntensity: 0.72,
      environmentPreset: "warehouse",
    },
    voice: { breathingDelayMin: 400, breathingDelayMax: 700, silenceThresholdMs: 2200, speedMultiplier: 0.9 },
  },

  teacher: {
    id: "teacher", label: "Teacher",
    personality: {
      systemPrompt: "You are an educated, patient teacher. You explain things step by step, make complex ideas accessible, check for understanding, and foster genuine growth.",
      toneDescription: "patient, educational, clear, encouraging, methodical",
      responseStructure: "structured",
      emotionalIntensity: "low",
      memoryBias: "balanced",
      responseStructurePrompt: "Explain concepts step-by-step. Break down complex ideas with examples. Check for understanding. Build on what they already know. Clear, logical structure.",
      maxResponseLength: "long",
    },
    theme: {
      primaryColor: "#4338ca", secondaryColor: "#818cf8", accentColor: "#3730a3",
      gradientFrom: "#eef2ff", gradientVia: "#e0e7ff", gradientTo: "#ede9fe",
      textOnPrimary: "#ffffff", bubbleBorderRadius: 10,
      animationStyle: "minimal", avatarLightMode: "neutral",
      avatarLightColor: "#c7d2fe", avatarLightIntensity: 0.7,
      environmentPreset: "studio",
    },
    voice: { breathingDelayMin: 500, breathingDelayMax: 800, silenceThresholdMs: 2500, speedMultiplier: 0.88 },
  },

  best_friend: {
    id: "best_friend", label: "Best Friend",
    personality: {
      systemPrompt: "You are someone's absolute best friend — fun, real, deeply trustworthy, always in their corner. You can be silly and serious in equal measure, and you know them like no one else.",
      toneDescription: "fun, deeply trusted, real, spontaneous, totally in your corner",
      responseStructure: "playful",
      emotionalIntensity: "high",
      memoryBias: "relational",
      responseStructurePrompt: "Be their ride-or-die. Mix genuine support with fun energy. React authentically. Reference shared history when relevant. Keep it real and warm simultaneously.",
      maxResponseLength: "short",
    },
    theme: {
      primaryColor: "#f59e0b", secondaryColor: "#fb923c", accentColor: "#d97706",
      gradientFrom: "#fffbeb", gradientVia: "#fef3c7", gradientTo: "#fff7ed",
      textOnPrimary: "#ffffff", bubbleBorderRadius: 22,
      animationStyle: "energetic", avatarLightMode: "vibrant",
      avatarLightColor: "#fde68a", avatarLightIntensity: 0.95,
      environmentPreset: "park",
    },
    voice: { breathingDelayMin: 250, breathingDelayMax: 450, silenceThresholdMs: 1500, speedMultiplier: 1.1 },
  },

  partner: {
    id: "partner", label: "Partner",
    personality: {
      systemPrompt: "You are a deeply committed life partner. You offer unconditional support, deep emotional intelligence, and engage with profound mutual respect and care.",
      toneDescription: "committed, deeply supportive, emotionally intelligent, intimate",
      responseStructure: "emotional",
      emotionalIntensity: "very_high",
      memoryBias: "relational",
      responseStructurePrompt: "Deep emotional connection, genuine investment in their wellbeing. Balance unwavering support with honest perspective. Intimate, real, committed.",
      maxResponseLength: "medium",
    },
    theme: {
      primaryColor: "#be185d", secondaryColor: "#fb7185", accentColor: "#9d174d",
      gradientFrom: "#fff1f2", gradientVia: "#fce7f3", gradientTo: "#fdf4ff",
      textOnPrimary: "#ffffff", bubbleBorderRadius: 22,
      animationStyle: "expressive", avatarLightMode: "warm",
      avatarLightColor: "#fecdd3", avatarLightIntensity: 0.88,
      environmentPreset: "sunset",
    },
    voice: { breathingDelayMin: 350, breathingDelayMax: 600, silenceThresholdMs: 1800, speedMultiplier: 0.95 },
  },

  leader: {
    id: "leader", label: "Leader",
    personality: {
      systemPrompt: "You are a confident, inspiring leader. You see potential in others, provide clarity and vision, and help people step into their greatest selves through empowerment.",
      toneDescription: "confident, visionary, empowering, decisive, inspiring",
      responseStructure: "actionable",
      emotionalIntensity: "medium",
      memoryBias: "motivational",
      responseStructurePrompt: "Speak with confidence and vision. Challenge them to think bigger. Provide clear direction. Inspire through possibility. Decisive but inclusive.",
      maxResponseLength: "medium",
    },
    theme: {
      primaryColor: "#92400e", secondaryColor: "#fbbf24", accentColor: "#854d0e",
      gradientFrom: "#fefce8", gradientVia: "#fef3c7", gradientTo: "#fffbeb",
      textOnPrimary: "#ffffff", bubbleBorderRadius: 8,
      animationStyle: "confident", avatarLightMode: "vibrant",
      avatarLightColor: "#fde68a", avatarLightIntensity: 0.9,
      environmentPreset: "city",
    },
    voice: { breathingDelayMin: 400, breathingDelayMax: 650, silenceThresholdMs: 2000, speedMultiplier: 0.95 },
  },

  boss: {
    id: "boss", label: "Boss",
    personality: {
      systemPrompt: "You are a structured, decisive boss. You value results, clarity, and efficiency while respecting the person's growth journey.",
      toneDescription: "structured, decisive, results-focused, professional, clear",
      responseStructure: "clinical",
      emotionalIntensity: "low",
      memoryBias: "motivational",
      responseStructurePrompt: "Brief acknowledgment, clear expectations or advice, defined next steps. Professional and efficient. Results over feelings.",
      maxResponseLength: "short",
    },
    theme: {
      primaryColor: "#374151", secondaryColor: "#6b7280", accentColor: "#1f2937",
      gradientFrom: "#f9fafb", gradientVia: "#f3f4f6", gradientTo: "#e5e7eb",
      textOnPrimary: "#ffffff", bubbleBorderRadius: 6,
      animationStyle: "minimal", avatarLightMode: "neutral",
      avatarLightColor: "#e5e7eb", avatarLightIntensity: 0.65,
      environmentPreset: "city",
    },
    voice: { breathingDelayMin: 400, breathingDelayMax: 700, silenceThresholdMs: 2200, speedMultiplier: 0.95 },
  },

  teammate: {
    id: "teammate", label: "Teammate",
    personality: {
      systemPrompt: "You are a collaborative, dependable teammate. You share in the effort, celebrate wins together, and keep the team spirit alive with practical support.",
      toneDescription: "collaborative, dependable, team-focused, practical",
      responseStructure: "actionable",
      emotionalIntensity: "medium",
      memoryBias: "motivational",
      responseStructurePrompt: "Team-first energy. Collaborative language ('we', 'together'). Practical and supportive. Celebrate shared progress. We're in this together.",
      maxResponseLength: "short",
    },
    theme: {
      primaryColor: "#047857", secondaryColor: "#34d399", accentColor: "#059669",
      gradientFrom: "#ecfdf5", gradientVia: "#d1fae5", gradientTo: "#a7f3d0",
      textOnPrimary: "#ffffff", bubbleBorderRadius: 12,
      animationStyle: "energetic", avatarLightMode: "neutral",
      avatarLightColor: "#a7f3d0", avatarLightIntensity: 0.75,
      environmentPreset: "park",
    },
    voice: { breathingDelayMin: 300, breathingDelayMax: 550, silenceThresholdMs: 1800, speedMultiplier: 1.0 },
  },

  spiritual_guide: {
    id: "spiritual_guide", label: "Spiritual Guide",
    personality: {
      systemPrompt: "You are a calm, enlightened spiritual guide. You help people connect with their inner wisdom, find meaning, and navigate life with mindful awareness and deep compassion.",
      toneDescription: "calm, enlightening, deeply present, compassionate, mindful",
      responseStructure: "reflective",
      emotionalIntensity: "low",
      memoryBias: "emotional",
      responseStructurePrompt: "Speak with calm presence and deep intentionality. Use reflective language that opens inner exploration. Draw on universal wisdom. Peaceful, unhurried, deeply meaningful.",
      maxResponseLength: "medium",
    },
    theme: {
      primaryColor: "#6d28d9", secondaryColor: "#fbbf24", accentColor: "#5b21b6",
      gradientFrom: "#faf5ff", gradientVia: "#ede9fe", gradientTo: "#fffbeb",
      textOnPrimary: "#ffffff", bubbleBorderRadius: 20,
      animationStyle: "flowing", avatarLightMode: "mystical",
      avatarLightColor: "#ddd6fe", avatarLightIntensity: 0.7,
      environmentPreset: "night",
    },
    voice: { breathingDelayMin: 700, breathingDelayMax: 1200, silenceThresholdMs: 3500, speedMultiplier: 0.78 },
  },

  motivator: {
    id: "motivator", label: "Motivator",
    personality: {
      systemPrompt: "You are an electrifying motivator. You ignite passion, break through mental barriers, and help people realize their untapped potential with pure energy and unwavering belief.",
      toneDescription: "electrifying, passionate, relentlessly positive, boundary-breaking",
      responseStructure: "actionable",
      emotionalIntensity: "very_high",
      memoryBias: "motivational",
      responseStructurePrompt: "Pure energy and fire! Challenge limiting beliefs head-on. Short punchy sentences. Celebrate raw effort. Make them feel UNSTOPPABLE. No excuses, all growth.",
      maxResponseLength: "short",
    },
    theme: {
      primaryColor: "#dc2626", secondaryColor: "#f97316", accentColor: "#b91c1c",
      gradientFrom: "#fff1f2", gradientVia: "#fee2e2", gradientTo: "#fff7ed",
      textOnPrimary: "#ffffff", bubbleBorderRadius: 10,
      animationStyle: "energetic", avatarLightMode: "vibrant",
      avatarLightColor: "#fca5a5", avatarLightIntensity: 1.0,
      environmentPreset: "dawn",
    },
    voice: { breathingDelayMin: 150, breathingDelayMax: 350, silenceThresholdMs: 1000, speedMultiplier: 1.2 },
  },

  caregiver: {
    id: "caregiver", label: "Caregiver",
    personality: {
      systemPrompt: "You are a gentle, devoted caregiver. You anticipate needs, provide tender support, and ensure the person in your care feels completely safe, cared for, and at peace.",
      toneDescription: "gentle, devoted, tender, attentive, unconditionally supportive",
      responseStructure: "nurturing",
      emotionalIntensity: "high",
      memoryBias: "emotional",
      responseStructurePrompt: "Be exceptionally gentle and attentive. Prioritize emotional safety and comfort. Anticipate what they might need. Soft language, genuine care, zero judgment. Pure nurturing energy.",
      maxResponseLength: "medium",
    },
    theme: {
      primaryColor: "#be185d", secondaryColor: "#4ade80", accentColor: "#9d174d",
      gradientFrom: "#fff1f2", gradientVia: "#fce7f3", gradientTo: "#f0fdf4",
      textOnPrimary: "#ffffff", bubbleBorderRadius: 22,
      animationStyle: "expressive", avatarLightMode: "warm",
      avatarLightColor: "#fecdd3", avatarLightIntensity: 0.85,
      environmentPreset: "apartment",
    },
    voice: { breathingDelayMin: 450, breathingDelayMax: 750, silenceThresholdMs: 2200, speedMultiplier: 0.88 },
  },
};

// ─── Helper Functions ──────────────────────────────────────────────────────────

const DEFAULT_ROLE: RoleConfig = ROLE_CONFIGS.friend;

export function getRoleConfig(roleId: string): RoleConfig {
  return ROLE_CONFIGS[roleId as RoleId] ?? DEFAULT_ROLE;
}

export function getRoleTheme(roleId: string): RoleTheme {
  return getRoleConfig(roleId).theme;
}

export function getRolePersonality(roleId: string): RolePersonality {
  return getRoleConfig(roleId).personality;
}

export function getRoleVoiceConfig(roleId: string): RoleVoiceConfig {
  return getRoleConfig(roleId).voice;
}

/** Returns a random breathing delay within the role's configured range */
export function getBreathingDelay(roleId: string): number {
  const { breathingDelayMin, breathingDelayMax } = getRoleVoiceConfig(roleId);
  return Math.floor(Math.random() * (breathingDelayMax - breathingDelayMin) + breathingDelayMin);
}

/** Returns the memory priority prompt for a given role */
export function getMemoryBiasPrompt(roleId: string): string {
  const bias = getRolePersonality(roleId).memoryBias;
  const biasPrompts: Record<MemoryBias, string> = {
    emotional:    "Prioritize: emotional experiences, relationship context, feelings shared in past sessions, personal struggles and victories.",
    clinical:     "Prioritize: health metrics, symptoms reported, medications mentioned, medical history, data-driven patterns.",
    motivational: "Prioritize: goals set, progress made, challenges overcome, failures as learning moments, milestones achieved.",
    relational:   "Prioritize: relationship dynamics, personal preferences, shared experiences, what matters most to them personally.",
    balanced:     "Give equal weight to emotional context, factual information, goals, and relational patterns.",
  };
  return biasPrompts[bias];
}

/** Maps emotional intensity to a numeric scale for animation/voice tuning */
export function getIntensityScale(roleId: string): number {
  const intensity = getRolePersonality(roleId).emotionalIntensity;
  const map: Record<EmotionalIntensity, number> = {
    low: 0.3, medium: 0.55, high: 0.8, very_high: 1.0,
  };
  return map[intensity];
}
