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
    <section className="py-28 bg-[#fafafa]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest text-[#999999] uppercase">Everything You Need</span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111] mt-4">
            A Complete Health OS
          </h2>
          <p className="text-sm text-[#666666] mt-3 max-w-xl mx-auto">
            Every feature you need to understand and improve your health, powered by AI.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {features.map((feat, i) => (
            <motion.div
              key={feat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="group p-5 rounded-2xl bg-white border border-[#e5e5e5] hover:shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:border-[#d4d4d4] transition-all duration-300"
            >
              <div className="w-9 h-9 rounded-lg bg-[#f5f5f5] flex items-center justify-center mb-3 group-hover:bg-[#e5e5e5] transition-colors">
                <feat.icon size={16} className="text-[#444444]" />
              </div>
              <h4 className="text-sm font-semibold text-[#111111] mb-1">{feat.label}</h4>
              <p className="text-xs text-[#888888]">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
