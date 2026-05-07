"use client";

import { motion } from "framer-motion";
import {
  Brain, Heart, BarChart3, Mic, Zap, Clock,
  Target, Globe, Shield, Network, Search, Sparkles,
} from "lucide-react";

const features = [
  { icon: Brain, label: "Persistent Memory", desc: "Never forgets who you are" },
  { icon: Heart, label: "Emotional Intelligence", desc: "Understands how you feel" },
  { icon: BarChart3, label: "AI Insights", desc: "Actionable health patterns" },
  { icon: Mic, label: "Voice Conversations", desc: "Talk naturally with AI" },
  { icon: Zap, label: "Streaming Responses", desc: "Real-time AI replies" },
  { icon: Clock, label: "Health Timeline", desc: "Your complete history" },
  { icon: Target, label: "Smart Goals", desc: "AI-powered accountability" },
  { icon: Globe, label: "Multilingual AI", desc: "5 Indian languages" },
  { icon: Shield, label: "Secure Data", desc: "Private by design" },
  { icon: Network, label: "OpenRouter AI", desc: "Best model for each task" },
  { icon: Search, label: "Vector Search", desc: "Semantic memory retrieval" },
  { icon: Sparkles, label: "AI Coaching", desc: "4 coaching personalities" },
];

export default function FeaturesGrid() {
  return (
    <section className="py-28 bg-gray-50 dark:bg-[#0d0d0d]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase">Everything You Need</span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-black dark:text-white mt-3">
            A Complete Health OS
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {features.map((feat, i) => (
            <motion.div
              key={feat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="group p-5 rounded-xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 hover:border-emerald-200 dark:hover:border-emerald-800/50 hover:shadow-sm transition-all"
            >
              <feat.icon size={18} className="text-emerald-600 dark:text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="text-sm font-semibold text-black dark:text-white mb-1">{feat.label}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
