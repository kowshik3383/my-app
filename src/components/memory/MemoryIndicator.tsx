"use client";

import { useEffect, useState } from "react";
import { Brain, Loader2 } from "lucide-react";

interface MemoryIndicatorProps {
  userId: string;
}

export default function MemoryIndicator({ userId }: MemoryIndicatorProps) {
  const [memoryCount, setMemoryCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    fetch(`/api/memories?userId=${userId}&limit=1`)
      .then((res) => res.json())
      .then((data) => {
        if (data.memories) {
          setMemoryCount(data.totalTokens || data.memories.length);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-full text-xs text-purple-600 dark:text-purple-400">
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Brain className="w-3 h-3" />
      )}
      <span>AI Memory Active</span>
    </div>
  );
}
