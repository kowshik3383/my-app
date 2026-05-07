"use client";

import { motion } from "framer-motion";
import { X, Check, ArrowRight } from "lucide-react";
import Link from "next/link";

const traditional = [
  "Forget conversations",
  "No memory of you",
  "No health tracking",
  "Reactive only",
  "No accountability",
];

const companion = [
  "Long-term memory",
  "Emotional intelligence",
  "Health analytics",
  "Proactive coaching",
  "Goal accountability",
];

export default function ComparisonSection() {
  return (
    <section className="py-28 bg-gray-50 dark:bg-[#0d0d0d]" id="features">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase">Not Just A Chatbot</span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-black dark:text-white mt-3">
            This Is a Health Operating System
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Traditional */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#141414] p-8"
          >
            <h3 className="text-lg font-semibold text-gray-400 dark:text-gray-500 mb-6">
              Traditional AI Chatbots
            </h3>
            <ul className="space-y-4">
              {traditional.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <X size={11} className="text-red-500" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Companion */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-8 relative"
          >
            <div className="absolute -top-3 right-6 px-3 py-1 text-xs font-semibold bg-emerald-500 text-white rounded-full">
              AI Health Companion V2
            </div>
            <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
              Your Personal Health OS
            </h3>
            <ul className="space-y-4">
              {companion.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <Check size={11} className="text-emerald-600 dark:text-emerald-400" />
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
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Experience the difference <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
