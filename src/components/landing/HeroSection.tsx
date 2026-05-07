"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Brain, Heart, Activity, Moon, Target, Sparkles } from "lucide-react";
import Link from "next/link";

const HeroAvatar = dynamic(() => import("@/components/landing/HeroAvatar"), {
  ssr: false,
  loading: () => (
    <div className="w-72 h-72 lg:w-80 lg:h-80 rounded-full bg-gradient-to-br from-emerald-100 via-cyan-50 to-indigo-100 dark:from-emerald-900/30 dark:via-cyan-900/20 dark:to-indigo-900/30 flex items-center justify-center">
      <div className="w-56 h-56 lg:w-64 lg:h-64 rounded-full bg-white dark:bg-[#141414] shadow-inner flex items-center justify-center">
        <span className="text-6xl select-none">◆</span>
      </div>
    </div>
  ),
});

const floatingCards = [
  { icon: Heart, label: "Mood: 8.5", x: "15%", y: "20%", delay: 0 },
  { icon: Activity, label: "Glucose: 112", x: "75%", y: "15%", delay: 0.3 },
  { icon: Moon, label: "Sleep: 7.2h", x: "80%", y: "55%", delay: 0.6 },
  { icon: Target, label: "Streak: 5d", x: "10%", y: "60%", delay: 0.9 },
  { icon: Brain, label: "Memory Active", x: "50%", y: "10%", delay: 1.2 },
  { icon: Sparkles, label: "Insight Ready", x: "20%", y: "75%", delay: 1.5 },
];

const trustBadges = [
  "OpenRouter Powered",
  "Real-Time AI",
  "Persistent Memory",
  "Voice Enabled",
  "Secure & Private",
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white dark:bg-[#0a0a0a]">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-200/30 dark:bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-200/20 dark:bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-indigo-200/15 dark:bg-indigo-500/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/30 rounded-full mb-6">
                <Sparkles size={12} />
                AI Health Companion V2
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-black dark:text-white leading-[1.1] mb-5">
                Your AI Health Companion That{" "}
                <span className="text-emerald-600 dark:text-emerald-400">
                  Actually Remembers
                </span>{" "}
                You.
              </h1>
              <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg mb-8">
                Track your health, emotions, goals, sleep, habits, and progress
                with an AI that evolves with you over time.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Link
                  href="/app"
                  className="px-6 py-3 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-full hover:opacity-85 transition-all"
                >
                  Start Free
                </Link>
                <Link
                  href="/app"
                  className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-white/10 rounded-full hover:bg-gray-200 dark:hover:bg-white/15 transition-all"
                >
                  Talk To Your AI
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-2">
                {trustBadges.map((badge) => (
                  <span
                    key={badge}
                    className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: 3D Avatar + Floating Cards */}
          <div className="relative h-[500px] lg:h-[600px]">
            {/* Avatar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 lg:w-80 lg:h-80"
            >
              <img
                src="/avatar.png"
                alt="AI Health Companion"
                className="h-[300px] w-[600px] rounded-full"
                draggable={false}
              />{" "}
              {/* Pulse rings */}
              <div
                className="absolute inset-0 rounded-full border border-emerald-200/50 dark:border-emerald-500/20 animate-ping pointer-events-none"
                style={{ animationDuration: "3s" }}
              />
              <div
                className="absolute inset-[-20px] rounded-full border border-emerald-100/30 dark:border-emerald-500/10 animate-ping pointer-events-none"
                style={{ animationDuration: "4s", animationDelay: "1s" }}
              />
            </motion.div>

            {/* Floating cards */}
            {floatingCards.map((card) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: card.delay + 0.5,
                  ease: "easeOut",
                }}
                className="absolute hidden lg:flex items-center gap-2 px-3.5 py-2 bg-white/90 dark:bg-[#141414]/90 backdrop-blur-lg rounded-xl border border-gray-200/50 dark:border-white/10 shadow-sm"
                style={{ left: card.x, top: card.y }}
              >
                <card.icon
                  size={14}
                  className="text-emerald-600 dark:text-emerald-400"
                />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                  {card.label}
                </span>
              </motion.div>
            ))}

            {/* Waveform bars */}
            <div className="absolute bottom-[15%] left-[10%] flex items-end gap-1">
              {[12, 20, 8, 28, 16, 24, 10, 18].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: h }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.1 + 1,
                    ease: "easeOut",
                    repeat: Infinity,
                    repeatType: "reverse",
                    repeatDelay: 2,
                  }}
                  className="w-1.5 bg-emerald-400/40 dark:bg-emerald-500/30 rounded-full"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
