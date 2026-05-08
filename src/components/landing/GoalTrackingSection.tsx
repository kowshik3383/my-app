"use client";

import { motion } from "framer-motion";
import { Target, Flame, Trophy, User } from "lucide-react";

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

function ProgressRing({ percentage }: { percentage: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="transform -rotate-90">
      <circle cx="32" cy="32" r={radius} fill="none" stroke="#e5e5e5" strokeWidth="4" />
      <motion.circle
        cx="32" cy="32" r={radius}
        fill="none" stroke="#111111"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
        whileInView={{ strokeDashoffset: offset }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </svg>
  );
}

export default function GoalTrackingSection() {
  return (
    <section className="py-28 bg-white" id="goals">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest text-[#999999] uppercase">Goal Tracking</span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111] mt-4">
            Your AI Keeps You Accountable
          </h2>
          <p className="text-sm text-[#666666] mt-3 max-w-xl mx-auto">
            Set goals, track progress, and get coached by an AI that knows your habits.
          </p>
        </motion.div>

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
                className="p-6 rounded-2xl border border-[#e5e5e5] bg-white hover:shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-[#111111]">{goal.label}</span>
                      <div className="flex items-center gap-1 text-[#444444]">
                        <Flame size={12} />
                        <span className="text-xs font-medium">{goal.streak}d</span>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-semibold text-[#111111]">{goal.current}</span>
                      <span className="text-sm text-[#999999]">/ {goal.target} {goal.unit}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <ProgressRing percentage={pct} />
                    <span className="text-xs font-medium text-[#444444] mt-1">{Math.round(pct)}%</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.1 + 0.3, ease: "easeOut" }}
                    className="h-full bg-[#111111] rounded-full"
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-[#999999]">{Math.round(pct)}% complete</span>
                  <span className="text-xs text-[#444444] font-medium">On track</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h4 className="text-sm font-semibold text-[#111111] text-center mb-6">Choose Your Coaching Personality</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {coaches.map((coach) => (
              <div
                key={coach.style}
                className="p-5 rounded-2xl border border-[#e5e5e5] bg-white text-center hover:shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:border-[#d4d4d4] transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-[#f5f5f5] flex items-center justify-center mx-auto mb-3">
                  <coach.icon size={18} className="text-[#444444]" />
                </div>
                <h5 className="text-sm font-semibold text-[#111111] mb-1">{coach.style}</h5>
                <p className="text-xs text-[#888888]">{coach.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
