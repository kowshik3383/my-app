"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { RealtimeWSClient } from "@/lib/realtime/websocket-client";
import { WS_EVENTS } from "@/lib/realtime/types";
import { useMicrophoneStream } from "./useMicrophoneStream";
import { useAudioPlayback } from "./useAudioPlayback";
import { useRealtimeTranscript } from "./useRealtimeTranscript";
import { useVoiceActivity } from "./useVoiceActivity";
import { useInterruptions } from "./useInterruptions";
import type {
  ConnectionState,
  CallState,
  CallMetrics,
  VoiceSelectorOption,
} from "@/types/realtime";
import { VOICE_OPTIONS } from "@/types/realtime";

interface UseRealtimeCallOptions {
  userId: string;
  wsUrl?: string;
}

interface UseRealtimeCallReturn {
  callState: CallState;
  connectionState: ConnectionState;
  isSpeaking: boolean;
  isAISpeaking: boolean;
  isMuted: boolean;
  sessionTimer: string;
  transcripts: ReturnType<typeof useRealtimeTranscript>;
  metrics: CallMetrics;
  selectedVoice: VoiceSelectorOption;
  voices: VoiceSelectorOption[];
  audioLevel: number;
  startCall: () => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  setVoice: (voice: VoiceSelectorOption) => void;
  reconnect: () => void;
}

