import { createPayload, WS_EVENTS, type WSPayload } from "./types";

type ConnectionState = "disconnected" | "connecting" | "connected" | "reconnecting";

type MessageHandler = (payload: WSPayload) => void;
type StateHandler = (state: ConnectionState) => void;

export interface WSClientConfig {
  url: string;
  userId: string;
  reconnectMaxAttempts?: number;
  reconnectBaseDelay?: number;
}

export class RealtimeWSClient {
  private ws: WebSocket | null = null;
  private config: WSClientConfig;
  private messageHandlers = new Map<string, Set<MessageHandler>>();
  private stateHandlers = new Set<StateHandler>();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalClose = false;
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: WSClientConfig) {
    this.config = {
      reconnectMaxAttempts: 10,
      reconnectBaseDelay: 1000,
      ...config,
    };
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    this.intentionalClose = false;
    this.setState("connecting");

    try {
      this.ws = new WebSocket(this.config.url);
      this.ws.binaryType = "arraybuffer";

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.setState("connected");
        this.authenticate();
        this.startPing();
      };

      this.ws.onclose = (event) => {
        this.stopPing();
        if (!this.intentionalClose && this.reconnectAttempts < (this.config.reconnectMaxAttempts || 10)) {
          this.setState("reconnecting");
          this.scheduleReconnect();
        } else {
          this.setState("disconnected");
        }
      };

      this.ws.onerror = () => {};

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string) as WSPayload;
          this.dispatch(msg);
        } catch {}
      };
    } catch {
      this.setState("disconnected");
    }
  }

  disconnect(): void {
    this.intentionalClose = true;
    this.stopPing();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
    this.setState("disconnected");
  }

  send(type: string, payload: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(createPayload(type as any, payload)));
    }
  }

  sendAudio(audio: ArrayBuffer, sequence: number): void {
    const msg = JSON.stringify(
      createPayload(WS_EVENTS.AUDIO_INPUT, { audio: "", sequence })
    );
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(msg);
    }
  }

  on(type: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler);
    return () => this.messageHandlers.get(type)?.delete(handler);
  }

  onState(handler: StateHandler): () => void {
    this.stateHandlers.add(handler);
    return () => this.stateHandlers.delete(handler);
  }

  private authenticate(): void {
    this.send(WS_EVENTS.AUTH, {
      userId: this.config.userId,
      token: "",
    });
  }

  private setState(state: ConnectionState): void {
    this.stateHandlers.forEach((h) => h(state));
  }

  private dispatch(msg: WSPayload): void {
    const handlers = this.messageHandlers.get(msg.type);
    if (handlers) {
      handlers.forEach((h) => h(msg));
    }
  }

  private startPing(): void {
    this.pingInterval = setInterval(() => {
      this.send(WS_EVENTS.LATENCY_PING, { clientTime: Date.now() });
    }, 15000);
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect(): void {
    const delay = Math.min(
      (this.config.reconnectBaseDelay || 1000) * Math.pow(2, this.reconnectAttempts),
      30000
    );
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  get connected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
