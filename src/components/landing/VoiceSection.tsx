"use client";

import { motion } from "framer-motion";
import { Mic, Languages, Smile, AudioWaveform as Waveform, Stethoscope, GraduationCap, HeartHandshake, UserCircle } from "lucide-react";

const languages = ["English", "Hindi", "Telugu", "Tamil", "Bengali"];

const features = [
  { icon: Mic, label: "Real-time voice conversations" },
  { icon: Smile, label: "Facial expressions & lipsync" },
  { icon: Waveform, label: "Emotion detection in voice" },
  { icon: Languages, label: "Multilingual support" },
];

const personalities = [
  { role: "Therapist", desc: "Mental wellness & emotional support", icon: HeartHandshake },
  { role: "Coach", desc: "Fitness & goal accountability", icon: UserCircle },
  { role: "Doctor", desc: "Medical guidance & health tracking", icon: Stethoscope },
  { role: "Mentor", desc: "Life advice & habit building", icon: GraduationCap },
];

export default function VoiceSection() {
  return (
    <section className="py-28 bg-[#fafafa]" id="voice">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest text-[#999999] uppercase">Voice + AI Personalities</span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111] mt-4">
            Talk to Your AI Like a Person
          </h2>
          <p className="text-sm text-[#666666] mt-3 max-w-xl mx-auto">
            Natural voice conversations with an AI that has a personality, emotions, and expressions.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="w-64 h-64 mx-auto rounded-full bg-[#f5f5f5] flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
              <div className="w-48 h-48 rounded-full bg-white shadow-inner flex items-center justify-center">
                <Mic size={40} className="text-[#444444]" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-1 mt-8">
              {[16, 28, 12, 36, 20, 32, 14, 24, 18, 30, 10, 22].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 4 }}
                  animate={{ height: h }}
                  transition={{ duration: 0.6, delay: i * 0.08, repeat: Infinity, repeatType: "reverse" }}
                  className="w-2 bg-[#d4d4d4] rounded-full"
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="space-y-5 mb-8">
              {features.map((feat) => (
                <div key={feat.label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#f0f0f0] flex items-center justify-center flex-shrink-0">
                    <feat.icon size={18} className="text-[#444444]" />
                  </div>
                  <span className="text-sm text-[#444444]">{feat.label}</span>
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-xs font-semibold tracking-widest text-[#999999] uppercase mb-3">Supported Languages</h4>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-3 py-1.5 text-sm text-[#444444] bg-white border border-[#e5e5e5] rounded-lg"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h4 className="text-sm font-semibold text-[#111111] text-center mb-8">Choose Your AI Personality</h4>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {personalities.map((p) => (
              <motion.div
                key={p.role}
                whileHover={{ y: -2 }}
                className="p-6 rounded-2xl border border-[#e5e5e5] bg-white text-center hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-[#f5f5f5] flex items-center justify-center mx-auto mb-4">
                  <p.icon size={22} className="text-[#444444]" />
                </div>
                <h5 className="text-base font-semibold text-[#111111] mb-1">{p.role}</h5>
                <p className="text-sm text-[#888888]">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
