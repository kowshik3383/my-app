# Deployment Guide

## Prerequisites

- Node.js 20+
- MongoDB instance (Atlas or self-hosted)
- OpenRouter API key
- Cartesia API key (for streaming TTS)
- pnpm (preferred package manager)

## Environment Variables

```bash
# Required
OPENROUTER_API_KEY=sk-or-...
DATABASE_URL=mongodb+srv://...

# Voice TTS (at least one required)
CARTESIA_API_KEY=sk_car_...
# ELEVENLABS_API_KEY=sk_...

# Realtime Voice Server
WS_PORT=3001
WS_HOST=0.0.0.0

# STT Configuration
STT_PROVIDER=openai
STT_MODEL=whisper-1

# TTS Configuration
TTS_PROVIDER=cartesia
TTS_VOICE_ID=sonic-2

# Frontend
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## Local Development

```bash
# Install dependencies
pnpm install

# Start Next.js dev server (terminal 1)
pnpm dev

# Start WebSocket voice server (terminal 2)
pnpm dev:voice

# Or run both together
pnpm dev:all
```

The app will be available at `http://localhost:3000`.

## Production Build

### Option 1: Standalone

```bash
# Build Next.js
pnpm build

# Start Next.js
pnpm start

# Start WebSocket server (separate process)
pnpm start:voice
```

### Option 2: Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build individually
docker build -t health-ai-companion .
docker run -p 3000:3000 -p 3001:3001 \
  -e DATABASE_URL=... \
  -e OPENROUTER_API_KEY=... \
  -e CARTESIA_API_KEY=... \
  health-ai-companion
```

### Option 3: Vercel + External Server

The Next.js frontend can be deployed to Vercel. The WebSocket server needs a separate host that supports persistent connections:

1. Deploy Next.js to Vercel:
```bash
vercel --prod
```

2. Deploy WebSocket server to a VPS or Railway/Render:
```bash
# On your server
git clone <repo>
pnpm install
pnpm build
NODE_ENV=production pnpm start:voice
```

3. Update `NEXT_PUBLIC_WS_URL` in Vercel environment variables to point to your WebSocket server.

## Scaling Considerations

### WebSocket Server
- Each voice session uses ~100KB memory
- For 1000 concurrent calls: ~100MB RAM
- CPU usage is moderate (audio transcoding is lightweight)
- Scale horizontally behind a load balancer with sticky sessions

### MongoDB
- Voice sessions generate ~10 documents per call
- Call summaries are small (<5KB each)
- Voice events can be TTL-indexed (auto-delete after 30 days)

### TTS/STT APIs
- Cartesia: ~50ms per audio chunk generation
- OpenAI Whisper: ~200-500ms per utterance (depends on length)
- Rate limits apply based on your API tier

## Monitoring

The WebSocket server logs structured JSON to stdout:
```json
{"timestamp":"...","level":"info","message":"Session started","context":{"sessionId":"...","userId":"..."}}
```

Key metrics to monitor:
- WebSocket connection count
- Average session duration
- Interruption frequency
- TTS/STT latency
- Reconnection rate

## Health Check

```bash
# Check if services are running
curl http://localhost:3000/api/realtime
# Response: {"status":"ok","wsUrl":"ws://localhost:3001","version":"1.0.0"}

# Check WebSocket server (requires ws client)
# The server responds to ping/pong for liveness
```
