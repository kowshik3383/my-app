const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const siteConfig = {
  name: "Health OS",
  tagline: "Your AI Health Companion",
  description:
    "Track your health, emotions, goals, sleep, habits, and progress with an AI companion that actually remembers you. Persistent memory, emotional intelligence, voice conversations, and proactive coaching.",
  url: BASE_URL,
  ogImage: `${BASE_URL}/avatar.png`,
  creator: "Health OS",
  appName: "Health OS — AI Health Companion",
  keywords: [
    "AI health companion",
    "AI health coach",
    "AI therapist",
    "AI wellness assistant",
    "AI doctor assistant",
    "AI avatar health assistant",
    "health tracking AI",
    "memory AI assistant",
    "emotional AI companion",
    "AI accountability coach",
    "AI goal tracking",
    "diabetes AI assistant",
    "HbA1c tracking app",
    "sleep tracking AI",
    "health operating system",
    "AI life OS",
    "AI habit tracker",
    "AI health dashboard",
    "conversational health AI",
    "AI wellness platform",
    "proactive AI companion",
    "health analytics dashboard",
    "AI health tracking",
    "persistent memory AI",
    "health goal tracker",
  ],
  language: "en",
  locale: "en_US",
  twitterHandle: "@healthos",
  category: "health",
};

export const keywordsConfig = {
  primary: [
    "AI health companion",
    "AI health coach",
    "health operating system",
    "AI wellness platform",
    "persistent memory AI",
  ],
  secondary: [
    "AI therapist",
    "AI wellness assistant",
    "health tracking AI",
    "emotional AI companion",
    "AI accountability coach",
    "AI goal tracking",
    "AI health dashboard",
    "conversational health AI",
  ],
  longTail: [
    "AI health companion with persistent memory",
    "AI-powered health tracking and coaching platform",
    "multilingual AI health assistant for diabetes",
    "AI health coach with emotional intelligence",
    "proactive AI companion for health goals",
  ],
  lsi: [
    "HbA1c tracking app",
    "sleep tracking AI",
    "diabetes AI assistant",
    "AI habit tracker",
    "AI life OS",
    "health analytics dashboard",
    "AI doctor assistant",
    "AI avatar health assistant",
  ],
  clusters: {
    health_ai: {
      primary: ["AI health companion", "AI health coach", "AI wellness assistant"],
      secondary: ["health tracking AI", "AI health dashboard", "conversational health AI"],
      lsi: ["proactive AI companion", "AI wellness platform", "emotional AI companion"],
    },
    memory: {
      primary: ["persistent memory AI", "memory AI assistant"],
      secondary: ["AI that remembers you", "long-term memory AI"],
      lsi: ["contextual AI memory", "semantic memory retrieval"],
    },
    goals: {
      primary: ["AI accountability coach", "AI goal tracking"],
      secondary: ["AI habit tracker", "health goal tracker"],
      lsi: ["AI coaching personalities", "smart health goals"],
    },
    health_tracking: {
      primary: ["health operating system", "health analytics dashboard"],
      secondary: ["HbA1c tracking app", "sleep tracking AI"],
      lsi: ["blood glucose tracking", "weight tracking AI", "mood tracking AI"],
    },
    diabetes: {
      primary: ["diabetes AI assistant", "HbA1c tracking app"],
      secondary: ["blood glucose monitoring AI", "diabetes management app"],
      lsi: ["HbA1c reduction goals", "glucose tracking dashboard"],
    },
    multilingual: {
      primary: ["multilingual AI health assistant"],
      secondary: ["AI health companion Hindi", "AI health assistant Tamil"],
      lsi: ["5 Indian languages AI", "regional language health AI"],
    },
    avatar: {
      primary: ["AI avatar health assistant"],
      secondary: ["3D health avatar", "AI companion with avatar"],
      lsi: ["lifelike AI avatar", "animated health assistant"],
    },
  },
};

export const robotsConfig = {
  allowBots: [
    "Googlebot",
    "Bingbot",
    "GPTBot",
    "ChatGPT-User",
    "ClaudeBot",
    "PerplexityBot",
    "Google-Extended",
    "anthropic-ai",
    "CCBot",
    "Amazonbot",
  ],
  disallowPaths: [
    "/api/",
    "/app/",
    "/test-cartesia/",
    "/_next/",
  ],
};

export const sitemapConfig = {
  publicRoutes: [
    { path: "/", priority: 1.0, changefreq: "weekly" as const },
    { path: "/demo", priority: 0.6, changefreq: "monthly" as const },
  ],
  privateRoutes: ["/app", "/dashboard", "/goals"],
  blockedRoutes: ["/test-cartesia", "/api"],
};

export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
