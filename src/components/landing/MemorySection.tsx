"use client";

import { motion } from "framer-motion";
import { Brain, Heart, Database, Activity, Clock, Network } from "lucide-react";

const memories = [
  { icon: Brain, label: "Episodic Memory", desc: "Remembers past conversations and context" },
  { icon: Heart, label: "Emotional Memory", desc: "Understands your emotional patterns" },
  { icon: Database, label: "Health Facts", desc: "Stores your health metrics and history" },
  { icon: Activity, label: "Behavioral Patterns", desc: "Learns your habits and routines" },
  { icon: Clock, label: "Session Summaries", desc: "Summarizes every interaction" },
  { icon: Network, label: "Semantic Retrieval", desc: "Finds relevant memories instantly" },
];

const examples = [
  "Last week you mentioned poor sleep after late dinners.",
  "Your glucose spikes tend to happen around 2 hours after meals.",
  "You've completed your hydration goal 5 days in a row.",
];

export default function MemorySection() {
  return (
    <section className="py-28 bg-white dark:bg-[#0a0a0a]" id="memory">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase">Persistent Memory</span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-black dark:text-white mt-3">
            An AI That <span className="text-emerald-600 dark:text-emerald-400">Remembers</span> Your Life
          </h2>
        </motion.div>

        {/* Memory architecture */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {memories.map((mem, i) => (
            <motion.div
              key={mem.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="p-5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-colors"
            >
              <mem.icon size={18} className="text-emerald-600 dark:text-emerald-400 mb-3" />
              <h4 className="text-sm font-semibold text-black dark:text-white mb-1">{mem.label}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{mem.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Realistic examples */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <h4 className="text-sm font-semibold text-black dark:text-white text-center mb-6">Real examples of memory in action</h4>
          <div className="space-y-3">
            {examples.map((ex, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 + 0.5 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-700 dark:text-gray-200">{ex}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Memory timeline visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 p-8 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]"
        >
          <div className="flex items-center gap-8 overflow-x-auto pb-2">
            {["Day 1", "Day 3", "Day 7", "Day 14", "Day 30", "Day 60"].map((day, i) => (
              <div key={day} className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className={`w-3 h-3 rounded-full ${i < 4 ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}`} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{day}</span>
                {i < 4 && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">
                    {["First session", "Learned your name", "Identified sleep pattern", "Built health profile"][i]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
