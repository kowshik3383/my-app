"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="relative py-32 overflow-hidden bg-black dark:bg-[#0a0a0a]">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-emerald-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.03)_0%,transparent_70%)]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles size={28} className="text-emerald-400" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-[1.1] mb-5">
            Your Health Deserves More Than
            <br />
            <span className="text-emerald-400">Another Chatbot</span>
          </h2>

          <p className="text-base sm:text-lg text-gray-400 max-w-lg mx-auto mb-10">
            Build healthier habits with an AI companion that grows with you.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-medium bg-white text-black rounded-full hover:opacity-90 transition-all"
            >
              Start Free
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-medium text-white bg-white/10 rounded-full hover:bg-white/15 transition-all border border-white/10"
            >
              Experience The Future
            </Link>
          </div>
        </motion.div>

        {/* Avatar silhouette */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12 flex justify-center"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-indigo-500/20 border border-white/10 flex items-center justify-center">
            <span className="text-3xl text-white/60">◆</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
