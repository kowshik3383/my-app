"use client";

import { useRef, useEffect } from "react";

interface WaveformProps {
  audioLevel?: number;
  isActive?: boolean;
  barCount?: number;
  height?: number;
  color?: string;
}

export function Waveform({
  audioLevel = 0,
  isActive = false,
  barCount = 48,
  height = 48,
  color = "#6366f1",
}: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const levelsRef = useRef<number[]>(new Array(barCount).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      const width = canvas.clientWidth;
      ctx.clearRect(0, 0, width, height);

      const levels = levelsRef.current;

      if (isActive) {
        levels.push(audioLevel);
        levels.shift();
      } else {
        levels.forEach((_, i) => {
          levels[i] *= 0.95;
        });
      }

      const barWidth = width / barCount;
      const centerY = height / 2;

      for (let i = 0; i < barCount; i++) {
        const normalizedLevel = Math.min(levels[i] || 0, 1);
        const barHeight = Math.max(1, normalizedLevel * height * 0.8);
        const x = i * barWidth;

        const alpha = 0.2 + normalizedLevel * 0.8;
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;

        ctx.beginPath();
        const radius = barWidth * 0.3;
        ctx.roundRect(x + 1, centerY - barHeight / 2, barWidth - 2, barHeight, radius);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      frameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(frameRef.current);
  }, [audioLevel, isActive, barCount, height, color]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height }}
      aria-label="Audio waveform"
    />
  );
}
