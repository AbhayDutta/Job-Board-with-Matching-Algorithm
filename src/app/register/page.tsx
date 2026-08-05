"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { sendMagicLinkAction } from "@/app/actions/magic-link";
import { CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import Navbar from "@/components/Navbar";
import DoodlePatternBackground from "@/components/DoodlePatternBackground";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"CANDIDATE" | "EMPLOYER">("CANDIDATE");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);
  const [magicUrl, setMagicUrl] = useState<string | null>(null);

  const router = useRouter();
  const { data: session, status } = useSession();
  const shouldReduceMotion = useReducedMotion();

  // Auto redirect logged in users directly to dashboard
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (session.user.role === "EMPLOYER") {
        router.push("/dashboard/employer/jobs");
      } else {
        router.push("/dashboard/candidate/jobs");
      }
    }
  }, [session, status, router]);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await sendMagicLinkAction({
        email,
        name: name || undefined,
        role,
      });

      if (res.success) {
        setMagicSent(true);
        if (res.magicLinkUrl) setMagicUrl(res.magicLinkUrl);
      } else {
        setError(res.error || "Failed to send magic link.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      <DoodlePatternBackground />
      
      {/* Full Main Navigation Bar matching Home Page Header */}
      <Navbar ctaText="Sign In →" ctaHref="/login" />

      {/* Main Centered Auth Card */}
      <main className="flex-1 py-16 flex items-center justify-center px-4 relative z-10">
        {/* Soft Ambient Glow Backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-80 w-80 rounded-full bg-[oklch(0.87_0.22_130/0.18)] dark:bg-[oklch(0.87_0.22_130/0.12)] blur-[80px] animate-breathe pointer-events-none" />

        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
          className="mx-auto max-w-sm w-full p-8 text-center bg-card/90 backdrop-blur-xl border border-border/80 rounded-3xl shadow-2xl ring-1 ring-accent/20 hover:ring-accent/40 transition-all duration-300"
        >
          {/* Header Badge & Title */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-secondary text-muted-foreground border border-border/60 mb-3">
              <Sparkles className="h-3 w-3 text-[oklch(0.88_0.22_130)]" />
              GET STARTED
            </span>
            <h1 className="text-3xl font-serif font-normal text-foreground tracking-tight mb-2">
              Create your account
            </h1>
            <p className="text-xs font-mono text-muted-foreground leading-relaxed">
              Enter your details and {"we'll"} send a magic link to sign in instantly.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {magicSent ? (
              <motion.div
                key="magicSent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="my-6 text-center space-y-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-xs"
              >
                <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-sm text-foreground font-sans">Magic link sent!</h3>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Check your inbox ({email}) for your magic sign-in link.
                </p>

                {magicUrl && (
                  <div className="pt-2">
                    <a
                      href={magicUrl}
                      className="inline-block w-full py-2.5 px-4 rounded-xl bg-foreground text-background font-mono text-[11px] font-bold hover:bg-accent hover:text-black transition-colors"
                    >
                      ✨ Direct Login Link (Demo Mode) →
                    </a>
                  </div>
                )}
              </motion.div>
            ) : (
              <form onSubmit={handleSendMagicLink} className="space-y-3.5 text-left">
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={shouldReduceMotion ? {} : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={shouldReduceMotion ? {} : { opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs font-mono text-destructive border border-destructive/20">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Role Switcher */}
                <div className="p-1 rounded-xl bg-secondary/60 border border-border/80 grid grid-cols-2 gap-1 text-[11px] font-mono mb-1">
                  <button
                    type="button"
                    onClick={() => setRole("CANDIDATE")}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      role === "CANDIDATE"
                        ? "bg-background text-foreground border border-border/60 font-bold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("EMPLOYER")}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      role === "EMPLOYER"
                        ? "bg-background text-foreground border border-border/60 font-bold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Recruiter
                  </button>
                </div>

                <div>
                  <label htmlFor="reg-name-input" className="sr-only">Your name</label>
                  <input
                    id="reg-name-input"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-secondary/60 border border-border/80 rounded-xl px-4 py-3 text-xs text-foreground font-mono outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shadow-xs"
                  />
                </div>

                <div>
                  <label htmlFor="reg-email-input" className="sr-only">Email address</label>
                  <input
                    id="reg-email-input"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-secondary/60 border border-border/80 rounded-xl px-4 py-3 text-xs text-foreground font-mono outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shadow-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs font-mono bg-foreground text-background hover:bg-accent hover:text-black active:scale-[0.97] font-bold transition-all cursor-pointer disabled:opacity-40 shadow-sm"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending magic link...
                    </span>
                  ) : (
                    "Send magic link"
                  )}
                </button>

                <p className="text-[11px] font-mono text-muted-foreground text-center pt-1 leading-normal">
                  No password needed. {"We'll"} create your account automatically.
                </p>
              </form>
            )}
          </AnimatePresence>

          <p className="mt-8 text-[10px] font-mono text-muted-foreground text-center border-t border-border/40 pt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground hover:text-accent underline font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </main>

      {/* Fitboard Minimal Theme Footer */}
      <footer className="w-full px-6 pb-8 text-center text-xs font-mono text-muted-foreground border-t border-border/60 pt-6">
        Fitboard Skill Matching Engine · Passwordless Authentication
      </footer>
    </div>
  );
}
