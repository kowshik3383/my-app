"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="relative py-32 overflow-hidden bg-[#111111]">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-gradient-to-br from-white/[0.03] to-transparent rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-[1.1] mb-5">
            Your Health Deserves More Than
            <br />
            <span className="text-white/60">Another Chatbot</span>
          </h2>

          <p className="text-base sm:text-lg text-white/40 max-w-lg mx-auto mb-10">
            Build healthier habits with an AI companion that grows with you.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-medium bg-white text-[#111111] rounded-full hover:bg-white/90 transition-all duration-200"
            >
              Start Free
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-medium text-white/80 bg-white/5 rounded-full hover:bg-white/10 transition-all duration-200 border border-white/10"
            >
              Talk To Your AI
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
