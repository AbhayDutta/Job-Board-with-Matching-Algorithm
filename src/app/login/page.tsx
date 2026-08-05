"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { sendMagicLinkAction } from "@/app/actions/magic-link";
import { AlertCircle, Loader2, Sparkles, Mail, KeyRound, MailCheck } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import Navbar from "@/components/Navbar";
import DoodlePatternBackground from "@/components/DoodlePatternBackground";

function LoginContent() {
  const searchParams = useSearchParams();
  const magicToken = searchParams.get("magicToken");
  const urlError = searchParams.get("error");

  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [role, setRole] = useState<"CANDIDATE" | "EMPLOYER">("CANDIDATE");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    urlError ? "Invalid or expired link. Please request a new magic link." : null
  );
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [magicUrl, setMagicUrl] = useState<string | null>(null);
  const [autoAuthenticating, setAutoAuthenticating] = useState(!!magicToken);

  const router = useRouter();
  const { data: session, status } = useSession();
  const shouldReduceMotion = useReducedMotion();

  // Auto-authenticate when coming from Magic Link click (?magicToken=XYZ)
  useEffect(() => {
    if (magicToken) {
      const handleMagicAuth = async () => {
        setAutoAuthenticating(true);
        setError(null);
        try {
          const res = await signIn("credentials", {
            magicToken,
            redirect: false,
          });

          if (res?.error) {
            setError("Magic link verification failed or expired. Please request a new one.");
            setAutoAuthenticating(false);
          } else {
            const sessionRes = await fetch("/api/auth/session");
            const sessData = await sessionRes.json();
            if (sessData?.user?.role === "EMPLOYER") {
              router.push("/dashboard/employer/jobs");
            } else {
              router.push("/dashboard/candidate/jobs");
            }
            router.refresh();
          }
        } catch (err) {
          console.error(err);
          setError("Failed to authenticate magic link.");
          setAutoAuthenticating(false);
        }
      };

      handleMagicAuth();
    }
  }, [magicToken, router]);

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

  const handleMagicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await sendMagicLinkAction({ email, role });
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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password.");
        setLoading(false);
      } else {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        if (session?.user?.role === "EMPLOYER") {
          router.push("/dashboard/employer/jobs");
        } else {
          router.push("/dashboard/candidate/jobs");
        }
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 py-16 flex items-center justify-center px-4 relative z-10">
      {/* Soft Ambient Glow Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-80 w-80 rounded-full bg-[oklch(0.87_0.22_130/0.18)] dark:bg-[oklch(0.87_0.22_130/0.12)] blur-[80px] animate-breathe pointer-events-none" />

      <AnimatePresence mode="wait">
        {autoAuthenticating ? (
          <motion.div
            key="autoAuth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="my-8 py-6 text-center space-y-3 font-mono text-xs text-muted-foreground"
          >
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-foreground" />
            <p>Authenticating your magic link...</p>
          </motion.div>
        ) : magicSent ? (
          /* ── Confirmation Screen ── */
          <motion.div
            key="magicSentScreen"
            initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="mx-auto max-w-md w-full p-8 text-center"
          >
            <div className="mx-auto h-16 w-16 rounded-full bg-[#0d2818] border border-[#1b432c] grid place-items-center mb-6 shadow-lg shadow-emerald-950/30">
              <MailCheck className="h-7 w-7 text-emerald-400" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-sans font-bold text-foreground tracking-tight mb-4">
              Check your email
            </h1>

            <p className="text-sm font-sans text-muted-foreground leading-relaxed max-w-sm mx-auto mb-8">
              We sent a magic link to <strong className="text-foreground font-semibold">{email}</strong>. Click it to sign in as <span className="text-accent font-bold font-mono">{role === "EMPLOYER" ? "Recruiter" : "Candidate"}</span> instantly.
            </p>

            {magicUrl && (
              <div className="pt-2 max-w-xs mx-auto space-y-3">
                <a
                  href={magicUrl}
                  className="inline-block w-full py-3 px-5 rounded-xl bg-foreground text-background font-mono text-xs font-bold hover:bg-accent hover:text-black transition-all shadow-md"
                >
                  ✨ Direct Login Link (Demo Mode) →
                </a>
                <button
                  type="button"
                  onClick={() => setMagicSent(false)}
                  className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors underline cursor-pointer"
                >
                  Use a different email or role
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          /* ── Login Form Card ── */
          <motion.div
            key="loginCard"
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
            className="mx-auto max-w-sm w-full p-8 text-center bg-card/90 backdrop-blur-xl border border-border/80 rounded-3xl shadow-2xl ring-1 ring-accent/20 hover:ring-accent/40 transition-all duration-300"
          >
            {/* Header Badge & Title */}
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-secondary text-muted-foreground border border-border/60 mb-3">
                <Sparkles className="h-3 w-3 text-[oklch(0.88_0.22_130)]" />
                AUTHENTICATION
              </span>
              <h1 className="text-3xl font-serif font-normal text-foreground tracking-tight mb-2">
                Welcome back
              </h1>
              <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                Choose your role and enter your email to sign in.
              </p>
            </div>

            <div className="space-y-3 text-left">
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

              {/* Mode Selector Toggle */}
              <div className="p-1 rounded-xl bg-secondary/60 border border-border/80 grid grid-cols-2 gap-1 text-[11px] font-mono mb-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("magic");
                    setError(null);
                  }}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    mode === "magic"
                      ? "bg-background text-foreground border border-border/60 font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Mail className="h-3 w-3" /> Magic Link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("password");
                    setError(null);
                  }}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    mode === "password"
                      ? "bg-background text-foreground border border-border/60 font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <KeyRound className="h-3 w-3" /> Password
                </button>
              </div>

              {mode === "magic" ? (
                <form onSubmit={handleMagicSubmit} className="space-y-3.5">
                  <div>
                    <label htmlFor="login-email-input" className="sr-only">Email address</label>
                    <input
                      id="login-email-input"
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
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending link...
                      </span>
                    ) : (
                      `Send magic link (${role === "EMPLOYER" ? "Recruiter" : "Candidate"})`
                    )}
                  </button>

                  <p className="text-[11px] font-mono text-muted-foreground text-center pt-1 leading-normal">
                    No password needed. {"We'll"} sign you in automatically.
                  </p>
                </form>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
                  <div>
                    <label htmlFor="login-email-pass-input" className="sr-only">email</label>
                    <input
                      id="login-email-pass-input"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-secondary/60 border border-border/80 rounded-xl px-4 py-3 text-xs text-foreground font-mono outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shadow-xs"
                    />
                  </div>

                  <div>
                    <label htmlFor="login-password-input" className="sr-only">password</label>
                    <input
                      id="login-password-input"
                      type="password"
                      required
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Signing in...
                      </span>
                    ) : (
                      "Sign in →"
                    )}
                  </button>
                </form>
              )}
            </div>

            <p className="mt-8 text-[10px] font-mono text-muted-foreground text-center border-t border-border/40 pt-4">
              {"Don't"} have an account?{" "}
              <Link href="/register" className="text-foreground hover:text-accent underline font-semibold transition-colors">
                Sign up free
              </Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      <DoodlePatternBackground />
      
      {/* Full Main Navigation Bar matching Home Page Header */}
      <Navbar ctaText="Get Started →" ctaHref="/register" />

      <Suspense fallback={
        <main className="flex-1 py-16 flex items-center justify-center font-mono text-xs text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2 text-foreground" /> Loading auth...
        </main>
      }>
        <LoginContent />
      </Suspense>

      {/* Fitboard Minimal Theme Footer */}
      <footer className="w-full px-6 pb-8 text-center text-xs font-mono text-muted-foreground border-t border-border/60 pt-6">
        Fitboard Skill Matching Engine · Passwordless Authentication
      </footer>
    </div>
  );
}
