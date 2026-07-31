"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  FileText,
  Cpu,
  Kanban,
  Bell,
  CreditCard,
  Check,
  ArrowRight,
  Sparkles,
  Zap,
  Star
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import CountUp from "@/components/CountUp";

class UISoundManager {
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

  static playClick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.07);
      
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      
      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {
      console.warn("Audio Context failed:", e);
    }
  }

  static playSuccess() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.02, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc1.start(now);
      osc1.stop(now + 0.18);
      
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.setValueAtTime(659.25, now + 0.05);
      gain2.gain.setValueAtTime(0.02, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.23);
      osc2.start(now + 0.05);
      osc2.stop(now + 0.23);
    } catch (e) {
      console.warn("Audio Context failed:", e);
    }
  }

  static playHover() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.03);
      
      gain.gain.setValueAtTime(0.008, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      
      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {
      console.warn("Audio Context failed:", e);
    }
  }
}

// Interactive branding mascot
function PickleSmiley({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="50" cy="50" r="48" fill="var(--color-accent)" stroke="var(--color-foreground)" strokeWidth="4" />
      {/* Left eye: winking arc */}
      <path d="M28 42C28 42 34 36 40 42" stroke="var(--color-foreground)" strokeWidth="4" strokeLinecap="round" />
      {/* Right eye: asterisk line decoration */}
      <path d="M60 40L72 52M72 40L60 52M66 36V56M56 46H76" stroke="var(--color-foreground)" strokeWidth="4" strokeLinecap="round" />
      {/* Smile */}
      <path d="M30 62C30 62 42 78 70 62" stroke="var(--color-foreground)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function AsteriskDeco({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" className={className}>
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="6.34" y1="6.34" x2="17.66" y2="17.66" />
      <line x1="6.34" y1="17.66" x2="17.66" y2="6.34" />
    </svg>
  );
}

