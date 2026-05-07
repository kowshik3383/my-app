"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Server, Key, Eye, Database } from "lucide-react";

const items = [
  { icon: Key, label: "API keys server-side only" },
  { icon: Server, label: "Secure infrastructure" },
  { icon: Database, label: "MongoDB encrypted storage" },
  { icon: Lock, label: "Private conversations" },
  { icon: Eye, label: "User-controlled memories" },
  { icon: Shield, label: "Enterprise-grade security" },
];

export default function SecuritySection() {
  return (
    <section className="py-28 bg-gray-50 dark:bg-[#0d0d0d]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center mb-12"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-5">
            <Shield size={24} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-black dark:text-white mb-4">
            Your Privacy Is Our Foundation
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            We take security seriously. Your health data belongs to you, and we built
            our infrastructure to protect it at every layer.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto"
        >
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10"
            >
              <item.icon size={16} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-200">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