export function useRealtimeCall(
  options: UseRealtimeCallOptions
): UseRealtimeCallReturn {
  const [callState, setCallState] = useState<CallState>("idle");
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [sessionTimer, setSessionTimer] = useState("00:00");
  const [selectedVoice, setSelectedVoice] = useState<VoiceSelectorOption>(
    VOICE_OPTIONS[0]
  );
  const [metrics, setMetrics] = useState<CallMetrics>({
    latency: 0,
    jitter: 0,
    packetsLost: 0,
    reconnects: 0,
    audioLevel: 0,
  });

  const wsClientRef = useRef<RealtimeWSClient | null>(null);
  const callStartRef = useRef<number>(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectCountRef = useRef(0);
  const isAISpeakingRef = useRef(false);

  const voiceActivity = useVoiceActivity({
    threshold: 0.02,
    onSpeechStart: () => {
      if (isAISpeakingRef.current) {
        sendInterrupt();
      }
    },
  });

  const interruptions = useInterruptions({
    onInterrupt: () => {
      setIsAISpeaking(false);
      isAISpeakingRef.current = false;
      audioPlayback.stopPlayback();
    },
  });

  const transcript = useRealtimeTranscript();

  const audioPlayback = useAudioPlayback({
    sampleRate: 24000,
    jitterTarget: 3,
  });

  const micStream = useMicrophoneStream({
    onAudioData: (audio) => {
      voiceActivity.updateAudioLevel(
        Math.sqrt(audio.reduce((s, v) => s + v * v, 0) / audio.length)
      );
    },
    onVADChange: (speaking, level) => {
      voiceActivity.updateAudioLevel(level);
    },
  });

  const sendInterrupt = useCallback(() => {
    wsClientRef.current?.send(WS_EVENTS.INTERRUPT, {
      reason: "user_speech",
      timestamp: Date.now(),
    });
    audioPlayback.stopPlayback();
    interruptions.triggerInterrupt();
    setIsAISpeaking(false);
    isAISpeakingRef.current = false;
  }, [audioPlayback, interruptions]);

  const startCall = useCallback(async () => {
    setCallState("connecting");

    await audioPlayback.init();
    await micStream.start();

    const wsUrl =
      options.wsUrl ||
      process.env.NEXT_PUBLIC_WS_URL ||
      `ws://localhost:3001`;

    const wsClient = new RealtimeWSClient({
      url: wsUrl,
      userId: options.userId,
      reconnectMaxAttempts: 10,
    });

    wsClientRef.current = wsClient;

    wsClient.onState((state) => {
      setConnectionState(state);
      if (state === "connected") {
        setCallState("connected");
        callStartRef.current = Date.now();
        startTimer();
      } else if (state === "reconnecting") {
        reconnectCountRef.current++;
        setMetrics((m) => ({ ...m, reconnects: reconnectCountRef.current }));
      } else if (state === "disconnected") {
        if (callState !== "ended" && callState !== "idle") {
          setCallState("ended");
          stopTimer();
        }
      }
    });

    wsClient.on(WS_EVENTS.AUTH_OK, (msg) => {
      transcript.clearTranscripts();
    });

    wsClient.on(WS_EVENTS.AI_TOKEN, (msg) => {
      const token = (msg.payload as any)?.token || "";
      transcript.addToken(token);
    });

    wsClient.on(WS_EVENTS.AI_TOKENS_COMPLETE, (msg) => {
      const fullText = (msg.payload as any)?.fullText || "";
      transcript.addFinal(fullText, "assistant");
    });

    wsClient.on(WS_EVENTS.TTS_CHUNK, async (msg) => {
      const payload = msg.payload as any;
      if (payload.audio) {
        try {
          const binary = atob(payload.audio);
          const buffer = new ArrayBuffer(binary.length);
          const view = new Uint8Array(buffer);
          for (let i = 0; i < binary.length; i++) {
            view[i] = binary.charCodeAt(i);
          }
          audioPlayback.enqueueAudio(buffer, 24000, payload.sequence);
          setIsAISpeaking(true);
          isAISpeakingRef.current = true;
        } catch {}
      }
      if (payload.isFinal) {
        setIsAISpeaking(false);
        isAISpeakingRef.current = false;
      }
    });

    wsClient.on(WS_EVENTS.TTS_COMPLETE, () => {
      setIsAISpeaking(false);
      isAISpeakingRef.current = false;
    });

    wsClient.on(WS_EVENTS.INTERRUPT, () => {
      audioPlayback.stopPlayback();
      setIsAISpeaking(false);
      isAISpeakingRef.current = false;
    });

    wsClient.on(WS_EVENTS.LATENCY_PONG, (msg) => {
      const serverTime = (msg.payload as any)?.serverTime || 0;
      const clientTime = (msg.payload as any)?.clientTime || 0;
      if (clientTime) {
        setMetrics((m) => ({
          ...m,
          latency: Date.now() - clientTime,
        }));
      }
    });

    wsClient.connect();

    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    if (recognition) {
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript + " ";
          } else {
            interim += result[0].transcript;
          }
        }

        if (interim) {
          transcript.addPartial(interim);
        }

        if (final.trim()) {
          transcript.addFinal(final.trim(), "user");
          wsClientRef.current?.send(WS_EVENTS.TRANSCRIPT_FINAL, {
            text: final.trim(),
          });
        }
      };

      recognition.onerror = () => {};
      recognition.start();
    }

    setMetrics({
      latency: 0,
      jitter: 0,
      packetsLost: 0,
      reconnects: 0,
      audioLevel: 0,
    });
    reconnectCountRef.current = 0;
  }, [options.userId, options.wsUrl, audioPlayback, micStream, transcript, voiceActivity, interruptions]);

  const endCall = useCallback(() => {
    stopTimer();
    setCallState("ended");

    wsClientRef.current?.send(WS_EVENTS.SESSION_ENDED, {});
    wsClientRef.current?.disconnect();
    wsClientRef.current = null;

    audioPlayback.clearQueue();
    micStream.stop().catch(() => {});

    setIsAISpeaking(false);
    isAISpeakingRef.current = false;
  }, [audioPlayback, micStream]);

  const toggleMute = useCallback(() => {
    if (micStream.isMuted) {
      micStream.unmute();
    } else {
      micStream.mute();
    }
  }, [micStream]);

  const setVoice = useCallback((voice: VoiceSelectorOption) => {
    setSelectedVoice(voice);
  }, []);

  const reconnect = useCallback(() => {
    if (callState === "ended" || callState === "idle") return;
    setConnectionState("reconnecting");
    wsClientRef.current?.connect();
  }, [callState]);

  const startTimer = () => {
    timerIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - callStartRef.current;
      const mins = Math.floor(elapsed / 60000);
      const secs = Math.floor((elapsed % 60000) / 1000);
      setSessionTimer(
        `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
      );
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopTimer();
      wsClientRef.current?.disconnect();
      audioPlayback.clearQueue();
      micStream.stop().catch(() => {});
    };
  }, []);

  return {
    callState,
    connectionState,
    isSpeaking: micStream.isSpeaking,
    isAISpeaking,
    isMuted: micStream.isMuted,
    sessionTimer,
    transcripts: transcript,
    metrics,
    selectedVoice,
    voices: VOICE_OPTIONS,
    audioLevel: micStream.audioLevel,
    startCall,
    endCall,
    toggleMute,
    setVoice,
    reconnect,
  };
}
