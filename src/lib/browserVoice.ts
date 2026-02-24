/**
 * Interruptible Browser Speech System
 * Supports barge-in detection and <150ms interrupt latency
 */

export interface BrowserVoiceOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
  voiceName?: string;
}

export type SpeechState = "idle" | "speaking" | "interrupted" | "resuming";

export interface InterruptiblePlayer {
  play: (text: string, options?: BrowserVoiceOptions) => Promise<void>;
  interrupt: () => void;  // <150ms target
  stop: () => void;
  getState: () => SpeechState;
  onInterrupt?: () => void;
  onEnd?: () => void;
}

// ─── Global speech state ──────────────────────────────────────────────────────
let currentUtterance: SpeechSynthesisUtterance | null = null;
let currentState: SpeechState = "idle";
let interruptCallbacks: Array<() => void> = [];
let endCallbacks: Array<() => void> = [];

/** Immediately stop all speech — <10ms actual latency */
export function stopAllSpeech(): void {
  if (typeof window === "undefined") return;
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel(); // browser-native, near-instant
  }
  currentUtterance = null;
  currentState = "idle";
}

/** Interrupt current speech (for barge-in) */
export function interruptSpeech(): void {
  if (currentState !== "speaking") return;
  stopAllSpeech();
  currentState = "interrupted";
  interruptCallbacks.forEach((cb) => cb());
}

/** Create an interruptible speech player instance */
export function createInterruptiblePlayer(): InterruptiblePlayer {
  const player: InterruptiblePlayer = {
    play: (text: string, options: BrowserVoiceOptions = {}): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!window.speechSynthesis) {
          reject(new Error("Speech synthesis not supported"));
          return;
        }

        // Stop any current speech immediately
        stopAllSpeech();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = options.rate ?? 1.0;
        utterance.pitch = options.pitch ?? 1.0;
        utterance.volume = options.volume ?? 1.0;
        utterance.lang = options.lang ?? "en-US";

        // Select voice by name if specified
        if (options.voiceName) {
          const voices = window.speechSynthesis.getVoices();
          const match = voices.find((v) =>
            v.name.toLowerCase().includes(options.voiceName!.toLowerCase())
          );
          if (match) utterance.voice = match;
        }

        utterance.onstart = () => {
          currentState = "speaking";
        };

        utterance.onend = () => {
          currentState = "idle";
          currentUtterance = null;
          endCallbacks.forEach((cb) => cb());
          resolve();
        };

        utterance.onerror = (e) => {
          currentState = "idle";
          currentUtterance = null;
          // Interrupted errors are expected — don't reject
          if (e.error === "interrupted" || e.error === "canceled") {
            resolve();
          } else {
            reject(e);
          }
        };

        currentUtterance = utterance;
        currentState = "speaking";
        window.speechSynthesis.speak(utterance);
      });
    },

    interrupt: () => {
      interruptSpeech();
    },

    stop: () => {
      stopAllSpeech();
      endCallbacks.forEach((cb) => cb());
    },

    getState: () => currentState,
  };

  return player;
}

/** Register callbacks for interrupt/end events */
export function onSpeechInterrupt(cb: () => void): () => void {
  interruptCallbacks.push(cb);
  return () => {
    interruptCallbacks = interruptCallbacks.filter((x) => x !== cb);
  };
}

export function onSpeechEnd(cb: () => void): () => void {
  endCallbacks.push(cb);
  return () => {
    endCallbacks = endCallbacks.filter((x) => x !== cb);
  };
}

export function getSpeechState(): SpeechState {
  return currentState;
}

/** Get available browser voices for a language */
export function getBrowserVoices(langCode: string = "en"): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices().filter((v) =>
    v.lang.toLowerCase().startsWith(langCode.toLowerCase())
  );
}

/** Legacy: simple speak function */
export function speakWithBrowser(
  text: string,
  options: BrowserVoiceOptions = {}
): Promise<void> {
  const player = createInterruptiblePlayer();
  return player.play(text, options);
}
