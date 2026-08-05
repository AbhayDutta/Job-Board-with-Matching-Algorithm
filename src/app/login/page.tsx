"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { sendMagicLinkAction } from "@/app/actions/magic-link";
import { AlertCircle, Loader2, CheckCircle2, Sparkles, Mail, KeyRound } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import Navbar from "@/components/Navbar";
import DoodlePatternBackground from "@/components/DoodlePatternBackground";

function LoginContent() {
  const searchParams = useSearchParams();
  const magicToken = searchParams.get("magicToken");
  const urlError = searchParams.get("error");

  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    urlError ? "Invalid or expired link. Please request a new magic link." : null
  );
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [magicUrl, setMagicUrl] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
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
      const res = await sendMagicLinkAction({ email });
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

  const handleOAuthSignIn = (provider: "google" | "github") => {
    setOauthLoading(provider);
    signIn(provider, { callbackUrl: "/dashboard/candidate/jobs" });
  };

  return (
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
            AUTHENTICATION
          </span>
          <h1 className="text-3xl font-serif font-normal text-foreground tracking-tight mb-2">
            Welcome back
          </h1>
          <p className="text-xs font-mono text-muted-foreground leading-relaxed">
            {mode === "magic"
              ? "Enter your email to sign in instantly with a magic link."
              : "Sign in with your email and password credentials."}
          </p>
        </div>

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
            <motion.div
              key="magicSent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="my-6 text-center space-y-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-xs"
            >
              <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-sm text-foreground font-sans">Magic link sent!</h3>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Check your inbox ({email}) for your instant sign-in link.
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
                      "Send magic link"
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
          )}
        </AnimatePresence>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/60" />
          </div>
          <span className="relative bg-card px-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Or continue with
          </span>
        </div>

        {/* Social OAuth Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Google Button */}
          <button
            type="button"
            disabled={!!oauthLoading}
            onClick={() => handleOAuthSignIn("google")}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono bg-secondary/60 border border-border/80 text-foreground hover:bg-secondary active:scale-[0.97] transition-all cursor-pointer disabled:opacity-40"
          >
            {oauthLoading === "google" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Google
              </>
            )}
          </button>

          {/* GitHub Button */}
          <button
            type="button"
            disabled={!!oauthLoading}
            onClick={() => handleOAuthSignIn("github")}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono bg-secondary/60 border border-border/80 text-foreground hover:bg-secondary active:scale-[0.97] transition-all cursor-pointer disabled:opacity-40"
          >
            {oauthLoading === "github" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </>
            )}
          </button>
        </div>

        <p className="mt-6 text-[10px] font-mono text-muted-foreground text-center">
          {"Don't"} have an account?{" "}
          <Link href="/register" className="text-foreground hover:text-accent underline font-semibold transition-colors">
            Sign up free
          </Link>
        </p>
      </motion.div>
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