function Nav({ session }: { session: any }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  return (
    <header className="sticky top-0 z-40 h-[72px] border-b border-border bg-background/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <Link 
          href="/" 
          onClick={(e) => {
            UISoundManager.playClick();
            if (window.location.pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          onMouseEnter={() => UISoundManager.playHover()}
          className="group flex items-center gap-2.5 text-lg font-black tracking-tight text-foreground select-none hover:scale-[1.02] transition-transform"
        >
          <PickleSmiley className="w-7 h-7 hover:rotate-12 transition-transform duration-300" />
          <span className="font-heading text-[22px] font-black tracking-tight text-foreground transition-colors group-hover:text-accent">Fitboard</span>
        </Link>
        <nav className="hidden gap-8 text-sm font-semibold text-muted-foreground md:flex">
          <a href="#how" onClick={() => UISoundManager.playClick()} onMouseEnter={() => UISoundManager.playHover()} className="transition-colors hover:text-accent">How it works</a>
          <a href="#roles" onClick={() => UISoundManager.playClick()} onMouseEnter={() => UISoundManager.playHover()} className="transition-colors hover:text-accent">For you</a>
          <a href="#pipeline" onClick={() => UISoundManager.playClick()} onMouseEnter={() => UISoundManager.playHover()} className="transition-colors hover:text-accent">Pipeline</a>
          <a href="#pricing" onClick={() => UISoundManager.playClick()} onMouseEnter={() => UISoundManager.playHover()} className="transition-colors hover:text-accent">Pricing</a>
        </nav>
        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-3">
              <Link
                href={session.user?.role === "EMPLOYER" ? "/dashboard/employer/jobs" : "/dashboard/candidate/jobs"}
                onClick={() => UISoundManager.playSuccess()}
                onMouseEnter={() => UISoundManager.playHover()}
                className="btn-tactile rounded-full bg-foreground px-5 py-2.5 text-xs font-bold text-background hover:scale-102 hover:opacity-95 hover:bg-accent hover:text-black transition-all"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                href="/login" 
                onClick={() => UISoundManager.playClick()}
                onMouseEnter={() => UISoundManager.playHover()}
                className="text-xs font-bold text-foreground hover:bg-accent/10 hover:text-accent rounded-full px-4 py-2.5 transition-all"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={() => UISoundManager.playSuccess()}
                onMouseEnter={() => UISoundManager.playHover()}
                className="btn-tactile rounded-full bg-foreground px-5 py-2.5 text-xs font-bold text-background hover:scale-102 hover:opacity-95 hover:bg-accent hover:text-black transition-all"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  // Extract number from string to animate it (e.g. "94%" -> 94, "4.2s" -> 4.2)
  const numVal = parseFloat(n);
  const suffix = n.replace(/[0-9.]/g, "");

  return (
    <div 
      className="group cursor-default"
      onMouseEnter={() => UISoundManager.playHover()}
    >
      <div className="font-serif text-3xl font-normal text-foreground md:text-4xl transition-colors group-hover:text-accent duration-300">
        <CountUp to={isNaN(numVal) ? 0 : numVal} />{suffix}
      </div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-foreground duration-300">{l}</div>
    </div>
  );
}

const INTERACTIVE_SKILLS = [
  { name: "TypeScript", weight: "must" as const, score: 98, contribution: 25 },
  { name: "PostgreSQL", weight: "must" as const, score: 92, contribution: 25 },
  { name: "Prisma ORM", weight: "must" as const, score: 88, contribution: 20 },
  { name: "Next.js", weight: "nice" as const, score: 76, contribution: 10 },
  { name: "LLM APIs", weight: "nice" as const, score: 71, contribution: 7 },
];

function MatchCard() {
  const [activeSkills, setActiveSkills] = useState<string[]>([
    "TypeScript", "PostgreSQL", "Prisma ORM", "Next.js", "LLM APIs"
  ]);

  const score = INTERACTIVE_SKILLS.reduce((acc, s) => {
    return acc + (activeSkills.includes(s.name) ? s.contribution : 0);
  }, 0);

  const handleToggle = (name: string) => {
    UISoundManager.playClick();
    setActiveSkills(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  return (
    <div className="relative">
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-[oklch(0.88_0.22_130)] opacity-25 blur-2xl animate-pulse" />
      <div className="rounded-2xl border border-border bg-card p-7 shadow-match-glow transition-all duration-300 hover:shadow-match-glow-hover hover:scale-[1.01]">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-[oklch(0.72_0.18_35)]" />
              Live Match Report
            </div>
            <div className="mt-1 font-serif text-2xl font-normal text-foreground">
              Priya S. → Senior Backend Eng.
            </div>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[oklch(0.88_0.22_130)] bg-background shadow-xs select-none shrink-0">
            <span className="font-serif text-lg font-bold text-foreground">
              <CountUp to={score} />
            </span>
            <span className="font-sans text-[10px] font-bold text-muted-foreground ml-0.5">%</span>
          </div>
        </div>

        <div className="mt-6 space-y-3.5">
          {INTERACTIVE_SKILLS.map((s) => {
            const active = activeSkills.includes(s.name);
            return (
              <div 
                key={s.name}
                onClick={() => handleToggle(s.name)}
                className="group/row cursor-pointer select-none hover:bg-secondary/40 px-2.5 py-1.5 -mx-2.5 rounded-xl transition-all duration-300 active:scale-[0.99] text-left"
              >
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <span
                      className={
                        s.weight === "must"
                          ? `rounded-xs px-1.5 py-0.5 text-[9px] font-bold uppercase transition-colors duration-300 ${
                              active ? "bg-foreground text-background" : "bg-secondary text-muted-foreground/60 border border-border/40"
                            }`
                          : `rounded-xs border px-1.5 py-0.5 text-[9px] font-semibold uppercase transition-colors duration-300 ${
                              active ? "border-foreground/50 text-foreground" : "border-border text-muted-foreground/40"
                            }`
                      }
                    >
                      {s.weight}
                    </span>
                    <span className={`transition-all duration-300 ${active ? "text-foreground font-medium" : "text-muted-foreground/40 line-through"}`}>
                      {s.name}
                    </span>
                  </div>
                  <div className={`tabular-nums font-mono text-xs transition-colors duration-300 ${active ? "text-muted-foreground font-bold" : "text-muted-foreground/30"}`}>
                    {active ? `${s.score}%` : "0%"}
                  </div>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    className={`h-full rounded-full transition-colors duration-300 ${active ? "bg-foreground" : "bg-muted-foreground/20"}`}
                    initial={{ width: 0 }}
                    animate={{ width: active ? `${s.score}%` : "0%" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground font-mono">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.88_0.22_130)]" />
            cosine similarity
          </span>
          <span>v_c · v_j / ‖v_c‖‖v_j‖</span>
        </div>
      </div>
    </div>
  );
}

function Hero({ session }: { session: any }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const shouldReduceMotion = useReducedMotion();
  const hireLink = session
    ? (session.user?.role === "EMPLOYER" ? "/dashboard/employer/jobs/new" : "/dashboard/candidate/jobs")
    : "/register";
  const huntLink = session
    ? (session.user?.role === "CANDIDATE" ? "/dashboard/candidate/jobs" : "/dashboard/employer/jobs")
    : "/register";

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-[oklch(0.88_0.22_130/0.06)]" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 py-20 lg:grid-cols-12 lg:py-28">
        <motion.div
          className="lg:col-span-7"
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-xs">
            <span className="h-2 w-2 rounded-full bg-[oklch(0.88_0.22_130)] animate-pulse" />
            Now parsing resumes with structured LLM extraction
          </div>
          
          <motion.h1
            className="mt-6 font-serif text-5xl leading-[0.95] tracking-tight text-foreground text-balance md:text-7xl lg:text-[84px]"
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
          >
            Job matching that
            <span className="italic font-normal"> actually </span>
            <span className="relative inline-block font-normal">
              fits.
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-[oklch(0.88_0.22_130)] -z-10 rounded-xs" />
            </span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-xl text-lg text-muted-foreground font-sans leading-relaxed"
            initial={shouldReduceMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Fitboard turns resumes into structured skill vectors and scores every
            candidate–job pairing with weighted cosine similarity — so recruiters stop
            guessing and candidates stop shouting into keyword voids.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center gap-4"
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href={hireLink}
                onClick={() => UISoundManager.playSuccess()}
                onMouseEnter={() => UISoundManager.playHover()}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-background shadow-xs hover:bg-accent hover:text-black transition-colors duration-300"
              >
                {"I'm hiring"} <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href={huntLink}
                onClick={() => UISoundManager.playSuccess()}
                onMouseEnter={() => UISoundManager.playHover()}
                className="inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-card px-7 py-3.5 text-sm font-semibold text-foreground shadow-xs hover:border-accent hover:text-accent hover:bg-accent/5 transition-all duration-300"
              >
                {"I'm job hunting"}
              </Link>
            </motion.div>
          </motion.div>

          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-6 text-sm">
            <Stat n="94%" l="avg. fit accuracy" />
            <Stat n="4.2s" l="resume → parsed JSON" />
            <Stat n="0" l="keyword-only searches" />
          </div>
        </motion.div>

        <motion.div
          className="lg:col-span-5 relative flex items-center justify-center"
          initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Main Card */}
          <div className="w-full max-w-sm">
            <MatchCard />
          </div>

          {/* Floating cards around the MatchCard */}
          {!shouldReduceMotion && (
            <>
              {/* Left float card */}
              <motion.div
                className="absolute top-12 -left-32 bg-card border border-border p-3.5 rounded-xl shadow-md text-xs space-y-1 select-none pointer-events-none hidden sm:block w-36"
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span>Arjun M.</span>
                  <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-sm">71%</span>
                </div>
                <p className="text-[10px] text-muted-foreground">React, TypeScript</p>
              </motion.div>

              {/* Right float card */}
              <motion.div
                className="absolute bottom-16 -right-32 bg-card border border-border p-3.5 rounded-xl shadow-md text-xs space-y-1 select-none pointer-events-none hidden sm:block w-36"
                animate={{ y: [4, -4, 4] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span>Nina D.</span>
                  <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-sm">82%</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Next.js, Tailwind</p>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const shouldReduceMotion = useReducedMotion();
  const steps = [
    {
      k: "01",
      t: "Upload",
      d: "Drop your messy PDF resume. Our pipeline handles the parsing instantly.",
    },
    {
      k: "02",
      t: "Structure",
      d: "Our models translate unstructured text into clean JSON skills and history.",
    },
    {
      k: "03",
      t: "Vectorize",
      d: "We map candidate skills into a high-dimensional vector space.",
    },
    {
      k: "04",
      t: "Match",
      d: "Retrieve applicants sorted by cosine similarity fit score. No keyword hacks.",
    },
  ];

  return (
    <section id="how" className="border-b border-border bg-background/50">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="max-w-2xl font-serif text-4xl leading-tight text-foreground text-balance md:text-5xl">
              From messy PDF to ranked shortlist in four moves.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground font-sans leading-relaxed">
            No black boxes. Every score can be broken down to see which skills matched, which {"didn't"}, and how much each was weighted.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => {
            const isSpecial = s.k === "03";
            return (
              <motion.div
                key={s.k}
                onMouseEnter={() => UISoundManager.playHover()}
                className={`group relative p-8 rounded-2xl border transition-all duration-300 cursor-default ${
                  isSpecial
                    ? "border-foreground bg-foreground text-background hover:shadow-[0_0_25px_rgba(163,230,53,0.15)]"
                    : "border-border bg-card text-foreground hover:border-accent hover:shadow-[0_0_20px_rgba(163,230,53,0.1)]"
                }`}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
                whileHover={{ y: -4 }}
              >
                <div
                  className={`font-serif text-4xl font-normal leading-none ${
                    isSpecial ? "text-[oklch(0.88_0.22_130)]" : "text-muted-foreground/30"
                  }`}
                >
                  {s.k}
                </div>
                <div className="mt-6 font-serif text-2xl font-normal leading-tight">{s.t}</div>
                <p className={`mt-2.5 text-sm font-sans leading-relaxed ${isSpecial ? "opacity-75" : "text-muted-foreground"}`}>
                  {s.d}
                </p>
                {!isSpecial && (
                  <AsteriskDeco className="absolute right-6 bottom-6 h-5 w-5 opacity-0 transition-opacity duration-300 group-hover:opacity-30" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Roles({ session }: { session: any }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const shouldReduceMotion = useReducedMotion();
  const candidateLink = session
    ? (session.user?.role === "CANDIDATE" ? "/dashboard/candidate/jobs" : "/dashboard/employer/jobs")
    : "/register";
  const employerLink = session
    ? (session.user?.role === "EMPLOYER" ? "/dashboard/employer/jobs/new" : "/dashboard/candidate/jobs")
    : "/register";

  return (
    <section id="roles" className="border-b border-border">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
        <motion.div
          className="p-10 lg:p-16 flex flex-col justify-between"
          initial={shouldReduceMotion ? {} : { opacity: 0, x: -15 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <div className="font-serif text-3xl font-normal text-foreground md:text-4xl">
              Discover opportunities that fit your actual profile
            </div>
            <p className="mt-4 max-w-md text-sm text-muted-foreground font-sans leading-relaxed">
              No more tailoring resumes for ATS filters. Upload your resume to calculate
              instant match scores across every listing on our board.
            </p>
            <ul className="mt-8 space-y-4 text-sm font-sans">
              {[
                "Calculate scores using cosine similarity math",
                "Breakdown fit percentages by skill weights",
                "Visualize match scores dynamically on mount",
                "Keep application progress in a simple candidate tracker",
              ].map((x) => (
                <li key={x} className="flex items-start gap-3 text-foreground">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-secondary text-foreground">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                  <span className="leading-snug">{x}</span>
                </li>
              ))}
            </ul>
            <motion.div className="mt-10" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href={candidateLink}
                onClick={() => UISoundManager.playSuccess()}
                onMouseEnter={() => UISoundManager.playHover()}
                className="group inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-card px-7 py-3.5 text-sm font-semibold text-foreground shadow-xs transition-all duration-300 hover:border-accent hover:text-accent hover:bg-accent/5"
              >
                Upload your resume <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="p-10 lg:p-16 bg-foreground text-background flex flex-col justify-between"
          initial={shouldReduceMotion ? {} : { opacity: 0, x: 15 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <div className="font-serif text-3xl font-normal text-background md:text-4xl">
              Rank applicants by fit vectors, not keywords
            </div>
            <p className="mt-4 max-w-md text-sm text-background/60 font-sans leading-relaxed">
              Ditch the generic search lists. Let our algorithm read and translate candidate resumes
              to match your specific required and nice-to-have skill spec instantly.
            </p>
            <ul className="mt-8 space-y-4 text-sm font-sans">
              {[
                "Structured job forms: must-have vs nice-to-have skills",
                "Applicants pre-ranked by objective fit score",
                "Kanban pipeline: Applied → Reviewed → Interviewed → Offered",
                "Calendar-synced interview scheduling + email alerts",
              ].map((x) => (
                <li key={x} className="flex items-start gap-3 text-background">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[oklch(0.88_0.22_130)] text-foreground">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                  <span className="leading-snug">{x}</span>
                </li>
              ))}
            </ul>
            <motion.div className="mt-10" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href={employerLink}
                onClick={() => UISoundManager.playSuccess()}
                onMouseEnter={() => UISoundManager.playHover()}
                className="group inline-flex items-center gap-2 border-b border-background pb-1 text-sm font-semibold text-background transition-colors duration-300 hover:text-accent hover:border-accent"
              >
                Post a role <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Pipeline() {
  const shouldReduceMotion = useReducedMotion();
  const cols = ["Applied", "Reviewed", "Interviewed", "Offered"];
  const colDetails = {
    Applied: { count: 3, tone: "bg-secondary" },
    Reviewed: { count: 2, tone: "bg-[oklch(0.94_0.06_95)]" },
    Interviewed: { count: 1, tone: "bg-[oklch(0.92_0.12_130)]" },
    Offered: { count: 1, tone: "bg-foreground text-background" }
  };

  // State for candidates inside the pipeline board
  const [boardCards, setBoardCards] = useState([
    { name: "Arjun M.", role: "Frontend Dev", fit: 71, col: "Applied" },
    { name: "Sara K.", role: "React Dev", fit: 68, col: "Applied" },
    { name: "Ravi P.", role: "UI Designer", fit: 64, col: "Applied" },
    { name: "Nina D.", role: "Frontend Lead", fit: 82, col: "Reviewed" },
    { name: "Omar B.", role: "JS Dev", fit: 79, col: "Reviewed" },
    { name: "Priya S.", role: "Senior Backend Eng", fit: 87, col: "Interviewed" },
    { name: "Jules T.", role: "Principal Architect", fit: 93, col: "Offered" }
  ]);

  // Dynamically calculate counts per column
  const getColCount = (col: string) => boardCards.filter(c => c.col === col).length;

  const handleDragEnd = (event: any, info: any, cardName: string) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const x = info.point.x;
    let targetCol = null;

    for (const col of cols) {
      const el = document.getElementById(`col-zone-${col}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right) {
          targetCol = col;
          break;
        }
      }
    }

    if (targetCol) {
      const card = boardCards.find(c => c.name === cardName);
      if (card && card.col !== targetCol) {
        UISoundManager.playSuccess();
      }
      setBoardCards(prev => prev.map(c => c.name === cardName ? { ...c, col: targetCol } : c));
    }
  };

  return (
    <section id="pipeline" className="border-b border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            The pipeline
          </div>
          <h2 className="mt-3 font-serif text-4xl leading-tight text-foreground text-balance md:text-5xl">
            Move humans, not spreadsheets.
          </h2>
          <p className="mt-4 text-muted-foreground font-sans leading-relaxed">
            Every stage triggers the right thing — notifications, calendar invites,
            template emails. Drag candidate cards to update their status instantly!
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-background p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cols.map((colName) => (
              <div
                key={colName}
                id={`col-zone-${colName}`}
                className="rounded-xl border border-border bg-card p-3.5 shadow-xs flex flex-col min-h-[300px] transition-colors"
              >
                {/* Column Header */}
                <div className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold ${colDetails[colName as keyof typeof colDetails].tone}`}>
                  <span>{colName}</span>
                  <span className="tabular-nums opacity-80">
                    <CountUp to={getColCount(colName)} duration={0.3} />
                  </span>
                </div>
                
                {/* Cards Container */}
                <div className="mt-3 space-y-2.5 flex-1">
                  <AnimatePresence>
                    {boardCards
                      .filter((c) => c.col === colName)
                      .map((k) => (
                        <motion.div
                          key={k.name}
                          layout
                          drag={!shouldReduceMotion}
                          dragSnapToOrigin={true}
                          onDragStart={() => UISoundManager.playHover()}
                          onDragEnd={(e, info) => handleDragEnd(e, info, k.name)}
                          onMouseEnter={() => UISoundManager.playHover()}
                          whileDrag={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.12)", cursor: "grabbing" }}
                          className="rounded-lg border border-border bg-background p-3 text-xs shadow-xs hover:border-accent hover:shadow-[0_0_12px_rgba(163,230,53,0.12)] cursor-grab active:cursor-grabbing select-none transition-all duration-200"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground">{k.name}</span>
                            <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] font-bold text-foreground">
                              {k.fit}%
                            </span>
                          </div>
                          <div className="mt-1.5 text-[11px] text-muted-foreground font-sans">{k.role}</div>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const shouldReduceMotion = useReducedMotion();
  const f = [
    {
      t: "Resume parsing",
      d: "PDF/DOCX → structured JSON via LLM, validated & stored.",
      icon: FileText,
    },
    {
      t: "Skill-vector scoring",
      d: "Weighted cosine similarity. Explainable, tunable, fast.",
      icon: Cpu,
    },
    {
      t: "Kanban pipeline",
      d: "Applied → Offered, with drag-and-drop and audit trail.",
      icon: Kanban,
    },
    {
      t: "Interview scheduling",
      d: "Google Calendar sync + Resend email notifications.",
      icon: Calendar,
    },
    {
      t: "Saved searches",
      d: "Alerts on new roles that match your vector above a threshold.",
      icon: Bell,
    },
    {
      t: "Premium listings",
      d: "Razorpay-powered boosts, subscriptions and agency invoices.",
      icon: CreditCard,
    },
  ];

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Everything in the box
        </div>
        <h2 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-foreground text-balance md:text-5xl">
          A full hiring stack, minus the enterprise sludge.
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {f.map((x, idx) => {
            const IconComponent = x.icon;
            return (
              <motion.div
                key={x.t}
                onMouseEnter={() => UISoundManager.playHover()}
                className="group rounded-2xl border border-border bg-card p-7 cursor-default transition-all duration-300 hover:border-accent hover:shadow-[0_0_20px_rgba(163,230,53,0.1)]"
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                whileHover={{ y: -4 }}
              >
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl border border-border bg-secondary text-foreground transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-black">
                  <IconComponent className="h-6 w-6" />
                </div>
                <div className="font-serif text-2xl font-normal text-foreground transition-colors group-hover:text-accent duration-300">{x.t}</div>
                <p className="mt-2.5 text-sm text-muted-foreground font-sans leading-relaxed">{x.d}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Pricing({ session }: { session: any }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const shouldReduceMotion = useReducedMotion();
  const candidateCta = session ? "/dashboard/candidate/jobs" : "/register";
  const recruiterCta = session
    ? (session.user?.role === "EMPLOYER" ? "/dashboard/employer/jobs/new" : "/dashboard/candidate/jobs")
    : "/register";
  const agencyCta = "/register";

  const tiers = [
    {
      n: "Candidate",
      p: "Free",
      s: "Forever",
      f: ["Unlimited applications", "Fit scores on every job", "Kanban tracker", "Basic salary insights"],
      cta: "Create profile",
      href: candidateCta,
      dark: false,
      popular: false,
    },
    {
      n: "Recruiter",
      p: "₹1,999",
      s: "/mo · billed monthly",
      f: ["10 active job posts", "Ranked applicant lists", "Pipeline + scheduling", "Email templates"],
      cta: "Start hiring",
      href: recruiterCta,
      dark: true,
      popular: true,
    },
    {
      n: "Agency",
      p: "Custom",
      s: "Talk to us",
      f: ["Unlimited posts + seats", "Client invoicing (Razorpay)", "White-label pipelines", "Priority support"],
      cta: "Contact sales",
      href: agencyCta,
      dark: false,
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="border-b border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Pricing</div>
            <h2 className="mt-3 font-serif text-4xl leading-tight text-foreground text-balance md:text-5xl">
              Honest tiers. No hidden per-seat math.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground font-sans leading-relaxed">
            {"Test mode Razorpay is wired in. Flip to production when you're ready."}
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {tiers.map((t, idx) => (
            <motion.div
              key={t.n}
              onMouseEnter={() => UISoundManager.playHover()}
              className={`relative flex flex-col rounded-2xl border p-8 cursor-default transition-all duration-300 ${
                t.dark
                  ? "border-foreground bg-foreground text-background hover:shadow-[0_0_30px_rgba(163,230,53,0.2)]"
                  : "border-border bg-card text-foreground hover:border-accent hover:shadow-[0_0_25px_rgba(163,230,53,0.12)]"
              }`}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
            >
              {t.popular && (
                <div className="absolute -top-3.5 right-6 rounded-full bg-[oklch(0.88_0.22_130)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground shadow-xs flex items-center gap-1">
                  <Zap className="h-3 w-3 fill-foreground animate-pulse" /> Most Popular
                </div>
              )}
              <div className="text-xs font-bold uppercase tracking-widest opacity-70">
                {t.n}
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-serif text-5xl font-normal">{t.p}</span>
                <span className="text-sm opacity-70">{t.s}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3 text-sm font-sans">
                {t.f.map((x) => (
                  <li key={x} className="flex items-start gap-2.5">
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 stroke-[2.5] ${
                        t.dark ? "text-[oklch(0.88_0.22_130)]" : "text-foreground"
                      }`}
                    />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
              <motion.div className="mt-8" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href={t.href}
                  onClick={() => UISoundManager.playSuccess()}
                  onMouseEnter={() => UISoundManager.playHover()}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-center text-sm font-semibold transition-all duration-300 ${
                    t.dark
                      ? "bg-[oklch(0.88_0.22_130)] text-foreground hover:bg-[oklch(0.88_0.22_130)]/90 hover:scale-[1.01]"
                      : "bg-foreground text-background hover:bg-accent hover:text-black"
                  }`}
                >
                  {t.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const shouldReduceMotion = useReducedMotion();
  const reviews = [
    {
      name: "Sarah J.",
      role: "HR Director at TechCorp",
      text: "Fitboard cut our time-to-interview by 60%. The vector match scores are incredibly accurate and save hours of parsing resumes.",
      rating: 5
    },
    {
      name: "Vikram M.",
      role: "Staff Frontend Engineer",
      text: "As a candidate, I love knowing exactly how well my resume aligns with the job spec before applying. No more keyword voids.",
      rating: 5
    }
  ];

  return (
    <section className="border-b border-border bg-background/50">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-serif text-4xl leading-tight text-foreground text-balance md:text-5xl">
            Trusted by candidates & hiring teams
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {reviews.map((r, idx) => (
            <motion.div
              key={r.name}
              onMouseEnter={() => UISoundManager.playHover()}
              className="p-8 border border-border bg-card rounded-2xl cursor-default transition-all duration-300 hover:border-accent hover:shadow-[0_0_20px_rgba(163,230,53,0.1)] relative flex flex-col justify-between"
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <div className="space-y-4">
                {/* Star rating sequential pop-in */}
                <div className="flex gap-1">
                  {[...Array(r.rating)].map((_, starIdx) => (
                    <motion.div
                      key={starIdx}
                      initial={shouldReduceMotion ? {} : { scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: (idx * 0.15) + (starIdx * 0.08), type: "spring", stiffness: 260 }}
                    >
                      <Star className="h-4 w-4 fill-[#8cfa3c] text-[#8cfa3c]" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-sm text-foreground/90 font-sans leading-relaxed italic">
                  {"\"" + r.text + "\""}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/40 flex flex-col gap-0.5">
                <span className="font-bold text-foreground text-sm font-sans">{r.name}</span>
                <span className="text-xs text-muted-foreground font-mono">{r.role}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA({ session }: { session: any }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const shouldReduceMotion = useReducedMotion();
  const actionLink = session
    ? (session.user?.role === "EMPLOYER" ? "/dashboard/employer/jobs/new" : "/dashboard/candidate/jobs")
    : "/register";
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-24 text-center">
        <motion.h2
          className="mx-auto max-w-3xl font-serif text-5xl leading-[1.05] text-foreground text-balance md:text-6xl font-normal"
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Hire on <span className="italic">fit</span>, not on how well someone
          reverse-engineered your job post.
        </motion.h2>
        <motion.div
          className="mt-10 flex flex-wrap justify-center gap-4"
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href={actionLink}
              onClick={() => UISoundManager.playSuccess()}
              onMouseEnter={() => UISoundManager.playHover()}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-background shadow-xs transition-colors duration-300 hover:bg-accent hover:text-black"
            >
              Post your first job — free <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href={session ? "/dashboard/candidate/jobs" : "/register"}
              onClick={() => UISoundManager.playSuccess()}
              onMouseEnter={() => UISoundManager.playHover()}
              className="inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-card px-7 py-3.5 text-sm font-semibold text-foreground shadow-xs transition-all duration-300 hover:border-accent hover:text-accent hover:bg-accent/5"
            >
              Upload your resume
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 py-16 md:grid-cols-5">
        <div className="col-span-2">
          <Link 
            href="/" 
            onClick={(e) => {
              UISoundManager.playClick();
              if (window.location.pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="inline-flex items-center gap-2 text-lg font-black select-none cursor-pointer group"
          >
            <span className="grid h-7 w-7 place-items-center rounded-md bg-background text-foreground text-xs font-mono transition-transform group-hover:rotate-6">◆</span>
            <span className="font-serif text-xl font-bold text-background">Fitboard</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm text-background/60 font-sans leading-relaxed">
            Skill-vector matching for the modern job market. Built on Next.js, Prisma,
            Neon Postgres and a healthy suspicion of keyword search.
          </p>
        </div>
        {[
          { h: "Product", l: ["Matching", "Pipeline", "Parsing", "Integrations"] },
          { h: "Company", l: ["About", "Careers", "Contact", "Press"] },
          { h: "Legal", l: ["Terms", "Privacy", "Security", "DPA"] },
        ].map((c) => (
          <div key={c.h}>
            <div className="text-xs font-semibold uppercase tracking-widest text-background/50">{c.h}</div>
            <ul className="mt-4 space-y-2.5 text-sm font-sans font-medium">
              {c.l.map((x) => (
                <li key={x}>
                  <a 
                    href="#" 
                    onMouseEnter={() => UISoundManager.playHover()} 
                    onClick={(e) => { e.preventDefault(); UISoundManager.playClick(); }} 
                    className="text-background/80 transition-colors hover:text-accent duration-200"
                  >
                    {x}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-background/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-6 py-6 text-xs text-background/50 font-mono">
          <span>© {new Date().getFullYear()} Fitboard. All rights reserved.</span>
          <span>v_c · v_j / ‖v_c‖‖v_j‖</span>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPageClient({ session }: { session: any }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav session={session} />
      <main>
        <Hero session={session} />
        <HowItWorks />
        <Roles session={session} />
        <Pipeline />
        <Features />
        <Pricing session={session} />
        <Testimonials />
        <CTA session={session} />
      </main>
      <Footer />
    </div>
  );
}
