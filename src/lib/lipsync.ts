/**
 * Emotion-Driven Lipsync + Animation Engine
 * Integrates with EmotionStateMachine for nuanced avatar behavior
 */

import { selectEmotionDrivenAnimation, calculateEmotionIntensity } from "@/lib/emotion";

export interface MouthCue {
  start: number;
  end: number;
  value: string; // Viseme code (A-H, X)
}

export interface LipsyncData {
  mouthCues: MouthCue[];
}

/**
 * Generate lipsync data from text with emotion-aware timing
 */
export function generateLipsync(text: string, duration: number = 3): LipsyncData {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const mouthCues: MouthCue[] = [];

  if (words.length === 0) return { mouthCues: [] };

  // Adjust timing based on sentence structure
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const pauseRatio = Math.min(0.15, (sentences.length * 0.04)); // pauses between sentences
  const speechDuration = duration * (1 - pauseRatio);
  const timePerWord = speechDuration / words.length;

  let currentTime = 0;

  words.forEach((word, wordIdx) => {
    const phonemes = wordToPhonemes(word.toLowerCase());
    const timePerPhoneme = timePerWord / phonemes.length;

    phonemes.forEach((phoneme) => {
      mouthCues.push({
        start: currentTime,
        end: currentTime + timePerPhoneme,
        value: phoneme,
      });
      currentTime += timePerPhoneme;
    });

    // Add brief pause after sentence-ending punctuation
    if (word.match(/[.!?]$/)) {
      currentTime += timePerWord * 0.5;
    }
  });

  return { mouthCues };
}

/**
 * Convert word to phoneme visemes with improved mapping
 */
function wordToPhonemes(word: string): string[] {
  const phonemes: string[] = [];
  const clean = word.replace(/[^a-z]/g, "");

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const nextChar = clean[i + 1] || "";

    // Digraphs first
    if (char === "t" && nextChar === "h") {
      phonemes.push("H"); i++; continue; // TH
    }
    if (char === "s" && nextChar === "h") {
      phonemes.push("H"); i++; continue; // SH → TH viseme approximation
    }
    if (char === "c" && nextChar === "h") {
      phonemes.push("B"); i++; continue; // CH
    }

    // Vowels
    if (char === "a") { phonemes.push("D"); continue; }
    if (char === "e") { phonemes.push("C"); continue; }
    if (char === "i") { phonemes.push("C"); continue; }
    if (char === "o") { phonemes.push("E"); continue; }
    if (char === "u") { phonemes.push("F"); continue; }

    // Bilabials
    if ("pbm".includes(char)) { phonemes.push("A"); continue; }

    // Labiodentals
    if ("fv".includes(char)) { phonemes.push("G"); continue; }

    // Alveolars
    if ("tdnl".includes(char)) { phonemes.push("B"); continue; }

    // Sibilants
    if ("sz".includes(char)) { phonemes.push("H"); continue; }

    // Velars / other
    if ("kgqx".includes(char)) { phonemes.push("B"); continue; }

    // Approximants
    if ("rwy".includes(char)) { phonemes.push("C"); continue; }

    // Default
    phonemes.push("X");
  }

  return phonemes.length > 0 ? phonemes : ["X"];
}

/**
 * Emotion-driven animation selection (replaces basic keyword matching)
 */
export function selectAnimation(text: string): string {
  const result = selectEmotionDrivenAnimation(text);
  return result.animation;
}

/**
 * Emotion-driven facial expression selection
 */
export function selectFacialExpression(text: string): string {
  const result = selectEmotionDrivenAnimation(text);
  return result.facialExpression;
}

/**
 * Full emotion metadata for animation engine
 */
export function selectAnimationWithEmotion(text: string): {
  animation: string;
  facialExpression: string;
  emotionState: string;
  intensity: number;
} {
  return selectEmotionDrivenAnimation(text);
}

/**
 * Estimate audio duration from text
 * Accounts for punctuation pauses and speaking rate
 */
export function estimateAudioDuration(text: string): number {
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const commas = (text.match(/,/g) || []).length;

  // Base: 2.5 words/sec + pause overhead
  const baseTime = wordCount / 2.5;
  const pauseTime = sentences * 0.3 + commas * 0.1;

  return Math.max(baseTime + pauseTime, 1);
}
