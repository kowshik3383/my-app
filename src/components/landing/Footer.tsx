import { Github, Twitter, Mail } from "lucide-react";
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
    <footer className="border-t border-[#e5e5e5] bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-semibold text-[#111111]">◆</span>
              <span className="text-sm font-semibold text-[#111111]">Health OS</span>
            </div>
            <p className="text-xs text-[#888888] leading-relaxed max-w-xs">
              Your AI-powered health operating system. Persistent memory, emotional intelligence, and proactive coaching.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="#" className="text-[#999999] hover:text-[#111111] transition-colors">
                <Twitter size={16} />
              </a>
              <a href="#" className="text-[#999999] hover:text-[#111111] transition-colors">
                <Github size={16} />
              </a>
              <a href="#" className="text-[#999999] hover:text-[#111111] transition-colors">
                <Mail size={16} />
              </a>
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold tracking-widest text-[#999999] uppercase mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[#666666] hover:text-[#111111] transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-[#e5e5e5] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#999999]">
            © 2026 Health OS. All rights reserved.
          </p>
          <p className="text-xs text-[#999999]">
            Made with care for your health
          </p>
        </div>
      </div>
    </footer>
  );
}
