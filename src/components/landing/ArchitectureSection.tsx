"use client";

import { motion } from "framer-motion";
import { ArrowDown, Cpu, Globe, Layers, Zap } from "lucide-react";

const layers = [
  { icon: Globe, label: "Frontend", desc: "Next.js · React 19 · Tailwind · Three.js" },
  { icon: Layers, label: "API Layer", desc: "Next.js App Router · Serverless · REST" },
  { icon: Cpu, label: "AI Orchestration", desc: "Model routing · Memory pipeline · Embeddings" },
  { icon: Zap, label: "OpenRouter", desc: "GPT-4o-mini · Claude 3.5 · Mistral · Fallbacks" },
];

const features = [
  "Multi-model routing for cost optimization",
  "Automatic fallback providers",
  "Streaming responses via SSE",
  "Async memory pipeline",
  "Semantic retrieval & vector embeddings",
  "Token-budgeted context management",
];

export default function ArchitectureSection() {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest text-[#999999] uppercase">AI Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111] mt-4">
            Built Like a Real AI System
          </h2>
          <p className="text-sm text-[#666666] mt-3 max-w-xl mx-auto">
            Production-grade architecture with intelligent model routing and persistent memory pipelines.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto mb-16"
        >
          {layers.map((layer, i) => (
            <div key={layer.label}>
              <div className="flex items-center gap-4 p-5 rounded-2xl border border-[#e5e5e5] bg-white hover:shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-[#f5f5f5] flex items-center justify-center flex-shrink-0">
                  <layer.icon size={18} className="text-[#444444]" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#111111]">{layer.label}</h4>
                  <p className="text-xs text-[#888888]">{layer.desc}</p>
                </div>
              </div>
              {i < layers.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowDown size={14} className="text-[#d4d4d4]" />
                </div>
              )}
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            {features.map((feat) => (
              <div key={feat} className="flex items-center gap-3 p-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#111111] flex-shrink-0" />
                <span className="text-sm text-[#666666]">{feat}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
