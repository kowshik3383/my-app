// Lipsync generator + emotion tag utilities

interface MouthCue {
  start: number;
  end: number;
  value: string; // Viseme code (A-H, X)
}

interface LipsyncData {
  mouthCues: MouthCue[];
}

// ─── Emotion Tag Utilities ────────────────────────────────────────────────────

const EMOTION_TAG_REGEX = /\[(happy|sadly|playfully|angrily|whispers|giggles|sarcastically)\]/gi;

/** Extract all emotion tags from text, returns lowercase tag names */
export function extractEmotionTags(text: string): string[] {
  const matches = text.match(EMOTION_TAG_REGEX) || [];
  return matches.map((m) => m.replace(/[\[\]]/g, "").toLowerCase());
}

/** Remove all emotion tags from text */
export function stripEmotionTags(text: string): string {
  return text.replace(EMOTION_TAG_REGEX, "").replace(/\s{2,}/g, " ").trim();
}

// ─── Emotion → Avatar Mapping ─────────────────────────────────────────────────

const emotionToAnimation: Record<string, string> = {
  happy: "Talking_1",
  sadly: "Crying",
  playfully: "Rumba Dancing",
  angrily: "Angry",
  whispers: "Talking_0",
  giggles: "Laughing",
  sarcastically: "Talking_2",
};

const emotionToFacialExpression: Record<string, string> = {
  happy: "smile",
  sadly: "sad",
  playfully: "smile",
  angrily: "angry",
  whispers: "default",
  giggles: "funnyFace",
  sarcastically: "funnyFace",
};

function randomTalkingAnimation(): string {
  const opts = ["Talking_0", "Talking_1", "Talking_2"];
  return opts[Math.floor(Math.random() * opts.length)];
}

// ─── Lipsync Generation ───────────────────────────────────────────────────────

export function generateLipsync(text: string, duration: number = 3): LipsyncData {
  const cleanText = stripEmotionTags(text);
  const words = cleanText.split(/\s+/).filter((w) => w.length > 0);
  const mouthCues: MouthCue[] = [];

  if (words.length === 0) return { mouthCues: [] };

  const timePerWord = duration / words.length;
  let currentTime = 0;

  words.forEach((word) => {
    const phonemes = wordToPhonemes(word.toLowerCase());
    const timePerPhoneme = timePerWord / phonemes.length;
    phonemes.forEach((phoneme) => {
      mouthCues.push({ start: currentTime, end: currentTime + timePerPhoneme, value: phoneme });
      currentTime += timePerPhoneme;
    });
  });

  return { mouthCues };
}

function wordToPhonemes(word: string): string[] {
  const phonemes: string[] = [];
  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const nextChar = word[i + 1] || "";
    if ("aeiou".includes(char)) {
      if (char === "a") phonemes.push("D");
      else if (char === "e" || char === "i") phonemes.push("C");
      else if (char === "o") phonemes.push("E");
      else if (char === "u") phonemes.push("F");
    } else if (char === "p" || char === "b" || char === "m") {
      phonemes.push("A");
    } else if (char === "f" || char === "v") {
      phonemes.push("G");
    } else if (char === "t" || char === "d" || char === "n" || char === "l") {
      phonemes.push("B");
    } else if (char === "s" || char === "z") {
      phonemes.push("H");
    } else if (char === "t" && nextChar === "h") {
      phonemes.push("H");
      i++;
    } else {
      phonemes.push("X");
    }
  }
  return phonemes.length > 0 ? phonemes : ["X"];
}

// ─── Animation & Expression Selection ────────────────────────────────────────

/** Select avatar animation based on emotion tags (primary) or text keywords (fallback) */
export function selectAnimation(text: string): string {
  const emotions = extractEmotionTags(text);
  const primary = emotions[0];

  if (primary && emotionToAnimation[primary]) {
    return emotionToAnimation[primary];
  }

  // Keyword fallback
  const lower = text.toLowerCase();
  if (lower.includes("congratulations") || lower.includes("great job") || lower.includes("excellent")) return "Rumba Dancing";
  if (lower.includes("sorry") || lower.includes("unfortunately") || lower.includes("concerned")) return "Crying";
  if (lower.includes("angry") || lower.includes("frustrated") || lower.includes("serious")) return "Angry";
  if (lower.includes("haha") || lower.includes("funny") || lower.includes("amusing")) return "Laughing";
  if (lower.includes("scary") || lower.includes("worried") || lower.includes("afraid")) return "Terrified";

  return randomTalkingAnimation();
}

/** Select facial expression based on emotion tags (primary) or text keywords (fallback) */
export function selectFacialExpression(text: string): string {
  const emotions = extractEmotionTags(text);
  const primary = emotions[0];

  if (primary && emotionToFacialExpression[primary]) {
    return emotionToFacialExpression[primary];
  }

  // Keyword fallback
  const lower = text.toLowerCase();
  if (lower.includes("congratulations") || lower.includes("great") || lower.includes("wonderful")) return "smile";
  if (lower.includes("sorry") || lower.includes("unfortunately") || lower.includes("sad")) return "sad";
  if (lower.includes("wow") || lower.includes("amazing") || lower.includes("surprising")) return "surprised";
  if (lower.includes("serious") || lower.includes("warning")) return "angry";

  return "smile";
}

/** Estimate audio duration from text (~2.5 words/sec) */
export function estimateAudioDuration(text: string): number {
  const clean = stripEmotionTags(text);
  const wordCount = clean.split(/\s+/).filter((w) => w.length > 0).length;
  return Math.max(wordCount / 2.5, 1);
}
