# V2 Feature Upgrades — AI Health Companion

## Overview

V2 transforms the application from a basic session-chat MVP into a persistent, proactive, production-grade AI health platform with long-term memory, health analytics, goal tracking, and provider-agnostic AI orchestration.

---

## 1. Provider Migration: Gemini → OpenRouter

### Before
```
Frontend → Next.js API → Gemini (single model, single vendor)
```

### After
```
Frontend → Next.js API → AI Orchestration Layer → OpenRouter → Multiple Models
```

### Changes
- Replaced `@google/generative-ai` with `openai` SDK (OpenRouter is OpenAI-compatible)
- Created provider-agnostic AI client (`src/lib/ai/client.ts`) with abstracted `chatCompletion`, `chatCompletionStream`, `generateEmbedding` functions
- Built model routing system (`src/lib/ai/models.ts`) with per-task model configuration:
  - **Fast chat**: `openai/gpt-4o-mini` or `mistralai/mistral-small`
  - **Reasoning**: `anthropic/claude-sonnet-4` or `openai/gpt-4.1`
  - **Memory**: `mistralai/mistral-small` (cheap)
  - **Embeddings**: `openai/text-embedding-3-small`
- Refactored system prompts from `gemini.ts` into `src/lib/ai/prompts.ts` with expanded role support (21 roles, up from 14)
- Added all 22 onboarding roles to prompts (therapist, nurse, mentor, teacher, etc. were missing before)

### Why
- Model flexibility (swap vendors without code changes)
- Cost optimization (cheap models for memory, expensive only for reasoning)
- Fallback support (if one model fails, route to another)
- Future-proofing (access to any OpenRouter-supported model)
- Multiple providers (OpenAI, Anthropic, Mistral, etc.)

---

## 2. Long-Term Memory Engine

### Before
- Session-based only
- No memory beyond last 20 messages
- AI had no recollection of past conversations
- No emotional or behavioral pattern tracking

### After
Six-tier memory architecture:

| Memory Type | Purpose | Example |
|-------------|---------|---------|
| Short-Term Context | Last 20-30 messages | Recent conversation history |
| Episodic Memory | Important life/health events | "Started new medication last week" |
| Health Facts | Conditions, medications, allergies | "Type 2 diabetes, takes Metformin" |
| Behavioral Memory | Habits and routines | "Skips breakfast frequently" |
| Emotional Memory | Mood patterns | "Anxious on Sundays before work" |
| AI Summaries | Session compression | Summary of every 20 messages |

### Files Created
- `src/lib/memory/engine.ts` — Main orchestrator
- `src/lib/memory/extraction.ts` — Async memory extraction per message
- `src/lib/memory/retrieval.ts` — Semantic search with relevance scoring, recency weighting, token budgeting
- `src/lib/memory/embeddings.ts` — Embedding generation + cosine similarity
- `src/lib/memory/summarization.ts` — Auto-summarize every 20 messages
- `src/lib/memory/types.ts` — Constants and thresholds
- `src/lib/db/vector-store.ts` — Vector storage abstraction

### Memory Pipeline
Every message triggers async background tasks:
1. Save message to MongoDB
2. Extract structured memories via lightweight model
3. Generate embeddings for each memory
4. Store in vector DB with importance scoring
5. Detect emotional signals
6. Check if summarization is needed (every 20 messages)

### Memory Retrieval Flow
Before generating AI response:
1. Generate embedding of user message
2. Semantic search across memory store
3. Score by relevance × recency × importance
4. Filter by token budget (2048 tokens default)
5. Format and inject into system prompt
6. Generate response with context

---

## 3. Health Timeline Dashboard

### Before
- Pure chatbot interface
- No health metrics visualization
- No data tracking
- No analytics

### After
Full health analytics dashboard with:

