"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

export function PickleSmiley({ className = "w-6 h-6" }: { className?: string }) {
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

interface NavbarProps {
  session?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  ctaText?: string;
  ctaHref?: string;
}

export default function Navbar({ session, ctaText = "Get Started →", ctaHref = "/register" }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dashboardHref = session?.user?.role === "EMPLOYER" ? "/dashboard/employer/jobs" : "/dashboard/candidate/jobs";
  const primaryHref = session ? dashboardHref : ctaHref;
  const primaryText = session ? "Go to Dashboard" : ctaText;

  return (
    <header className="sticky top-0 z-50 h-[72px] border-b border-border bg-background/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand Logo & Title */}
        <Link 
          href="/" 
          className="group flex items-center gap-2 text-lg font-black tracking-tight text-foreground select-none hover:scale-[1.02] transition-transform"
        >
          <PickleSmiley className="w-7 h-7 hover:rotate-12 transition-transform duration-300" />
          <span className="font-heading text-xl sm:text-[22px] font-black tracking-tight text-foreground transition-colors group-hover:text-accent">
            Fitboard
          </span>
        </Link>

        {/* Center: Full Navigation Section Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
          <Link href="/#how" className="transition-colors hover:text-accent">
            How it works
          </Link>
          <Link href="/#roles" className="transition-colors hover:text-accent">
            For you
          </Link>
          <Link href="/#pipeline" className="transition-colors hover:text-accent">
            Pipeline
          </Link>
          <Link href="/#pricing" className="transition-colors hover:text-accent">
            Pricing
          </Link>
        </nav>

        {/* Right: Theme Toggle & Action CTA */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <ThemeToggle />
          <Link
            href={primaryHref}
            className="hidden sm:inline-flex btn-tactile rounded-full bg-foreground px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-bold text-background hover:scale-102 hover:opacity-95 hover:bg-accent hover:text-black transition-all shadow-xs shrink-0"
          >
            {primaryText}
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-foreground shadow-xs hover:border-foreground/40 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="md:hidden border-b border-border bg-background/95 backdrop-blur-lg overflow-hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-5 text-base font-medium">
              <Link
                href="/#how"
                onClick={() => setMobileMenuOpen(false)}
                className="text-foreground hover:text-accent transition-colors py-1"
              >
                How it works
              </Link>
              <Link
                href="/#roles"
                onClick={() => setMobileMenuOpen(false)}
                className="text-foreground hover:text-accent transition-colors py-1"
              >
                For you
              </Link>
              <Link
                href="/#pipeline"
                onClick={() => setMobileMenuOpen(false)}
                className="text-foreground hover:text-accent transition-colors py-1"
              >
                Pipeline
              </Link>
              <Link
                href="/#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="text-foreground hover:text-accent transition-colors py-1"
              >
                Pricing
              </Link>
              <div className="pt-2 border-t border-border/50">
                <Link
                  href={primaryHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center rounded-full bg-foreground px-5 py-3 text-xs font-bold text-background hover:bg-accent hover:text-black transition-all shadow-xs"
                >
                  {primaryText}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

