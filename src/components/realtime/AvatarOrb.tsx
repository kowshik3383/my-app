"use client";

import { useRef, useMemo, useEffect } from "react";

interface AvatarOrbProps {
  size?: number;
  isSpeaking?: boolean;
  isListening?: boolean;
  audioLevel?: number;
  emotion?: string;
}

export function AvatarOrb({
  size = 200,
  isSpeaking = false,
  isListening = false,
  audioLevel = 0,
  emotion = "neutral",
}: AvatarOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  const colors = useMemo(() => {
    const palettes: Record<string, { primary: string; secondary: string; glow: string }> = {
      neutral: { primary: "#6366f1", secondary: "#8b5cf6", glow: "rgba(99,102,241,0.3)" },
      happy: { primary: "#22c55e", secondary: "#10b981", glow: "rgba(34,197,94,0.3)" },
      calm: { primary: "#06b6d4", secondary: "#0891b2", glow: "rgba(6,182,212,0.3)" },
      concerned: { primary: "#f59e0b", secondary: "#d97706", glow: "rgba(245,158,11,0.3)" },
      empathetic: { primary: "#ec4899", secondary: "#db2777", glow: "rgba(236,72,153,0.3)" },
      energetic: { primary: "#f97316", secondary: "#ea580c", glow: "rgba(249,115,22,0.3)" },
    };
    return palettes[emotion] || palettes.neutral;
  }, [emotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let time = 0;

    const animate = () => {
      time += 0.02;
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const baseRadius = size * 0.35;
      const levelScale = 1 + audioLevel * 2;

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * levelScale + 10, 0, Math.PI * 2);
      ctx.clip();

      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * levelScale + 20);
      gradient.addColorStop(0, colors.primary);
      gradient.addColorStop(0.5, colors.secondary);
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();

      for (let i = 0; i < 5; i++) {
        const angle = time + (i * Math.PI * 2) / 5;
        const orbitRadius = baseRadius * levelScale + 15 + Math.sin(time * 0.5 + i) * 8;
        const ox = cx + Math.cos(angle) * orbitRadius;
        const oy = cy + Math.sin(angle) * orbitRadius;
        const particleSize = 3 + Math.sin(time * 2 + i) * 2;

        ctx.beginPath();
        ctx.arc(ox, oy, particleSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(time + i) * 0.2})`;
        ctx.fill();
      }

      if (isSpeaking || isListening) {
        const pulseRadius = baseRadius * levelScale + 20 + Math.sin(time * 3) * 10;
        const gradient2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseRadius);
        gradient2.addColorStop(0, "transparent");
        gradient2.addColorStop(1, colors.glow);
        ctx.fillStyle = gradient2;
        ctx.beginPath();
        ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [size, isSpeaking, isListening, audioLevel, colors]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
      }}
      aria-label="AI avatar visualization"
    />
  );
}