### Components Created
| Component | Location | Description |
|-----------|----------|-------------|
| HealthOverview | `components/dashboard/HealthOverview.tsx` | Summary cards for all tracked metrics |
| WeightChart | `components/dashboard/WeightChart.tsx` | Line chart with trend indicators |
| GlucoseChart | `components/dashboard/GlucoseChart.tsx` | Line chart with high/low reference lines |
| SleepChart | `components/dashboard/SleepChart.tsx` | Bar chart for sleep hours |
| MoodTimeline | `components/dashboard/MoodTimeline.tsx` | Area chart for mood scores |
| MedicationTracker | `components/dashboard/MedicationTracker.tsx` | Circular progress with streak |
| WeeklyInsights | `components/dashboard/WeeklyInsights.tsx` | AI-generated insight cards |

### Supported Metrics
- Weight (kg)
- Blood Glucose (mg/dL)
- HbA1c (%)
- Sleep (hours)
- Hydration (glasses)
- Mood (1-10)
- Exercise (minutes)
- Steps
- Medication adherence (%)
- Water intake (L)

### AI Insights Engine
- Weekly summary generation via AI
- Trend detection (week-over-week comparisons)
- Anomaly detection
- Motivational nudges
- Runs asynchronously, stores results in `ai_insights` collection

---

## 4. Goal Tracking System

### Before
- No goal support
- No accountability features
- No progress tracking

### After
Complete goal management system:

### Goal Types
- Weight loss, HbA1c reduction, Sleep goals, Water intake, Walking, Medication adherence, Exercise, Custom

### AI Coaching Personalities
| Style | Tone |
|-------|------|
| Strict Coach | Direct, pushes for results |
| Supportive Mentor | Encouraging, celebrates progress |
| Calm Doctor | Measured, evidence-based |
| Accountability Partner | Friendly but holds accountable |

### Features
- **Goal CRUD**: Create, read, update, delete goals
- **Progress Tracking**: Update current values, track streaks
- **Daily Evaluation**: Auto-evaluate all active goals with status (on_track / needs_attention / off_track / completed)
- **Reminder Generation**: Context-aware reminders based on streak and progress
- **Coaching Messages**: Style-appropriate feedback for each goal

### Files Created
- `components/goals/GoalCard.tsx` — Individual goal display with progress bar, streak, evaluation
- `components/goals/GoalList.tsx` — Filterable goal list (active/completed/all)
- `components/goals/GoalForm.tsx` — Modal form for goal creation with coaching style selection
- `lib/goals/engine.ts` — Goal CRUD, progress tracking, streak evaluation, coaching messages
- `lib/goals/evaluation.ts` — Per-goal evaluation, batch evaluation, reminder generation

---

## 5. Streaming AI Responses

### Before
- Blocking request/response
- Full response wait time

### After
- Server-Sent Events (SSE) streaming
- Real-time token-by-token delivery
- Client receives content as it's generated
- Final metadata (lipsync, animation, audio) sent as last event

### Implementation
```typescript
// Client requests streaming by setting Accept header
// Server returns ReadableStream of SSE events
event: { content: "partial token..." }
event: { done: true, messageId, lipsync, animation, audioBase64 }
event: [DONE]
```

### Files Modified
- `src/lib/ai/streaming.ts` — SSE stream creation utility
- `src/app/api/chat/route.ts` — Streaming support with `Accept: text/event-stream` header detection

---

## 6. Asynchronous Background Processing

### Before
- Everything ran synchronously in the request cycle
- No background tasks

### After
Memory extraction, summarization, and emotional signal detection run as fire-and-forget background tasks after the AI response is sent:

```typescript
// Response already sent to client
memoryEngine.processMessage(userId, sessionId, messageId, userMessage, aiResponse)
  .catch((e) => logger.error("Background memory processing failed", { error: e }));
```

This ensures:
- No added latency to chat responses
- Memory is built up over time
- Failures in memory don't affect the user experience

---

## 7. New API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/memories` | GET/DELETE | List and manage stored memories |
| `/api/health/metrics` | GET/POST | Log and retrieve health metrics |
| `/api/health/insights` | GET/POST/PATCH | Generate and manage AI insights |
| `/api/goals` | GET/POST/PATCH/DELETE | Full goal CRUD |
| `/api/goals/evaluate` | POST | Batch evaluate all active goals |
| `/api/dashboard` | GET/POST | Aggregated dashboard data |

