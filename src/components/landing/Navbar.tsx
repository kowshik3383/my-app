"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-[#e5e5e5] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="text-lg font-medium tracking-tight text-[#111111]">◆</span>
          <span className="text-sm font-semibold tracking-tight text-[#111111]">Health OS</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {["Features", "Memory", "Dashboard", "Voice"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm text-[#666666] hover:text-[#111111] transition-colors duration-200"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/app"
            className="px-4 py-2 text-sm font-medium text-[#666666] hover:text-[#111111] transition-colors duration-200"
          >
            Sign In
          </Link>
          <Link
            href="/app"
            className="px-5 py-2 text-sm font-medium bg-[#111111] text-white rounded-full hover:bg-[#1a1a1a] transition-all duration-200"
          >
            Get Started
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-[#666666]"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-[#e5e5e5] px-6 py-4"
          >
            <nav className="flex flex-col gap-3">
              {["Features", "Memory", "Dashboard", "Voice"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setOpen(false)}
                  className="text-sm text-[#666666] hover:text-[#111111] transition-colors"
                >
                  {item}
                </a>
              ))}
              <Link
                href="/app"
                onClick={() => setOpen(false)}
                className="mt-2 px-4 py-2 text-sm font-medium text-center bg-[#111111] text-white rounded-full"
              >
                Get Started
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
