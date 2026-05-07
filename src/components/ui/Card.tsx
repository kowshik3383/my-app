"use client";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  variant?: "default" | "bordered" | "ghost";
}

export default function Card({
  children,
  className = "",
  padding = "md",
  variant = "default",
}: CardProps) {
  const paddingMap = { sm: "12px", md: "16px", lg: "24px" };

  return (
    <div
      className={`card-root ${variant} ${className}`}
      style={{ padding: paddingMap[padding] }}
    >
      {children}
      <style jsx>{`
        .card-root {
          background: var(--card-bg);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }
        .card-root.default {
          border: 1px solid var(--card-border);
        }
        .card-root.bordered {
          border: 1px solid var(--border);
        }
        .card-root.ghost {
          border: 1px solid transparent;
        }
        .card-root.ghost:hover {
          border-color: var(--border);
          background: var(--bg-secondary);
        }
      `}</style>
    </div>
  );
}
