"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Brain, Heart, Activity, Moon, Target, Sparkles } from "lucide-react";
import Link from "next/link";

const HeroAvatar = dynamic(() => import("@/components/landing/HeroAvatar"), {
  ssr: false,
  loading: () => (
    <div className="w-72 h-72 lg:w-80 lg:h-80 rounded-full bg-[#f5f5f5] flex items-center justify-center">
      <div className="w-56 h-56 lg:w-64 lg:h-64 rounded-full bg-white shadow-inner flex items-center justify-center">
        <span className="text-6xl select-none text-[#111]">◆</span>
      </div>
    </div>
  ),
});

const floatingCards = [
  { icon: Heart, label: "Mood", value: "8.5", x: "8%", y: "18%", delay: 0 },
  { icon: Activity, label: "Glucose", value: "112", x: "76%", y: "12%", delay: 0.3 },
  { icon: Moon, label: "Sleep", value: "7.2h", x: "80%", y: "52%", delay: 0.6 },
  { icon: Target, label: "Streak", value: "5d", x: "6%", y: "58%", delay: 0.9 },
];

const chatBubbles = [
  "I noticed your sleep has been inconsistent this week...",
  "Your glucose levels are looking stable today!",
];

const trustBadges = [
  "OpenRouter Powered",
  "Persistent Memory",
  "Voice Enabled",
  "Private & Secure",
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-gradient-to-br from-[#f5f5f5] to-transparent rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-gradient-to-tl from-[#f5f5f5] to-transparent rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#666666] bg-[#f5f5f5] rounded-full mb-6">
                <Sparkles size={12} />
                AI Health Companion V2
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#111111] leading-[1.05] mb-5">
                Your AI Health Companion That{" "}
                <span className="underline decoration-[#d4d4d4] underline-offset-8 decoration-2">
                  Actually Remembers
                </span>{" "}
                You.
              </h1>
              <p className="text-base sm:text-lg text-[#666666] leading-relaxed max-w-lg mb-8">
                A persistent memory system that learns your health, emotions, and goals — and evolves with you over time.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Link
                  href="/app"
                  className="px-6 py-3 text-sm font-medium bg-[#111111] text-white rounded-full hover:bg-[#1a1a1a] transition-all duration-200"
                >
                  Start Free
                </Link>
                <Link
                  href="/app"
                  className="px-6 py-3 text-sm font-medium text-[#444444] bg-[#f5f5f5] rounded-full hover:bg-[#e5e5e5] transition-all duration-200"
                >
                  Talk To Your AI
                </Link>
              </div>

              <div className="flex flex-wrap gap-2">
                {trustBadges.map((badge) => (
                  <span
                    key={badge}
                    className="px-3 py-1 text-xs text-[#888888] bg-[#fafafa] rounded-full border border-[#e5e5e5]"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="relative h-[500px] lg:h-[600px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 lg:w-80 lg:h-80"
            >
              <img
                src="/avatar.png"
                alt="AI Health Companion"
                className="w-full h-full rounded-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 rounded-full border border-[#d4d4d4]/50 animate-ping pointer-events-none" style={{ animationDuration: "3s" }} />
              <div className="absolute inset-[-20px] rounded-full border border-[#d4d4d4]/30 animate-ping pointer-events-none" style={{ animationDuration: "4s", animationDelay: "1s" }} />
            </motion.div>

            <div className="absolute top-[5%] left-[3%] space-y-2 max-w-[200px]">
              {chatBubbles.map((text, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.5 + i * 0.3 }}
                  className="bg-white rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e5e5e5]"
                >
                  <p className="text-xs text-[#444444] leading-relaxed">{text}</p>
                </motion.div>
              ))}
            </div>

            {floatingCards.map((card) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: card.delay + 0.8, ease: "easeOut" }}
                className="absolute hidden lg:flex items-center gap-3 px-4 py-2.5 bg-white/95 backdrop-blur-sm rounded-xl border border-[#e5e5e5] shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                style={{ left: card.x, top: card.y }}
              >
                <card.icon size={14} className="text-[#888888]" />
                <div>
                  <span className="text-xs text-[#888888]">{card.label}</span>
                  <span className="text-sm font-semibold text-[#111111] ml-2">{card.value}</span>
                </div>
              </motion.div>
            ))}

            <div className="absolute bottom-[20%] right-[8%] flex items-end gap-1">
              {[12, 20, 8, 28, 16, 24, 10, 18].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: h }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.1 + 1.5,
                    ease: "easeOut",
                    repeat: Infinity,
                    repeatType: "reverse",
                    repeatDelay: 3,
                  }}
                  className="w-1.5 bg-[#d4d4d4] rounded-full"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
