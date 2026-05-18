export class JitterBuffer {
  private buffer: ArrayBuffer[] = [];
  private targetSize: number;
  private maxSize: number;
  private droppedFrames = 0;

  constructor(targetSize = 3, maxSize = 10) {
    this.targetSize = targetSize;
    this.maxSize = maxSize;
  }

  push(chunk: ArrayBuffer): void {
    this.buffer.push(chunk);
    if (this.buffer.length > this.maxSize) {
      this.buffer.shift();
      this.droppedFrames++;
    }
  }

  pop(): ArrayBuffer | null {
    if (this.buffer.length === 0) return null;
    return this.buffer.shift() || null;
  }

  get isReady(): boolean {
    return this.buffer.length >= this.targetSize;
  }

  get size(): number {
    return this.buffer.length;
  }

  get droppedCount(): number {
    return this.droppedFrames;
  }

  clear(): void {
    this.buffer = [];
    this.droppedFrames = 0;
  }

  getEstimatedJitter(): number {
    if (this.buffer.length === 0) return 0;
    const sizes = this.buffer.map((b) => b.byteLength);
    const avg = sizes.reduce((a, b) => a + b, 0) / sizes.length;
    const variance =
      sizes.reduce((acc, s) => acc + (s - avg) ** 2, 0) / sizes.length;
    return Math.sqrt(variance);
  }
}

export class AudioPlaybackQueue {
  private audioCtx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private scheduledTime = 0;
  private isPlaying = false;
  private onChunkPlayed: ((sequence: number) => void) | null = null;
  private currentSource: AudioBufferSourceNode | null = null;

  async init(sampleRate = 24000): Promise<void> {
    this.audioCtx = new AudioContext({ sampleRate });
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = 1;
    this.gainNode.connect(this.audioCtx.destination);
  }

  enqueue(audio: ArrayBuffer, sampleRate: number, sequence: number): void {
    if (!this.audioCtx || !this.gainNode) return;

    const audioBuffer = this.audioCtx.createBuffer(1, audio.byteLength / 2, sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    const int16 = new Int16Array(audio);
    for (let i = 0; i < int16.length; i++) {
      channelData[i] = int16[i] / 32768;
    }

    const source = this.audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.gainNode);

    const now = this.audioCtx.currentTime;
    const startTime = Math.max(this.scheduledTime, now);

    source.start(startTime);
    source.onended = () => {
      this.currentSource = null;
      this.onChunkPlayed?.(sequence);
    };

    this.scheduledTime = startTime + audioBuffer.duration;
    this.currentSource = source;
  }

  enqueueFloat32(audio: Float32Array, sampleRate: number, sequence: number): void {
    if (!this.audioCtx || !this.gainNode) return;

    const audioBuffer = this.audioCtx.createBuffer(1, audio.length, sampleRate);
    audioBuffer.getChannelData(0).set(audio);

    const source = this.audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.gainNode);

    const now = this.audioCtx.currentTime;
    const startTime = Math.max(this.scheduledTime, now);

    source.start(startTime);
    source.onended = () => {
      this.currentSource = null;
      this.onChunkPlayed?.(sequence);
    };

    this.scheduledTime = startTime + audioBuffer.duration;
    this.currentSource = source;
  }

  stop(): void {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch {}
      this.currentSource = null;
    }
    this.scheduledTime = 0;
    this.isPlaying = false;
  }

  clear(): void {
    this.stop();

    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
      this.gainNode = null;
    }
  }

  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  setOnChunkPlayed(handler: (sequence: number) => void): void {
    this.onChunkPlayed = handler;
  }

  get isInterrupted(): boolean {
    return !this.currentSource && this.scheduledTime > 0;
  }

  get currentTime(): number {
    return this.audioCtx?.currentTime || 0;
  }
}
