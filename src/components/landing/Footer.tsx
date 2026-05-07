"use client";

import { Github, Twitter, Mail, Heart } from "lucide-react";
import Link from "next/link";

const sections = [
  {
    title: "Product",
    links: ["Features", "Dashboard", "Goals", "Memory", "Voice"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Privacy", "Terms"],
  },
  {
    title: "Developer",
    links: ["API", "Documentation", "GitHub", "Status"],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-semibold text-black dark:text-white">◆</span>
              <span className="text-sm font-semibold text-black dark:text-white">Health OS</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
              Your AI-powered health operating system. Persistent memory, emotional intelligence, and proactive coaching.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="#" className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                <Twitter size={16} />
              </a>
              <a href="#" className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                <Github size={16} />
              </a>
              <a href="#" className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Links */}
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © 2026 Health OS. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            Made with <Heart size={10} className="text-emerald-500" /> for your health
          </p>
        </div>
      </div>
    </footer>
  );
}
