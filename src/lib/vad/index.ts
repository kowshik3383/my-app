export interface VADResult {
  speaking: boolean;
  audioLevel: number;
  timestamp: number;
}

export interface VADProvider {
  processAudio(audio: Float32Array): VADResult;
  reset(): void;
}

export class SimpleVAD implements VADProvider {
  private threshold: number;
  private minSpeechFrames: number;
  private silenceFrames: number;
  private speechFrames: number;
  private isSpeaking: boolean;
  private frameCount: number;

  constructor(threshold = 0.02, minSpeechFrames = 3, silenceFrames = 10) {
    this.threshold = threshold;
    this.minSpeechFrames = minSpeechFrames;
    this.silenceFrames = silenceFrames;
    this.speechFrames = 0;
    this.isSpeaking = false;
    this.frameCount = 0;
  }

  processAudio(audio: Float32Array): VADResult {
    this.frameCount++;
    const rms = this.calculateRMS(audio);
    const aboveThreshold = rms > this.threshold;

    if (aboveThreshold) {
      this.speechFrames++;
    } else {
      this.speechFrames = Math.max(0, this.speechFrames - 1);
    }

    if (!this.isSpeaking && this.speechFrames >= this.minSpeechFrames) {
      this.isSpeaking = true;
    } else if (this.isSpeaking && this.speechFrames <= 0) {
      let silenceCount = 0;
      for (let i = 0; i < this.silenceFrames; i++) {
        silenceCount++;
      }
      if (silenceCount >= this.silenceFrames) {
        this.isSpeaking = false;
      }
    }

    return {
      speaking: this.isSpeaking,
      audioLevel: rms,
      timestamp: Date.now(),
    };
  }

  reset(): void {
    this.speechFrames = 0;
    this.isSpeaking = false;
    this.frameCount = 0;
  }

  private calculateRMS(audio: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < audio.length; i++) {
      sum += audio[i] * audio[i];
    }
    return Math.sqrt(sum / audio.length);
  }
}

let vadProvider: VADProvider | null = null;

export function getVADProvider(): VADProvider {
  if (!vadProvider) {
    vadProvider = new SimpleVAD();
  }
  return vadProvider;
}
