# 🏥 AI Health Companion

A full-stack Next.js AI health companion with voice conversation, multilingual support, and personalized wellness guidance.

## ✨ Features

- 🎤 **Voice Conversation**: Speech-to-text input using Web Speech API
- 💬 **Text Chat**: Real-time messaging with AI
- 🗣️ **AI Voice Responses**: Text-to-speech using ElevenLabs
- 🌍 **Multilingual**: Support for English, Hindi, Tamil, Telugu, Bengali
- 👨‍👩‍👧 **Personality Modes**: Choose from Mother, Father, Doctor, Coach, etc.
- ⚙️ **Customizable AI Behavior**: Adjust communication style and health focus
- 🗄️ **MongoDB Backend**: Persistent storage with native MongoDB driver
- 🧠 **Powered by Gemini AI**: Advanced conversational intelligence

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- MongoDB (local or cloud instance)
- Gemini API key (from Google AI Studio)
- ElevenLabs API key (optional, for voice responses)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd my-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="mongodb://localhost:27017/health-companion"
   # Or for MongoDB Atlas:
   # DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/health-companion"

   # AI Services
   GEMINI_API_KEY="your-gemini-api-key-here"
   ELEVENLABS_API_KEY="your-elevenlabs-api-key-here"

   # App Configuration
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Tech Stack

### Frontend
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Zustand** (State Management)
- **Lucide React** (Icons)
- **React Hot Toast** (Notifications)

### Backend
- **Next.js API Routes**
- **MongoDB Native Driver**
- **MongoDB** (Database)

### AI & Voice
- **Google Generative AI (Gemini)** - AI Brain
- **ElevenLabs** - Text-to-Speech
- **Web Speech API** - Speech-to-Text

## 🏗️ Project Structure

```
my-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/           # Chat endpoint
│   │   │   ├── profile/        # User profile management
│   │   │   ├── session/        # Session management
│   │   │   └── voice/          # Voice generation
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Main page
│   ├── components/
│   │   ├── Chat.tsx            # Main chat interface
│   │   ├── ChatInput.tsx       # Text/voice input
│   │   ├── ChatMessage.tsx     # Message component
│   │   ├── Header.tsx          # App header
│   │   ├── Onboarding.tsx      # Onboarding flow
│   │   └── SettingsPanel.tsx   # Settings modal
│   ├── hooks/
│   │   └── useVoiceRecording.ts # Voice recording hook
│   ├── lib/
│   │   ├── mongodb.ts          # MongoDB client
│   │   ├── gemini.ts           # Gemini AI integration
│   │   └── elevenlabs.ts       # ElevenLabs integration
│   ├── store/
│   │   └── useStore.ts         # Zustand store
│   └── types/
│       └── models.ts           # TypeScript data models
└── public/                     # Static assets
```

## 🎯 Features Breakdown

### Onboarding Flow
Users select:
1. **AI Role**: Mother, Father, Doctor, Coach, etc.
2. **Communication Style**: Soft & Caring, Strict, Professional, etc.
3. **Language**: English, Hindi, Tamil, Telugu, Bengali
4. **Health Focus**: Diabetes, Heart Health, Weight Loss, PCOS, etc.

### Chat Interface
- Real-time text messaging
- Voice input with Web Speech API
- AI voice responses (optional)
- Message history
- Auto-scroll to latest message

### Settings
- Update AI personality anytime
- Change language preference
- Modify health focus area
- Customize AI behavior

## 🔑 API Endpoints

### POST `/api/profile`
Create user profile with AI preferences

### PUT `/api/profile`
Update user profile

### GET `/api/profile?userId={id}`
Get user profile

### POST `/api/session`
Create new chat session

### GET `/api/session?sessionId={id}`
Get session with messages

### POST `/api/chat`
Send message and get AI response

### POST `/api/voice`
Generate voice from text

## 🎨 Customization

### Adding New Languages
1. Update `Language` type in `src/store/useStore.ts`
2. Add language option in `src/components/Onboarding.tsx`
3. Update `languageNames` in `src/lib/gemini.ts`

### Adding New AI Roles
1. Update `AIRole` type in `src/store/useStore.ts`
2. Add role option in `src/components/Onboarding.tsx`
3. Update `rolePrompts` in `src/lib/gemini.ts`

### Customizing AI Voice
Modify `VOICE_IDS` in `src/lib/elevenlabs.ts` to use different ElevenLabs voices.

## 📝 Database Schema

- **User**: Stores user profile and AI preferences
- **Session**: Chat sessions
- **Message**: Individual messages with optional audio URLs

## 🛡️ Security Notes

- API keys are stored server-side only
- All AI interactions happen through Next.js API routes
- No exposed backend URLs to the client
- Environment variables required for deployment

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### MongoDB Atlas Setup
1. Create cluster at [mongodb.com](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Update `DATABASE_URL` in environment variables
4. The MongoDB collections will be created automatically when the app runs

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Gemini AI, and ElevenLabs
