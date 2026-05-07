"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya M.",
    role: "Type 2 Diabetes",
    avatar: "PM",
    text: "This feels less like an app and more like someone who genuinely understands me. My HbA1c dropped from 8.2 to 6.8 in 3 months.",
    rating: 5,
  },
  {
    name: "Rahul K.",
    role: "Busy Professional",
    avatar: "RK",
    text: "The memory feature is incredible. It remembers my sleep issues, follows up on my goals, and actually helps me stay consistent.",
    rating: 5,
  },
  {
    name: "Ananya S.",
    role: "Fitness Enthusiast",
    avatar: "AS",
    text: "I've tried every health app out there. This is the first one that doesn't feel like a chore. The voice conversations are game-changing.",
    rating: 5,
  },
  {
    name: "Arjun T.",
    role: "Mental Wellness",
    avatar: "AT",
    text: "The emotional intelligence is remarkable. It doesn't just track data—it understands how I'm feeling and adjusts accordingly.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
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
          <span className="text-xs font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-black dark:text-white mt-3">
            Loved by Real Users
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="p-6 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} className="fill-emerald-500 text-emerald-500" />
                ))}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed mb-6">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  {t.avatar}
                </div>
                <div>
                  <span className="text-sm font-semibold text-black dark:text-white">{t.name}</span>
                  <span className="text-xs text-gray-400 block">{t.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
