"use client";

import { motion } from "framer-motion";
import { Target, Flame, Trophy, User } from "lucide-react";
import Link from "next/link";

const goals = [
  { label: "Weight Loss", current: 5, target: 10, unit: "kg", streak: 12 },
  { label: "HbA1c", current: 6.2, target: 5.7, unit: "%", streak: 8 },
  { label: "Sleep", current: 7.2, target: 8, unit: "hours", streak: 5 },
  { label: "Hydration", current: 2.0, target: 2.5, unit: "L", streak: 14 },
];

const coaches = [
  { style: "Strict Coach", desc: "No excuses. Push harder.", icon: Trophy },
  { style: "Calm Doctor", desc: "Evidence-based guidance.", icon: User },
  { style: "Supportive Mentor", desc: "Progress over perfection.", icon: Target },
  { style: "Accountability Partner", desc: "I've got your back.", icon: Flame },
];

export default function GoalTrackingSection() {
  return (
    <section className="py-28 bg-white dark:bg-[#0a0a0a]" id="goals">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase">Goal Tracking</span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-black dark:text-white mt-3">
            Your AI Keeps You <span className="text-emerald-600 dark:text-emerald-400">Accountable</span>
          </h2>
        </motion.div>

        {/* Goal cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-16">
          {goals.map((goal, i) => {
            const pct = Math.min(100, (goal.current / goal.target) * 100);
            return (
              <motion.div
                key={goal.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="p-5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-black dark:text-white">{goal.label}</span>
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <Flame size={12} />
                    <span className="text-xs font-medium">{goal.streak}d</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-2xl font-semibold text-black dark:text-white">{goal.current}</span>
                  <span className="text-xs text-gray-400">/ {goal.target} {goal.unit}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.1 + 0.3, ease: "easeOut" }}
                    className="h-full bg-black dark:bg-white rounded-full"
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs text-gray-400">{Math.round(pct)}% complete</span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">On track</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Coaching personalities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h4 className="text-sm font-semibold text-black dark:text-white text-center mb-6">Choose Your Coaching Personality</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {coaches.map((coach) => (
              <div
                key={coach.style}
                className="p-4 rounded-xl border border-gray-200 dark:border-white/10 text-center hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-colors"
              >
                <coach.icon size={20} className="mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
                <h5 className="text-sm font-semibold text-black dark:text-white mb-1">{coach.style}</h5>
                <p className="text-xs text-gray-500 dark:text-gray-400">{coach.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
