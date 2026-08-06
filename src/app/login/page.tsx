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

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
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
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const magicToken = searchParams.get("magicToken");
  const urlError = searchParams.get("error");

  const [mode, setMode] = useState<"password" | "magic">("password");
  const [role, setRole] = useState<"CANDIDATE" | "EMPLOYER">("CANDIDATE");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    urlError ? "Authentication failed or session expired." : null
  );
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);
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
          let targetRole = "CANDIDATE";
          try {
            const rawPayload = magicToken.split(".")[0];
            const parsed = JSON.parse(atob(rawPayload));
            if (parsed.role === "EMPLOYER") targetRole = "EMPLOYER";
          } catch (e) {
            console.error("Token payload decode error", e);
          }

          const targetUrl =
            targetRole === "EMPLOYER"
              ? "/dashboard/employer/jobs"
              : "/dashboard/candidate/jobs";

          const res = await signIn("credentials", {
            magicToken,
            redirect: false,
          });

          if (res?.error) {
            setError("Magic link verification failed or expired.");
            setAutoAuthenticating(false);
          } else {
            window.location.href = targetUrl;
          }
        } catch (err) {
          console.error(err);
          setError("Failed to authenticate magic link.");
          setAutoAuthenticating(false);
        }
      };

      handleMagicAuth();
    }
  }, [magicToken]);

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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password. Please check your credentials.");
        setLoading(false);
      } else {
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        if (sessionData?.user?.role === "EMPLOYER") {
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

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setError(null);
    setOauthLoading(provider);
    const callbackUrl = role === "EMPLOYER" ? "/dashboard/employer/jobs" : "/dashboard/candidate/jobs";
    try {
      await signIn(provider, { callbackUrl });
    } catch (err) {
      console.error(err);
      setError(`Failed to sign in with ${provider}.`);
      setOauthLoading(null);
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
            <p>Authenticating session...</p>
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
              We sent a magic link to <strong className="text-foreground font-semibold">{email}</strong>. Click it to sign in instantly.
            </p>

            <div className="pt-2 max-w-xs mx-auto space-y-3">
              <a
                href={email.toLowerCase().endsWith("@gmail.com") ? "https://mail.google.com" : `https://${email.split("@")[1] || "gmail.com"}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl bg-foreground text-background font-mono text-xs font-bold hover:bg-accent hover:text-black transition-all shadow-md"
              >
                <Mail className="h-4 w-4" /> Open Email Client →
              </a>
              <button
                type="button"
                onClick={() => setMagicSent(false)}
                className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors underline cursor-pointer block w-full text-center"
              >
                Use password or social login
              </button>
            </div>
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
                Sign in to your Fitboard account to continue.
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

              {/* Role Selector */}
              <div className="p-1 rounded-xl bg-secondary/60 border border-border/80 grid grid-cols-2 gap-1 text-[11px] font-mono mb-2">
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

              {/* ── 1-Click Social Sign-In (Google & GitHub) ── */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn("google")}
                  disabled={!!oauthLoading}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-secondary/80 hover:bg-secondary border border-border/80 text-xs font-mono font-medium text-foreground transition-all cursor-pointer hover:border-accent/40 active:scale-[0.98] disabled:opacity-50"
                >
                  {oauthLoading === "google" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <GoogleIcon /> Google
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuthSignIn("github")}
                  disabled={!!oauthLoading}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-secondary/80 hover:bg-secondary border border-border/80 text-xs font-mono font-medium text-foreground transition-all cursor-pointer hover:border-accent/40 active:scale-[0.98] disabled:opacity-50"
                >
                  {oauthLoading === "github" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <GithubIcon /> GitHub
                    </>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-border/60 w-full" />
                <span className="bg-card px-2 text-[10px] font-mono uppercase text-muted-foreground shrink-0">
                  or email & password
                </span>
                <div className="border-t border-border/60 w-full" />
              </div>

              {/* Mode Toggle (Password vs Magic Link) */}
              <div className="flex items-center justify-end mb-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "password" ? "magic" : "password");
                    setError(null);
                  }}
                  className="text-[11px] font-mono text-muted-foreground hover:text-accent underline transition-colors"
                >
                  {mode === "password" ? "Use Magic Link instead" : "Use Password instead"}
                </button>
              </div>

              {mode === "password" ? (
                <form onSubmit={handlePasswordSubmit} className="space-y-3">
                  <div>
                    <label htmlFor="login-email-pass-input" className="sr-only">Email address</label>
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
                    <label htmlFor="login-password-input" className="sr-only">Password</label>
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
              ) : (
                <form onSubmit={handleMagicSubmit} className="space-y-3">
                  <div>
                    <label htmlFor="login-email-magic-input" className="sr-only">Email address</label>
                    <input
                      id="login-email-magic-input"
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
                      `Send Magic Link (${role === "EMPLOYER" ? "Recruiter" : "Candidate"})`
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
        Fitboard Skill Matching Engine · Secure Authentication
      </footer>
    </div>
  );
}
