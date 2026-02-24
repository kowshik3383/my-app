/**
 * Emotion-Driven Animation Engine
 * Maps conversational signals → avatar behavior with blending, smoothing, and state machine
 */

import type { EmotionLabel } from "@/types/memory";

export type EmotionState = EmotionLabel;

// ─── Signal Analysis ───────────────────────────────────────────────────────────
export interface EmotionSignals {
  valence: number;       // -1 to 1 (negative to positive)
  arousal: number;       // 0 to 1 (calm to excited)
  uncertainty: number;   // 0 to 1
  empathyScore: number;  // 0 to 1
  encourageScore: number;// 0 to 1
  speakingSpeed: number; // 0 to 1 (slow to fast)
  pauseScore: number;    // 0 to 1 (many pauses → thinking)
}

export interface AnimationBlend {
  primary: { animation: string; weight: number };
  secondary?: { animation: string; weight: number };
  expression: string;
  expressionIntensity: number;  // 0 to 1
  energyLevel: number;          // 0 to 1
  emotionState: EmotionState;
}

// ─── Keyword Dictionaries ──────────────────────────────────────────────────────
const POSITIVE_KEYWORDS = new Set([
  "great","excellent","wonderful","amazing","congratulations","proud","happy",
  "excited","love","celebrate","win","success","achieved","progress","better",
  "good","fantastic","awesome","joy","grateful","thankful","glad","smile","hope",
]);

const NEGATIVE_KEYWORDS = new Set([
  "sad","sorry","unfortunately","concern","worry","afraid","scared","anxious",
  "stressed","difficult","hard","struggling","pain","hurt","fail","lost","cry",
  "depressed","hopeless","tired","exhausted","frustrated","angry","upset","bad",
]);

const UNCERTAIN_KEYWORDS = new Set([
  "maybe","perhaps","possibly","might","could","unsure","not sure","i think",
  "probably","guess","wonder","unclear","confusing","confused","doubt",
]);

const EMPATHY_KEYWORDS = new Set([
  "understand","i know","that must","feel","listen","hear you","with you",
  "support","here for you","not alone","believe","care","compassion",
]);

const ENCOURAGE_KEYWORDS = new Set([
  "you can","keep going","don't give up","believe in you","strong","capable",
  "push","try","effort","step","progress","almost","nearly","great job",
]);

const THINKING_PUNCTUATION = /[\.]{2,}|—|\.\.\./g;

// ─── Signal Analyzer ──────────────────────────────────────────────────────────
export function analyzeEmotionSignals(text: string): EmotionSignals {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  const wordCount = Math.max(words.length, 1);

  // Valence: count positive vs negative keywords
  let positiveCount = 0;
  let negativeCount = 0;
  let uncertainCount = 0;
  let empathyCount = 0;
  let encourageCount = 0;

  words.forEach((w) => {
    const cleaned = w.replace(/[^a-z]/g, "");
    if (POSITIVE_KEYWORDS.has(cleaned)) positiveCount++;
    if (NEGATIVE_KEYWORDS.has(cleaned)) negativeCount++;
    if (UNCERTAIN_KEYWORDS.has(cleaned)) uncertainCount++;
    if (EMPATHY_KEYWORDS.has(cleaned)) empathyCount++;
    if (ENCOURAGE_KEYWORDS.has(cleaned)) encourageCount++;
  });

  // Check bigrams for empathy/encourage phrases
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    if (EMPATHY_KEYWORDS.has(bigram)) empathyCount++;
    if (ENCOURAGE_KEYWORDS.has(bigram)) encourageCount++;
  }

  const valence = Math.max(-1, Math.min(1,
    (positiveCount - negativeCount) / (wordCount * 0.15)
  ));

  // Arousal: exclamation marks, caps ratio, encouraging keywords
  const exclamations = (text.match(/!/g) || []).length;
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  const arousal = Math.min(1, (exclamations * 0.15) + (capsRatio * 2) + (encourageCount / wordCount * 3));

  // Speaking speed estimate: shorter words + fewer commas = faster
  const avgWordLen = words.reduce((s, w) => s + w.length, 0) / wordCount;
  const commaCount = (text.match(/,/g) || []).length;
  const speakingSpeed = Math.min(1, Math.max(0, 1 - (avgWordLen / 8) - (commaCount / wordCount)));

  // Pauses: ellipsis, dashes, multiple periods
  const pauseMatches = (text.match(THINKING_PUNCTUATION) || []).length;
  const pauseScore = Math.min(1, pauseMatches * 0.25);

  return {
    valence: Math.max(-1, Math.min(1, valence)),
    arousal: Math.max(0, Math.min(1, arousal)),
    uncertainty: Math.min(1, uncertainCount / wordCount * 5),
    empathyScore: Math.min(1, empathyCount / wordCount * 8),
    encourageScore: Math.min(1, encourageCount / wordCount * 8),
    speakingSpeed: Math.max(0, Math.min(1, speakingSpeed)),
    pauseScore: Math.max(0, Math.min(1, pauseScore)),
  };
}

// ─── Emotion State Machine ─────────────────────────────────────────────────────
export class EmotionStateMachine {
  currentState: EmotionState = "neutral";
  previousState: EmotionState = "neutral";
  private stateHistory: EmotionState[] = [];
  private smoothFactor = 0.3; // inertia, higher = slower transitions

