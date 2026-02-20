// Simple lipsync generator based on phonetic patterns
// This creates mouth cues that sync with the audio

interface MouthCue {
  start: number;
  end: number;
  value: string; // Viseme code (A-H, X)
}

interface LipsyncData {
  mouthCues: MouthCue[];
}

/**
 * Generate lipsync data from text
 * This is a simplified version - for production, use proper phonetic analysis
 */
export function generateLipsync(text: string, duration: number = 3): LipsyncData {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const mouthCues: MouthCue[] = [];
  
  if (words.length === 0) {
    return { mouthCues: [] };
  }

  const timePerWord = duration / words.length;
  let currentTime = 0;

  words.forEach((word) => {
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
  });

  return { mouthCues };
}

/**
 * Convert word to phoneme visemes
 * Simplified mapping - real implementation would use proper phonetic analysis
 */
function wordToPhonemes(word: string): string[] {
  const phonemes: string[] = [];
  
  // Simple vowel and consonant detection
  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const nextChar = word[i + 1] || '';
    
    // Vowel sounds
    if ('aeiou'.includes(char)) {
      if (char === 'a') phonemes.push('D'); // Open mouth (AA)
      else if (char === 'e') phonemes.push('C'); // Slight smile (I)
      else if (char === 'i') phonemes.push('C');
      else if (char === 'o') phonemes.push('E'); // Rounded (O)
      else if (char === 'u') phonemes.push('F'); // Rounded forward (U)
    }
    // Consonant sounds
    else if (char === 'p' || char === 'b' || char === 'm') {
      phonemes.push('A'); // Lips together (PP)
    }
    else if (char === 'f' || char === 'v') {
      phonemes.push('G'); // Teeth on lip (FF)
    }
    else if (char === 't' || char === 'd' || char === 'n' || char === 'l') {
      phonemes.push('B'); // Tongue up (kk)
    }
    else if (char === 's' || char === 'z' || char === 'th') {
      phonemes.push('H'); // Teeth close (TH)
      if (char === 't' && nextChar === 'h') i++; // Skip next 'h'
    }
    else {
      phonemes.push('X'); // Rest position
    }
  }

  // If no phonemes generated, return rest position
  return phonemes.length > 0 ? phonemes : ['X'];
}

/**
 * Determine animation based on text content and context
 */
export function selectAnimation(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Check for emotional/action keywords
  if (lowerText.includes('congratulations') || lowerText.includes('great job') || lowerText.includes('excellent')) {
    return 'Rumba Dancing';
  }
  if (lowerText.includes('sorry') || lowerText.includes('unfortunately') || lowerText.includes('concerned')) {
    return 'Crying';
  }
  if (lowerText.includes('angry') || lowerText.includes('frustrated') || lowerText.includes('serious')) {
    return 'Angry';
  }
  if (lowerText.includes('haha') || lowerText.includes('funny') || lowerText.includes('amusing')) {
    return 'Laughing';
  }
  if (lowerText.includes('scary') || lowerText.includes('worried') || lowerText.includes('afraid')) {
    return 'Terrified';
  }
  
  // Default talking animations (rotate between them)
  const talkingAnimations = ['Talking_0', 'Talking_1', 'Talking_2'];
  return talkingAnimations[Math.floor(Math.random() * talkingAnimations.length)];
}

/**
 * Determine facial expression based on text content
 */
export function selectFacialExpression(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Emotional keywords
  if (lowerText.includes('congratulations') || lowerText.includes('great') || lowerText.includes('excellent') || lowerText.includes('wonderful')) {
    return 'smile';
  }
  if (lowerText.includes('sorry') || lowerText.includes('unfortunately') || lowerText.includes('sad')) {
    return 'sad';
  }
  if (lowerText.includes('wow') || lowerText.includes('amazing') || lowerText.includes('surprising')) {
    return 'surprised';
  }
  if (lowerText.includes('serious') || lowerText.includes('important') || lowerText.includes('warning')) {
    return 'angry';
  }
  
  // Default friendly expression
  return 'smile';
}

/**
 * Estimate audio duration from text (rough approximation)
 * Average speaking rate: ~150 words per minute = 2.5 words per second
 */
export function estimateAudioDuration(text: string): number {
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const wordsPerSecond = 2.5;
  return Math.max(wordCount / wordsPerSecond, 1); // Minimum 1 second
}
