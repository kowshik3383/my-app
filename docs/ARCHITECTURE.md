# Realtime Voice Call Architecture

## Overview

The realtime voice system transforms the existing AI health companion into a natural phone-call-style conversational experience. It adds bidirectional audio streaming, voice activity detection, interruption handling, and streaming TTS while preserving all existing V2 systems (memory engine, goals, health analytics, coaching personalities, etc.).

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Next.js)                      │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Mic     │  │ Web      │  │ Audio    │  │ Call UI │ │
│  │ Stream   │──▶Socket    │──▶Playback  │  │ Screen  │ │
│  │ (PCM)    │  │ Client   │  │ Queue    │  │         │ │
│  └──────────┘  └────┬─────┘  └──────────┘  └─────────┘ │
│                      │                                   │
│              ┌───────┴───────┐                          │
│              │ Silero VAD    │                          │
│              │ (ONNX/JS)     │                          │
│              └───────────────┘                          │
└──────────────────────────┬──────────────────────────────┘
                           │ WebSocket (ws://)
                           │ Binary + JSON
┌──────────────────────────┴──────────────────────────────┐
│                WebSocket Server (Port 3001)               │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Session  │  │ Realtime  │  │ STT      │  │ TTS     │ │
│  │ Manager  │──▶Handler   │──▶Whisper   │  │Cartesia │ │
│  └──────────┘  └────┬─────┘  └──────────┘  └─────────┘ │
│                      │                                   │
│              ┌───────┴───────┐                          │
│              │ OpenRouter    │                          │
│              │ Streaming LLM │                          │
│              └───────┬───────┘                          │
│                      │                                   │
│              ┌───────┴───────┐                          │
│              │ Memory Engine  │                          │
│              │ + Retrieval    │                          │
│              └───────────────┘                          │
│                                                          │
│              ┌──────────────────────┐                   │
│              │ MongoDB (Existing)   │                   │
│              │ + voice_sessions    │                   │
│              │ + voice_events      │                   │
│              │ + call_summaries    │                   │
│              └──────────────────────┘                   │
└──────────────────────────────────────────────────────────┘
```

## Data Flow

### Normal Conversation Flow

```
User speaks → Mic captures PCM audio (16kHz mono)
    → Silero VAD detects speech start
    → Web Speech API generates partial transcripts (live)
    → Speech end detected by VAD
    → Final transcript sent to server via WebSocket
    → Server retrieves memory context
    → Server streams OpenRouter response
    → AI tokens sent back to browser (for transcript)
    → Server streams Cartesia TTS audio chunks
    → Browser plays audio chunks immediately
    → Natural conversation continues
```

### Interruption Flow

```
User interrupts AI mid-speech
    → VAD detects new speech
    → Browser sends INTERRUPT signal
    → Server cancels current OpenRouter generation
    → Server cancels current TTS stream
    → Browser stops audio playback
    → New user utterance begins
    → System processes naturally
```

## WebSocket Protocol

### Events (Client → Server)

| Event | Payload | Description |
|-------|---------|-------------|
| `auth` | `{ userId, token }` | Authenticate session |
| `audio.input` | `{ audio: ArrayBuffer, sequence }` | Raw PCM audio data |
| `transcript.final` | `{ text }` | Final STT transcript |
| `interrupt` | `{ reason, timestamp }` | User interruption |
| `session.ended` | `{}` | End call |
| `reconnect` | `{}` | Reconnect to session |
| `latency.ping` | `{ clientTime }` | Latency measurement |

### Events (Server → Client)

| Event | Payload | Description |
|-------|---------|-------------|
| `auth.ok` | `{ sessionId, userId }` | Authentication success |
| `session.started` | `{ sessionId, userId }` | Session created |
| `session.ended` | `{ sessionId, duration }` | Session ended |
| `ai.token` | `{ token, done }` | Streaming AI token |
| `ai.tokens.complete` | `{ fullText }` | AI response complete |
| `tts.chunk` | `{ audio, format, sequence, isFinal }` | TTS audio chunk |
| `tts.complete` | `{}` | TTS generation complete |
| `interrupt` | `{ reason, timestamp }` | Interrupt confirmed |
| `error` | `{ message }` | Error notification |
| `connection.state` | `{ state }` | Connection status |
| `latency.pong` | `{ serverTime }` | Latency response |

## Directory Structure

```
src/
├── server/                          # WebSocket Server
│   ├── index.ts                     # Server entry point
│   ├── config.ts                    # Server configuration
│   ├── session-manager.ts           # Voice session lifecycle
│   └── realtime-handler.ts          # WebSocket message handler
│
├── hooks/realtime/                  # Frontend Hooks
│   ├── useRealtimeCall.ts           # Main orchestrator hook
│   ├── useMicrophoneStream.ts       # Mic PCM streaming
│   ├── useAudioPlayback.ts          # Audio playback queue
│   ├── useRealtimeTranscript.ts     # Live transcript state
│   ├── useVoiceActivity.ts          # VAD state management
│   └── useInterruptions.ts          # Interruption handling
│
├── components/realtime/             # Call UI Components
│   ├── CallScreen.tsx               # Main call interface
│   ├── AvatarOrb.tsx                # Animated 3D orb
│   ├── Waveform.tsx                 # Realtime audio waveform
│   ├── TranscriptPanel.tsx          # Live transcript display
│   ├── CallControls.tsx             # Mute/end controls
│   └── ConnectionIndicator.tsx      # Connection quality
│
├── lib/realtime/                    # Frontend Libraries
│   ├── types.ts                     # WS event constants
│   ├── websocket-client.ts          # WS client with reconnection
│   ├── audio-context.ts            # Web Audio API wrapper
│   └── jitter-buffer.ts            # Smooth playback buffer
│
├── lib/stt/                         # Speech-to-Text
│   ├── index.ts                     # Provider abstraction
│   └── whisper.ts                   # OpenAI Whisper integration
│
├── lib/tts/                         # Text-to-Speech
│   ├── index.ts                     # Provider abstraction
│   ├── cartesia-stream.ts           # Cartesia streaming TTS
│   └── elevenlabs-stream.ts         # ElevenLabs TTS
│
├── lib/vad/                         # Voice Activity Detection
│   └── index.ts                     # Simple VAD + provider
│
├── types/
│   └── realtime.ts                  # Realtime type definitions
│
└── app/api/realtime/route.ts        # REST API for voice data
```

## Memory Integration

During voice conversations, the existing memory engine is fully active:

1. **Before AI response**: Memory retrieval fetches relevant context
2. **After AI response**: Memory extraction processes conversation
3. **Voice sessions**: Create memories with voice-specific metadata
4. **Emotion detection**: Signals stored in emotional memory
5. **Call summaries**: Generated after call ends, stored in call_summaries

## Performance Targets

| Metric | Target |
|--------|--------|
| VAD detection latency | <100ms |
| Partial transcript latency | <300ms |
| First AI token | <400ms |
| First TTS audio chunk | <300ms |
| Perceived end-to-end latency | <1s |
| Audio chunk size | 30-60ms |

## Security

- WebSocket authentication via userId validation
- Audio payload size limits (64KB max per message)
- Session timeout after 1 hour of inactivity
- Heartbeat every 30 seconds
- Reconnection with token validation
- No audio persisted beyond session summary