  /** Determine next emotion state from signals */
  transition(signals: EmotionSignals): EmotionState {
    let nextState: EmotionState;

    // Priority order: specific signals first
    if (signals.pauseScore > 0.5 && signals.arousal < 0.3) {
      nextState = "thinking";
    } else if (signals.empathyScore > 0.4) {
      nextState = "empathetic";
    } else if (signals.encourageScore > 0.4 && signals.valence > 0.2) {
      nextState = "encouraging";
    } else if (signals.uncertainty > 0.5) {
      nextState = "anxious";
    } else if (signals.valence > 0.5 && signals.arousal > 0.5) {
      nextState = "excited";
    } else if (signals.valence > 0.3) {
      nextState = "happy";
    } else if (signals.valence < -0.5 && signals.arousal > 0.5) {
      nextState = "frustrated";
    } else if (signals.valence < -0.3) {
      nextState = "sad";
    } else {
      nextState = "neutral";
    }

    this.previousState = this.currentState;
    this.currentState = nextState;
    this.stateHistory = [...this.stateHistory.slice(-9), nextState];
    return nextState;
  }

  /** Analyze text and update state in one call */
  analyzeAndTransition(text: string): EmotionState {
    const signals = analyzeEmotionSignals(text);
    return this.transition(signals);
  }

  /** Get animation blend config for current state */
  getAnimationBlend(intensity: number = 1.0): AnimationBlend {
    const blends: Record<EmotionState, AnimationBlend> = {
      excited: {
        primary: { animation: "Rumba Dancing", weight: 0.75 },
        secondary: { animation: "Talking_2", weight: 0.25 },
        expression: "smile",
        expressionIntensity: 0.95 * intensity,
        energyLevel: 0.9,
        emotionState: "excited",
      },
      happy: {
        primary: { animation: "Talking_0", weight: 0.8 },
        secondary: { animation: "Talking_2", weight: 0.2 },
        expression: "smile",
        expressionIntensity: 0.7 * intensity,
        energyLevel: 0.65,
        emotionState: "happy",
      },
      sad: {
        primary: { animation: "Crying", weight: 0.5 },
        secondary: { animation: "Talking_1", weight: 0.5 },
        expression: "sad",
        expressionIntensity: 0.75 * intensity,
        energyLevel: 0.25,
        emotionState: "sad",
      },
      frustrated: {
        primary: { animation: "Angry", weight: 0.65 },
        secondary: { animation: "Talking_1", weight: 0.35 },
        expression: "angry",
        expressionIntensity: 0.7 * intensity,
        energyLevel: 0.7,
        emotionState: "frustrated",
      },
      anxious: {
        primary: { animation: "Terrified", weight: 0.4 },
        secondary: { animation: "Talking_0", weight: 0.6 },
        expression: "surprised",
        expressionIntensity: 0.55 * intensity,
        energyLevel: 0.5,
        emotionState: "anxious",
      },
      empathetic: {
        primary: { animation: "Talking_1", weight: 0.85 },
        expression: "sad",
        expressionIntensity: 0.4 * intensity,
        energyLevel: 0.4,
        emotionState: "empathetic",
      },
      encouraging: {
        primary: { animation: "Talking_2", weight: 0.8 },
        expression: "smile",
        expressionIntensity: 0.65 * intensity,
        energyLevel: 0.7,
        emotionState: "encouraging",
      },
      thinking: {
        primary: { animation: "Standing Idle", weight: 0.9 },
        expression: "default",
        expressionIntensity: 0.2 * intensity,
        energyLevel: 0.2,
        emotionState: "thinking",
      },
      neutral: {
        primary: { animation: "Talking_0", weight: 0.8 },
        secondary: { animation: "Talking_1", weight: 0.2 },
        expression: "smile",
        expressionIntensity: 0.3 * intensity,
        energyLevel: 0.45,
        emotionState: "neutral",
      },
    };

    return blends[this.currentState];
  }

  /** Compute sentiment score from text (-1 to 1) */
  getSentimentScore(text: string): number {
    const signals = analyzeEmotionSignals(text);
    return signals.valence;
  }

  /** Get dominant pattern from history */
  getDominantPattern(): EmotionState {
    const counts: Partial<Record<EmotionState, number>> = {};
    this.stateHistory.forEach((s) => {
      counts[s] = (counts[s] || 0) + 1;
    });
    return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as EmotionState) || "neutral";
  }

  reset() {
    this.currentState = "neutral";
    this.previousState = "neutral";
    this.stateHistory = [];
  }
}

// Singleton for server-side use
export const globalEmotionEngine = new EmotionStateMachine();

// ─── Intensity Calculator ──────────────────────────────────────────────────────
export function calculateEmotionIntensity(text: string): number {
  const signals = analyzeEmotionSignals(text);
  const valenceStrength = Math.abs(signals.valence);
  const arousalContrib = signals.arousal * 0.4;
  return Math.min(1, valenceStrength * 0.6 + arousalContrib);
}

// ─── Select animation (enhanced, emotion-aware) ──────────────────────────────
export function selectEmotionDrivenAnimation(text: string): {
  animation: string;
  facialExpression: string;
  emotionState: EmotionState;
  intensity: number;
} {
  const engine = new EmotionStateMachine();
  const state = engine.analyzeAndTransition(text);
  const intensity = calculateEmotionIntensity(text);
  const blend = engine.getAnimationBlend(intensity);

  return {
    animation: blend.primary.animation,
    facialExpression: blend.expression,
    emotionState: state,
    intensity,
  };
}
