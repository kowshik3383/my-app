"use client";

import type { ConnectionState } from "@/types/realtime";

interface ConnectionIndicatorProps {
  state: ConnectionState;
  latency?: number;
}

const stateConfig: Record<
  ConnectionState,
  { label: string; color: string; pulse: boolean }
> = {
  connected: { label: "Connected", color: "#22c55e", pulse: false },
  connecting: { label: "Connecting", color: "#f59e0b", pulse: true },
  reconnecting: { label: "Reconnecting", color: "#f59e0b", pulse: true },
  disconnected: { label: "Disconnected", color: "#ef4444", pulse: false },
};

export function ConnectionIndicator({
  state,
  latency,
}: ConnectionIndicatorProps) {
  const config = stateConfig[state];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11,
        color: "var(--text-tertiary)",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: config.color,
          animation: config.pulse ? "indicator-pulse 1.5s ease-in-out infinite" : "none",
        }}
      />
      <span>{config.label}</span>
      {latency !== undefined && state === "connected" && (
        <span style={{ marginLeft: 4 }}>
          {latency < 100
            ? `${latency}ms`
            : latency < 300
            ? `${latency}ms`
            : `${latency}ms`}
        </span>
      )}
      <style>{`
        @keyframes indicator-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
