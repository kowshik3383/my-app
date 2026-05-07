"use client";

import { motion } from "framer-motion";
import { ArrowDown, Cpu, Globe, Layers, Zap, Shield, Network } from "lucide-react";

const layers = [
  { icon: Globe, label: "Frontend", desc: "Next.js · React 19 · Tailwind · Three.js", color: "text-emerald-600 dark:text-emerald-400" },
  { icon: Layers, label: "API Layer", desc: "Next.js App Router · Serverless · REST", color: "text-cyan-600 dark:text-cyan-400" },
  { icon: Cpu, label: "AI Orchestration", desc: "Model routing · Memory pipeline · Embeddings", color: "text-indigo-600 dark:text-indigo-400" },
  { icon: Zap, label: "OpenRouter", desc: "GPT-4o-mini · Claude 3.5 · Mistral · Fallbacks", color: "text-amber-600 dark:text-amber-400" },
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
    <section className="py-28 bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase">AI Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-black dark:text-white mt-3">
            Built Like a Real AI System
          </h2>
        </motion.div>

        {/* Architecture diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto mb-16"
        >
          {layers.map((layer, i) => (
            <div key={layer.label}>
              <div className="flex items-center gap-4 p-5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                  <layer.icon size={18} className={layer.color} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-black dark:text-white">{layer.label}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{layer.desc}</p>
                </div>
              </div>
              {i < layers.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowDown size={14} className="text-gray-300 dark:text-gray-600" />
                </div>
              )}
            </div>
          ))}
        </motion.div>

        {/* Feature list */}
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
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-300">{feat}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
