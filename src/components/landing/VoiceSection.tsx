"use client";

import { motion } from "framer-motion";
import { Mic, Languages, Smile, AudioWaveform as Waveform } from "lucide-react";

const languages = [
  "English", "Hindi", "Telugu", "Tamil", "Bengali",
];

const features = [
  { icon: Mic, label: "Real-time voice conversations" },
  { icon: Smile, label: "Facial expressions & lipsync" },
  { icon: Waveform, label: "Emotion detection in voice" },
  { icon: Languages, label: "Multilingual support" },
];

export default function VoiceSection() {
  return (
    <section className="py-28 bg-gray-50 dark:bg-[#0d0d0d]" id="voice">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase">Voice + Avatar</span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-black dark:text-white mt-3">
            Talk to Your AI Like a Person
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Avatar circle */}
            <div className="w-64 h-64 mx-auto rounded-full bg-gradient-to-br from-emerald-100 via-cyan-50 to-indigo-100 dark:from-emerald-900/30 dark:via-cyan-900/20 dark:to-indigo-900/30 flex items-center justify-center shadow-xl">
              <div className="w-48 h-48 rounded-full bg-white dark:bg-[#141414] shadow-inner flex items-center justify-center">
                <Mic size={40} className="text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            {/* Waveform */}
            <div className="flex items-center justify-center gap-1 mt-8">
              {[16, 28, 12, 36, 20, 32, 14, 24, 18, 30, 10, 22].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 4 }}
                  animate={{ height: h }}
                  transition={{ duration: 0.6, delay: i * 0.08, repeat: Infinity, repeatType: "reverse" }}
                  className="w-2 bg-emerald-400/60 dark:bg-emerald-500/40 rounded-full"
                />
              ))}
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="space-y-5 mb-8">
              {features.map((feat) => (
                <div key={feat.label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <feat.icon size={18} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-200">{feat.label}</span>
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-xs font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-3">Supported Languages</h4>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-lg"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
