"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function MatchScoreBadge({ score }: { score: number }) {
  const shouldReduceMotion = useReducedMotion();
  
  // SVG circular properties
  const radius = 8;
  const strokeWidth = 2.2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const isHighMatch = score >= 75;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9.5px] font-extrabold tracking-wider font-mono shadow-xs select-none shrink-0 transition-all ${
      isHighMatch 
        ? "border-accent/40 bg-card text-foreground shadow-[0_0_15px_oklch(0.87_0.22_130/0.25)] ring-1 ring-accent/30"
        : "border-border/80 bg-card text-foreground"
    }`}>
      <svg className="w-5 h-5 transform -rotate-90 shrink-0">
        {/* Background track */}
        <circle
          cx="10"
          cy="10"
          r={radius}
          stroke="var(--color-secondary)"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-40"
        />
        {/* Animated indicator */}
        <motion.circle
          cx="10"
          cy="10"
          r={radius}
          stroke="oklch(0.87 0.22 130)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 1.2, ease: [0.23, 1, 0.32, 1] }
          }
        />
      </svg>
      <span>{score}% MATCH</span>
    </span>
  );
}

