"use client";

import { useStore } from "@/store/useStore";
import { Brain, Clock, Tag, Search } from "lucide-react";
import { useState } from "react";
import Card from "@/components/ui/Card";

export default function MemoryExplorer() {
  const { isDarkMode } = useStore();
  const dark = isDarkMode;

  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="mem-root">
      <div className="mem-header">
        <div className="mem-title-row">
          <Brain size={18} strokeWidth={1.5} />
          <h1>Memory Explorer</h1>
        </div>
        <p className="mem-subtitle">
          Browse, search, and explore your health journey
        </p>
        <div className="mem-search">
          <Search size={14} strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mem-search-input"
          />
        </div>
      </div>

      <div className="mem-content scrollbar-thin">
        <Card variant="bordered" padding="lg">
          <div className="mem-empty">
            <Brain size={32} strokeWidth={1} />
            <h3>No memories yet</h3>
            <p>Start a conversation to build your memory graph</p>
          </div>
        </Card>
      </div>

      <style jsx>{`
        .mem-root {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: var(--bg);
        }
        .mem-header {
          padding: 32px 32px 20px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .mem-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }
        .mem-title-row h1 {
          font-size: 20px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--text);
          margin: 0;
        }
        .mem-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0 0 16px 28px;
        }
        .mem-search {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          margin-left: 28px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--bg);
          max-width: 360px;
          transition: border-color 150ms ease;
        }
        .mem-search:focus-within {
          border-color: var(--text);
        }
        .mem-search-input {
          flex: 1;
          border: none;
          background: transparent;
          color: var(--text);
          font-size: 13px;
          outline: none;
          font-family: var(--font-sans);
        }
        .mem-search-input::placeholder {
          color: var(--text-tertiary);
        }
        .mem-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px 32px;
        }
        .mem-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          text-align: center;
          color: var(--text-tertiary);
          gap: 8px;
        }
        .mem-empty h3 {
          font-size: 15px;
          font-weight: 500;
          color: var(--text-secondary);
          margin: 0;
        }
        .mem-empty p {
          font-size: 13px;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
