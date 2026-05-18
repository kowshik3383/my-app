export class AudioContextManager {
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private onAudioData: ((audio: Float32Array) => void) | null = null;

  async init(): Promise<void> {
    this.ctx = new AudioContext({ sampleRate: 16000 });

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        noiseSuppression: true,
        echoCancellation: true,
      },
    });

    this.source = this.ctx.createMediaStreamSource(this.stream);
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.value = 1;

    this.analyserNode = this.ctx.createAnalyser();
    this.analyserNode.fftSize = 256;

    this.source.connect(this.gainNode);
    this.gainNode.connect(this.analyserNode);

    this.processor = this.ctx.createScriptProcessor(2048, 1, 1);
    this.analyserNode.connect(this.processor);
    this.processor.connect(this.ctx.destination);

    this.processor.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0);
      if (this.onAudioData) {
        this.onAudioData(new Float32Array(input));
      }
    };
  }

  setOnAudioData(handler: (audio: Float32Array) => void): void {
    this.onAudioData = handler;
  }

  getAnalyserData(): { frequency: Uint8Array; timeDomain: Uint8Array } {
    if (!this.analyserNode) {
      return {
        frequency: new Uint8Array(0),
        timeDomain: new Uint8Array(0),
      };
    }
    const frequency = new Uint8Array(this.analyserNode.frequencyBinCount);
    const timeDomain = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(frequency);
    this.analyserNode.getByteTimeDomainData(timeDomain);
    return { frequency, timeDomain };
  }

  getAudioLevel(): number {
    if (!this.analyserNode) return 0;
    const data = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += Math.abs(data[i] - 128);
    }
    return sum / data.length / 128;
  }

  isMuted(): boolean {
    return this.gainNode?.gain.value === 0;
  }

  setMuted(muted: boolean): void {
    if (this.gainNode) {
      this.gainNode.gain.value = muted ? 0 : 1;
    }
  }

  async resume(): Promise<void> {
    if (this.ctx?.state === "suspended") {
      await this.ctx.resume();
    }
  }

  async suspend(): Promise<void> {
    if (this.ctx?.state === "running") {
      await this.ctx.suspend();
    }
  }

  async destroy(): Promise<void> {
    this.onAudioData = null;
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (this.ctx) {
      await this.ctx.close();
      this.ctx = null;
    }
  }

  get sampleRate(): number {
    return this.ctx?.sampleRate || 16000;
  }
}
