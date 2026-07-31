"use client";

import React, { useRef, useEffect } from "react";
import { motion, useSpring } from "framer-motion";

export class SkillSoundManager {
  private static ctx: AudioContext | null = null;

  private static getContext() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext; // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  static playHover(freq: number) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      
      gain.gain.setValueAtTime(0.012, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {
      console.warn("Audio Context failed:", e);
    }
  }

  static playClick(freq: number) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq * 1.4, now);
      osc.frequency.exponentialRampToValueAtTime(freq, now + 0.08);
      
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      console.warn("Audio Context failed:", e);
    }
  }
}

export const SKILL_MAP: Record<string, { color: string; freq: number }> = {
  "javascript": { color: "#F7DF1E", freq: 329.63 },
  "typescript": { color: "#3178C6", freq: 293.66 },
  "react.js": { color: "#61DAFB", freq: 261.63 },
  "react": { color: "#61DAFB", freq: 261.63 },
  "next.js": { color: "#707070", freq: 349.23 },
  "zustand": { color: "#4338CA", freq: 392.00 },
  "tailwind css": { color: "#38BDF8", freq: 440.00 },
  "tailwind": { color: "#38BDF8", freq: 440.00 },
  "framer motion": { color: "#FF00BF", freq: 493.88 },
  "gsap": { color: "#88CE02", freq: 523.25 },
  "three.js": { color: "#9F7AEA", freq: 554.37 },
  "node.js": { color: "#339933", freq: 587.33 },
  "node": { color: "#339933", freq: 587.33 },
  "express.js": { color: "#353535", freq: 622.25 },
  "express": { color: "#353535", freq: 622.25 },
  "websockets": { color: "#FF5722", freq: 659.25 },
  "websocket": { color: "#FF5722", freq: 659.25 },
  "socket.io": { color: "#4F46E5", freq: 698.46 },
  "postgresql": { color: "#4169E1", freq: 739.99 },
  "postgres": { color: "#4169E1", freq: 739.99 },
  "mongodb": { color: "#47A248", freq: 783.99 },
  "mongo": { color: "#47A248", freq: 783.99 },
  "redis": { color: "#DC382D", freq: 830.61 },
  "prisma": { color: "#5A67D8", freq: 880.00 },
  "drizzle": { color: "#C5F82A", freq: 932.33 },
  "git": { color: "#F05032", freq: 987.77 },
  "github": { color: "#181717", freq: 1046.50 },
  "docker": { color: "#2496ED", freq: 1108.73 },
  "postman": { color: "#FF6C37", freq: 1174.66 },
  "vercel": { color: "#4B5563", freq: 1244.51 },
  "linux": { color: "#FCC624", freq: 1318.51 },
  "design engineering": { color: "#10B981", freq: 1396.91 },
  "full-stack development": { color: "#F59E0B", freq: 1479.98 },
  "full stack": { color: "#F59E0B", freq: 1479.98 },
};

export const getSkillData = (name: string) => {
  const normalized = name.toLowerCase().trim();
  if (SKILL_MAP[normalized]) {
    return SKILL_MAP[normalized];
  }
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  const freq = 200 + Math.abs(hash % 800);
  return { color: "#737373", freq };
};

export function BubbleTag({
  children,
  data,
  isHovered,
  textColor,
  badgeStyle = "",
  onMouseEnter,
  onMouseLeave,
  onClick,
  containerMouse,
}: {
  children: React.ReactNode;
  data: { color: string; freq: number };
  isHovered: boolean;
  textColor: string;
  badgeStyle?: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
  containerMouse: { x: number; y: number; active: boolean };
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useSpring(0, { damping: 15, stiffness: 150, mass: 0.8 });
  const y = useSpring(0, { damping: 15, stiffness: 150, mass: 0.8 });

  useEffect(() => {
    if (!ref.current || !containerMouse.active) {
      x.set(0);
      y.set(0);
      return;
    }

    const rect = ref.current.getBoundingClientRect();
    const chipCenterX = rect.left + rect.width / 2;
    const chipCenterY = rect.top + rect.height / 2;

    const dx = chipCenterX - containerMouse.x;
    const dy = chipCenterY - containerMouse.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const maxDistance = 90;
    if (distance < maxDistance) {
      const force = (maxDistance - distance) / maxDistance;
      const repelPower = 22;
      const angle = distance === 0 ? 0 : Math.atan2(dy, dx);
      x.set(Math.cos(angle) * force * repelPower);
      y.set(Math.sin(angle) * force * repelPower);
    } else {
      x.set(0);
      y.set(0);
    }
  }, [containerMouse, x, y]);

  return (
    <motion.span
      ref={ref}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{
        x,
        y,
        ...(isHovered
          ? {
              backgroundColor: data.color,
              color: textColor,
              borderColor: "transparent",
              boxShadow: `0 0 14px ${data.color}50`,
            }
          : {}),
      }}
      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase cursor-pointer select-none transition-shadow duration-300 hover:scale-[1.05] ${badgeStyle}`}
    >
      {children}
    </motion.span>
  );
}
