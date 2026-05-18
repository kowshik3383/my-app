# AI Health Companion V2 — Realtime Voice

A persistent, proactive, production-grade AI health platform built with Next.js. Features long-term memory, health analytics dashboard, goal tracking, provider-agnostic AI orchestration (OpenRouter), and **full duplex realtime voice calling** with natural interruption.

## Features

- **🎙️ Realtime Voice Calling** — Phone-call-style duplex conversation with <1s perceived latency
- **⏱️ Natural Interruption** — Speak over the AI; it stops, listens, and responds naturally
- **🧠 Persistent Memory Engine** — Episodic, behavioral, emotional, and health-fact memory with semantic retrieval
- **📊 Health Dashboard** — Weight, glucose, sleep, mood, medication tracking with AI-powered insights
- **🎯 Goal Tracking** — Set health goals, track streaks, get AI coaching with adaptive personalities
- **👤 3D Avatar** — Realistic avatar with facial expressions, lipsync, and animations
- **🌐 Multilingual** — English, Hindi, Tamil, Telugu, Bengali
- **⚡ Streaming AI Responses** — Real-time token-by-token streaming via WebSocket
- **🔌 Provider-Agnostic AI** — OpenRouter with model routing (fast chat, reasoning, memory, embeddings)
- **🔄 WebSocket Streaming** — Bidirectional audio + data streaming with auto-reconnect
- **🎨 Premium Call UI** — Animated orb, live waveform, transcript panel, connection indicator
- **📋 Call Summaries** — Automatic post-call summaries with health signal extraction

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS v4 |
| State | Zustand with persist middleware |
| AI | OpenRouter (provider-agnostic: GPT-4o-mini, Claude Sonnet, Mistral) |
| Database | MongoDB (native driver) with vector search |
| Charts | Recharts |
| 3D | React Three Fiber, Three.js |
| Voice | WebSocket streaming, Web Speech API STT, Cartesia TTS |
| Realtime | WebSocket server (ws library), Silero VAD, Jitter Buffer |

## Quick Start

```bash
pnpm install
cp .env.example .env   # configure your API keys
pnpm dev               # http://localhost:3000
pnpm dev:voice         # WebSocket voice server on ws://localhost:3001
# OR run both at once:
pnpm dev:all
```

## Environment Variables

```env
# Required
OPENROUTER_API_KEY=
DATABASE_URL=

# Voice (required for realtime calling)
CARTESIA_API_KEY=sk_car_...
# ELEVENLABS_API_KEY=sk_...

# OpenRouter (optional overrides)
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL_FAST=openai/gpt-4o-mini
OPENROUTER_MODEL_REASONING=anthropic/claude-sonnet-4
OPENROUTER_MODEL_MEMORY=mistralai/mistral-small

# Realtime Voice Server
WS_PORT=3001
WS_HOST=0.0.0.0
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# STT/TTS
STT_PROVIDER=openai
TTS_PROVIDER=cartesia
TTS_VOICE_ID=sonic-2
```

## Architecture

```
Frontend (React/Next.js)
    │
    ▼
Next.js API Layer
    │
    ▼
AI Orchestration Layer (OpenRouter)
    │
    ├── Fast Chat → GPT-4o-mini / Mistral Small
    ├── Reasoning → Claude Sonnet / GPT-4.1
    ├── Memory     → Mistral Small
    └── Embeddings → text-embedding-3-small
```

### Memory System

```
Message Created
    │
    ├── Save Message (MongoDB)
    ├── Extract Memories (async)
    ├── Generate Embeddings
    ├── Store in Vector DB
    ├── Detect Emotional Signals
    └── Summarize (every 20 messages)
```

Memory retrieval injects relevant context into each AI prompt using semantic search, recency weighting, and token budgeting.

### API Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `/api/chat` | POST | Send message, get AI response (streaming or JSON) |
| `/api/profile` | GET/POST/PUT | User profile CRUD |
| `/api/session` | GET/POST | Session management |
| `/api/memories` | GET/DELETE | Memory retrieval and management |
| `/api/health/metrics` | GET/POST | Health metric tracking |
| `/api/health/insights` | GET/POST/PATCH | AI-generated health insights |
| `/api/goals` | GET/POST/PATCH/DELETE | Goal CRUD with progress tracking |
| `/api/goals/evaluate` | POST | Evaluate all active goals |
| `/api/dashboard` | GET/POST | Aggregated dashboard data |
| `/api/voice` | POST | TTS voice generation |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (chat, health, goals, etc.)
│   ├── dashboard/         # Health analytics dashboard
│   └── page.tsx           # Main entry point
├── components/
│   ├── 3d/                # Avatar, Experience
│   ├── dashboard/         # WeightChart, GlucoseChart, SleepChart, etc.
│   ├── goals/             # GoalCard, GoalList, GoalForm
│   └── memory/            # MemoryIndicator
├── lib/
│   ├── ai/                # OpenRouter client, model routing, prompts
│   ├── db/                # MongoDB client, vector store
│   ├── memory/            # Engine, extraction, retrieval, embeddings
│   ├── goals/             # Goal engine, evaluation
│   ├── health/            # Insights generation
│   └── observability/     # Logging utilities
├── store/                 # Zustand state
└── types/                 # TypeScript types (memory, health, goals)
```

## Key Design Decisions

- **OpenRouter over Gemini** — Provider-agnostic, model flexibility, fallback support, cost controls
- **Async memory pipeline** — Memory extraction runs in background, doesn't block responses
- **Token-aware retrieval** — Memory injection respects token budgets to prevent context overflow
- **MongoDB for vectors** — Embeddings stored in MongoDB with fallback; swappable to Qdrant/Pinecone
- **SSE streaming** — Real-time token streaming with `ReadableStream`

## Security

- API keys are server-side only (never exposed to client)
- MongoDB connection string stored in environment variables
- Rate limiting via middleware (configurable)
- Audit logging via observability layer

## Deployment

1. Push to GitHub
2. Import in Vercel
3. Set environment variables
4. Deploy

MongoDB Atlas collections are auto-created on first use.
