"use client";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "neutral";
}

export default function Badge({ children, variant = "default" }: BadgeProps) {
  const colors = {
    default: { bg: "var(--bg-tertiary)", fg: "var(--text)" },
    success: { bg: "#e8e8e8", fg: "#0a0a0a" },
    warning: { bg: "#e8e8e8", fg: "#0a0a0a" },
    danger: { bg: "#e8e8e8", fg: "#0a0a0a" },
    neutral: { bg: "var(--bg-tertiary)", fg: "var(--text-secondary)" },
  };
  const c = colors[variant];

  return (
    <span
      className="badge-root"
      style={{ background: c.bg, color: c.fg }}
    >
      {children}
      <style jsx>{`
        .badge-root {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: -0.01em;
          white-space: nowrap;
        }
      `}</style>
    </span>
  );
}
