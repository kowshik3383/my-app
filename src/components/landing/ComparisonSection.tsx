"use client";

import { motion } from "framer-motion";
import { X, Check, ArrowRight } from "lucide-react";
import Link from "next/link";

const traditional = [
  "Forgets conversations instantly",
  "No memory of your health history",
  "No health tracking capabilities",
  "Reactive — waits for you to ask",
  "No accountability or coaching",
];

const companion = [
  "Long-term persistent memory",
  "Emotional intelligence & empathy",
  "Comprehensive health analytics",
  "Proactive insights & coaching",
  "Goal accountability & streaks",
];

export default function ComparisonSection() {
  return (
    <section className="py-28 bg-[#fafafa]" id="features">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest text-[#999999] uppercase">Not Just a Chatbot</span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111] mt-4">
            A Health Operating System
          </h2>
          <p className="text-sm text-[#666666] mt-3 max-w-xl mx-auto">
            Traditional AI chatbots are stateless. Health OS is built around you — with memory, intelligence, and purpose.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-[#e5e5e5] bg-white p-8"
          >
            <h3 className="text-sm font-semibold text-[#999999] mb-6 tracking-tight">
              Traditional AI Chatbots
            </h3>
            <ul className="space-y-4">
              {traditional.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-[#888888]">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#f5f5f5] flex items-center justify-center">
                    <X size={11} className="text-[#999999]" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-2xl border border-[#111111] bg-[#111111] p-8 relative"
          >
            <div className="absolute -top-3 right-6 px-3 py-1 text-xs font-semibold bg-white text-[#111111] rounded-full">
              Health OS
            </div>
            <h3 className="text-sm font-semibold text-white/70 mb-6 tracking-tight">
              Your Personal Health OS
            </h3>
            <ul className="space-y-4">
              {companion.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-white/90">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                    <Check size={11} className="text-white" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-10"
        >
          <Link
            href="/app"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#444444] hover:text-[#111111] transition-colors"
          >
            Experience the difference <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