---

## 8. New Data Collections

| Collection | Type | Purpose |
|------------|------|---------|
| `health_metrics` | Time-series | Health metric data points |
| `goals` | Document | Goal definitions |
| `goal_progress` | Document | Daily goal progress logs |
| `memories` | Document + Vector | Memory documents with embeddings |
| `memory_summaries` | Document | Session summaries |
| `ai_insights` | Document | Generated health insights |
| `vector_store` | Document | Generic vector storage |

---

## 9. Type System Expansion

### New Type Files
- `src/types/memory.ts` — MemoryDocument, MemoryExtractionResult, EmotionalSignal, SessionSummary
- `src/types/health.ts` — HealthMetric, MetricType, DashboardData, AIInsight, METRIC_DEFINITIONS
- `src/types/goals.ts` — Goal, GoalProgress, GoalEvaluation, CoachingStyle, ReminderConfig

### Updated Models
- `User` — Added `coachingStyle`, `onboardingCompleted`, `lastActiveAt`
- `Session` — Added `title`, `summary`, `messageCount`
- `Message` — Added `audioBase64`, `lipsync`, `animation`, `facialExpression`, `tokenCount`

---

## 10. Infrastructure & Quality

### Observability
- `src/lib/observability/logging.ts` — Timed logging with duration tracking, log buffering, structured context

### Error Handling
- All API routes wrap in try/catch with descriptive error messages
- Background task failures are caught and logged (never crash the request)

### Security
- API keys remain server-side
- All database queries use ObjectId validation
- Rate limiting ready (middleware layer)

### Dependencies Added
- `openai` — OpenRouter API client
- `recharts` — Dashboard charts
- `date-fns` — Date manipulation

---

## File Change Summary

### Created (37 files)
```
src/types/memory.ts
src/types/health.ts
src/types/goals.ts
src/lib/ai/client.ts
src/lib/ai/models.ts
src/lib/ai/prompts.ts
src/lib/ai/streaming.ts
src/lib/memory/types.ts
src/lib/memory/embeddings.ts
src/lib/memory/engine.ts
src/lib/memory/extraction.ts
src/lib/memory/retrieval.ts
src/lib/memory/summarization.ts
src/lib/db/mongodb.ts
src/lib/db/vector-store.ts
src/lib/goals/engine.ts
src/lib/goals/evaluation.ts
src/lib/health/insights.ts
src/lib/observability/logging.ts
src/components/dashboard/WeightChart.tsx
src/components/dashboard/GlucoseChart.tsx
src/components/dashboard/SleepChart.tsx
src/components/dashboard/MoodTimeline.tsx
src/components/dashboard/MedicationTracker.tsx
src/components/dashboard/WeeklyInsights.tsx
src/components/dashboard/HealthOverview.tsx
src/components/goals/GoalCard.tsx
src/components/goals/GoalList.tsx
src/components/goals/GoalForm.tsx
src/components/memory/MemoryIndicator.tsx
src/app/dashboard/page.tsx
src/app/api/memories/route.ts
src/app/api/health/metrics/route.ts
src/app/api/health/insights/route.ts
src/app/api/goals/route.ts
src/app/api/goals/evaluate/route.ts
src/app/api/dashboard/route.ts
```

### Modified (9 files)
```
src/types/models.ts             — Extended User, Session, Message models
src/store/useStore.ts           — Added showDashboard, coachingStyle
src/app/page.tsx                — Dashboard routing
src/components/Header.tsx       — Dashboard button, memory indicator
src/app/api/chat/route.ts       — OpenRouter, memory, streaming
src/app/api/profile/route.ts    — coachingStyle support, updated imports
src/app/api/session/route.ts    — Updated imports
.env                            — OpenRouter env vars
README.md                       — V2 documentation
```
