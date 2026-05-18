"use client";

import { useStore, type ViewType } from "@/store/useStore";
import {
  MessageSquare,
  LayoutDashboard,
  Target,
  Brain,
  Phone,
  Sun,
  Moon,
  LogOut,
  Search,
  ChevronDown,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const NAV_ITEMS: { id: ViewType; label: string; icon: typeof MessageSquare }[] = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "voice_call", label: "Voice Call", icon: Phone },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "goals", label: "Goals", icon: Target },
  { id: "memory", label: "Memory", icon: Brain },
];

export default function Sidebar() {
  const {
    currentView,
    setCurrentView,
    setInCall,
    isDarkMode,
    setIsDarkMode,
    setIsOnboarded,
    setUserProfile,
    setCurrentSessionId,
    setMessages,
  } = useStore();

  const [searchOpen, setSearchOpen] = useState(false);

  function handleLogout() {
    setIsOnboarded(false);
    setUserProfile(null);
    setCurrentSessionId(null);
    setMessages([]);
  }

  return (
    <aside className="sidebar-root">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon">◆</span>
          <span className="sidebar-brand-text">Health OS</span>
        </div>
      </div>

      {/* Search */}
      <button className="sidebar-search" onClick={() => setSearchOpen(!searchOpen)}>
        <Search size={14} strokeWidth={1.5} />
        <span>Quick find</span>
        <kbd className="sidebar-kbd">⌘K</kbd>
      </button>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-nav-item ${active ? "active" : ""}`}
              onClick={() => {
                setCurrentView(item.id);
                if (item.id === "voice_call") setInCall(true);
              }}
            >
              <Icon size={15} strokeWidth={active ? 2 : 1.5} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* Recent section */}
      <div className="sidebar-section-header">
        <span>Recent</span>
        <ChevronDown size={12} strokeWidth={1.5} />
      </div>
      <div className="sidebar-recent-list">
        <button className="sidebar-recent-item">
          <span className="sidebar-recent-dot" />
          <span className="sidebar-recent-label">Today&apos;s session</span>
        </button>
        <button className="sidebar-recent-item">
          <span className="sidebar-recent-dot" />
          <span className="sidebar-recent-label">Check-in</span>
        </button>
      </div>

      {/* Bottom */}
      <div className="sidebar-bottom">
        <button
          className="sidebar-bottom-item"
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? <Sun size={14} strokeWidth={1.5} /> : <Moon size={14} strokeWidth={1.5} />}
          <span>{isDarkMode ? "Light mode" : "Dark mode"}</span>
        </button>
        <button className="sidebar-bottom-item" onClick={handleLogout}>
          <LogOut size={14} strokeWidth={1.5} />
          <span>Sign out</span>
        </button>
      </div>

      <style jsx>{`
        .sidebar-root {
          width: 240px;
          min-width: 240px;
          height: 100vh;
          background: var(--sidebar-bg);
          border-right: 1px solid var(--sidebar-border);
          display: flex;
          flex-direction: column;
          padding: 0 12px;
          user-select: none;
          overflow-y: auto;
        }
        .sidebar-logo {
          padding: 20px 8px 16px;
        }
        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sidebar-brand-icon {
          font-size: 18px;
          color: var(--text);
        }
        .sidebar-brand-text {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          letter-spacing: -0.01em;
        }
        .sidebar-search {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 10px;
          margin: 0 0 12px;
          border-radius: 6px;
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text-tertiary);
          font-size: 12px;
          width: 100%;
          transition: border-color var(--transition-fast);
        }
        .sidebar-search:hover {
          border-color: var(--text-tertiary);
        }
        .sidebar-kbd {
          margin-left: auto;
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-tertiary);
          background: var(--bg-tertiary);
          padding: 1px 5px;
          border-radius: 4px;
          border: 1px solid var(--border);
        }
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 1px;
          margin-bottom: 12px;
        }
        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 10px;
          border-radius: 6px;
          background: transparent;
          border: none;
          color: var(--sidebar-text);
          font-size: 13px;
          font-weight: 400;
          text-align: left;
          width: 100%;
          transition: all var(--transition-fast);
        }
        .sidebar-nav-item:hover {
          background: var(--sidebar-hover);
          color: var(--sidebar-text-active);
        }
        .sidebar-nav-item.active {
          background: var(--sidebar-active);
          color: var(--sidebar-text-active);
          font-weight: 500;
        }
        .sidebar-divider {
          height: 1px;
          background: var(--border);
          margin: 4px 0 12px;
        }
        .sidebar-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 10px 8px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-tertiary);
        }
        .sidebar-recent-list {
          display: flex;
          flex-direction: column;
          gap: 1px;
          margin-bottom: 12px;
        }
        .sidebar-recent-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 10px;
          border-radius: 6px;
          background: transparent;
          border: none;
          color: var(--sidebar-text);
          font-size: 12px;
          text-align: left;
          width: 100%;
          transition: all var(--transition-fast);
          cursor: pointer;
        }
        .sidebar-recent-item:hover {
          background: var(--sidebar-hover);
          color: var(--sidebar-text-active);
        }
        .sidebar-recent-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--text-tertiary);
          flex-shrink: 0;
        }
        .sidebar-recent-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sidebar-bottom {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 1px;
          padding: 12px 0;
          border-top: 1px solid var(--border);
        }
        .sidebar-bottom-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 10px;
          border-radius: 6px;
          background: transparent;
          border: none;
          color: var(--sidebar-text);
          font-size: 12px;
          text-align: left;
          width: 100%;
          transition: all var(--transition-fast);
          cursor: pointer;
        }
        .sidebar-bottom-item:hover {
          background: var(--sidebar-hover);
          color: var(--sidebar-text-active);
        }
      `}</style>
    </aside>
  );
}
