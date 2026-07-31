"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useTransform, animate, useInView } from "framer-motion";

export default function CountUp({ to, duration = 1.0 }: { to: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, to, { duration, ease: "easeOut" });
      return () => controls.stop();
    }
  }, [count, to, duration, isInView]);

  useEffect(() => {
    return rounded.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = latest.toString();
      }
    });
  }, [rounded]);

  return <span ref={ref}>0</span>;
}
