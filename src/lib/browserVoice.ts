/**
 * Browser-based text-to-speech using Web Speech API
 * Fast fallback when ElevenLabs is unavailable or slow
 */

export interface BrowserVoiceOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

/**
 * Generate speech using browser's SpeechSynthesis API
 * Returns base64 audio data by recording the speech
 */
export async function generateBrowserVoice(
  text: string,
  options: BrowserVoiceOptions = {}
): Promise<string> {
  return new Promise((resolve) => {
    // For now, return empty string - browser speech will be handled client-side
    // This is because recording browser speech requires client-side MediaRecorder
    resolve("");
  });
}

/**
 * Client-side speech synthesis (to be used in components)
 */
export function speakWithBrowser(
  text: string,
  options: BrowserVoiceOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error("Speech synthesis not supported"));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;
    utterance.lang = options.lang || "en-US";

    utterance.onend = () => resolve();
    utterance.onerror = (error) => reject(error);

    window.speechSynthesis.speak(utterance);
  });
}
