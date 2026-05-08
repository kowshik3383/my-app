"use client";

import { motion } from "framer-motion";
import { Brain, Heart, Database, Activity, Clock, Network } from "lucide-react";

const memories = [
  { icon: Brain, label: "Episodic Memory", desc: "Remembers past conversations and context across sessions" },
  { icon: Heart, label: "Emotional Memory", desc: "Understands your emotional patterns and triggers" },
  { icon: Database, label: "Health Facts", desc: "Stores your health metrics, conditions, and history" },
  { icon: Activity, label: "Behavioral Patterns", desc: "Learns your habits, routines, and lifestyle" },
  { icon: Clock, label: "Session Summaries", desc: "Summarizes every interaction for continuity" },
  { icon: Network, label: "Semantic Recall", desc: "Finds relevant memories instantly using vector search" },
];

const examples = [
  "Last week you mentioned poor sleep after late dinners.",
  "Your glucose spikes tend to happen around 2 hours after meals.",
  "You've completed your hydration goal 5 days in a row.",
];

export default function MemorySection() {
  return (
    <section className="py-28 bg-white" id="memory">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest text-[#999999] uppercase">Long-Term Memory Engine</span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111] mt-4">
            An AI That Remembers Your Life
          </h2>
          <p className="text-sm text-[#666666] mt-3 max-w-xl mx-auto">
            Every conversation builds a richer understanding of who you are, how you feel, and what you need.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {memories.map((mem, i) => (
            <motion.div
              key={mem.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group p-6 rounded-2xl border border-[#e5e5e5] bg-white hover:shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-[#f5f5f5] flex items-center justify-center mb-4 group-hover:bg-[#e5e5e5] transition-colors">
                <mem.icon size={18} className="text-[#444444]" />
              </div>
              <h4 className="text-sm font-semibold text-[#111111] mb-1.5">{mem.label}</h4>
              <p className="text-sm text-[#666666] leading-relaxed">{mem.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <h4 className="text-sm font-semibold text-[#111111] text-center mb-6">Real Examples of Memory in Action</h4>
          <div className="space-y-3">
            {examples.map((ex, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 + 0.3 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#e5e5e5] flex items-center justify-center text-xs text-[#444444] font-semibold">
                  {i + 1}
                </span>
                <p className="text-sm text-[#444444]">{ex}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 p-8 rounded-2xl border border-[#e5e5e5] bg-[#fafafa]"
        >
          <div className="flex items-center justify-between overflow-x-auto pb-2 gap-4">
            {["Day 1", "Day 3", "Day 7", "Day 14", "Day 30", "Day 60"].map((day, i) => (
              <div key={day} className="flex flex-col items-center gap-2 flex-shrink-0 min-w-[80px]">
                <div className={`w-3 h-3 rounded-full ${i < 4 ? "bg-[#111111]" : "bg-[#d4d4d4]"}`} />
                <span className="text-xs text-[#888888]">{day}</span>
                {i < 4 && (
                  <span className="text-[10px] text-[#444444] font-medium whitespace-nowrap text-center">
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
