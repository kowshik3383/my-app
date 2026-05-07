"use client";

import { motion } from "framer-motion";
import { TrendingUp, Activity, Moon, Heart, Droplets, Target } from "lucide-react";
import Link from "next/link";

const statCards = [
  { label: "Weight", value: "68", unit: "kg", trend: "-2.1%", icon: Activity },
  { label: "Glucose", value: "112", unit: "mg/dL", trend: "−8%", icon: Droplets },
  { label: "Sleep", value: "7.2", unit: "hours", trend: "+18%", icon: Moon },
  { label: "Mood", value: "8.5", unit: "/10", trend: "+5%", icon: Heart },
];

const insights = [
  "Your sleep improved 18% this week.",
  "Glucose levels stabilized after evening walks.",
  "Mood scores are highest on hydration days.",
];

export default function DashboardSection() {
  return (
    <section className="py-28 bg-gray-50 dark:bg-[#0d0d0d]" id="dashboard">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase">Health Dashboard</span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-black dark:text-white mt-3">
            Your Entire Health at a Glance
          </h2>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {statCards.map((card) => (
            <div
              key={card.label}
              className="p-5 rounded-xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">{card.label}</span>
                <card.icon size={14} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold text-black dark:text-white">{card.value}</span>
                <span className="text-xs text-gray-400">{card.unit}</span>
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{card.trend}</span>
            </div>
          ))}
        </motion.div>

        {/* Chart mockup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="p-6 rounded-xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-sm font-semibold text-black dark:text-white">Glucose Trends</h4>
              <p className="text-xs text-gray-400">Last 7 days</p>
            </div>
            <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="h-40 flex items-end gap-2">
            {[60, 75, 55, 85, 70, 90, 65].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="w-full bg-emerald-200 dark:bg-emerald-900/50 rounded-t-sm"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] text-gray-400">M{i + 1}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Insight cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h4 className="text-sm font-semibold text-black dark:text-white mb-4">AI-Generated Insights</h4>
          <div className="grid sm:grid-cols-3 gap-3">
            {insights.map((insight, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30"
              >
                <p className="text-sm text-gray-700 dark:text-gray-200">{insight}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
