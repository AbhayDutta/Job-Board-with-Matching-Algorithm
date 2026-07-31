"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User as UserIcon, Briefcase, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CANDIDATE" | "EMPLOYER">("CANDIDATE");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await registerUser({ name, email, password, role });

      if (!res.success) {
        setError(res.error || "An error occurred during registration.");
        setLoading(false);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-tr from-background via-background to-[oklch(0.88_0.22_130/0.05)] pointer-events-none" />
      
      <motion.div
        className="w-full max-w-lg z-10"
        initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        <Card className="relative w-full border border-border bg-card shadow-match-glow rounded-2xl p-6">
          <CardHeader className="space-y-1 text-center">
            <Link href="/" className="inline-flex items-center justify-center gap-2 text-lg font-black tracking-tight text-foreground mb-4 group select-none">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-foreground text-background text-xs font-mono transition-transform group-hover:rotate-6">◆</span>
              <span className="font-serif text-xl font-bold">Fitboard</span>
            </Link>
            <CardTitle className="font-serif text-[30px] font-normal leading-[1.1] text-foreground">Create account</CardTitle>
            <CardDescription className="text-sm text-muted-foreground font-sans mt-1.5">
              Sign up to start matching jobs with weighted skill vectors
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-4">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl bg-green-500/10 p-6 text-sm text-green-700 dark:text-green-400 font-medium border border-green-500/20 text-center space-y-3"
                >
                  <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
                  <p className="text-lg font-serif font-medium text-foreground">Registration successful!</p>
                  <p className="text-xs text-muted-foreground">Redirecting to login page...</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={shouldReduceMotion ? {} : { opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={shouldReduceMotion ? {} : { opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive font-medium border border-destructive/20">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>{error}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Role selection visual cards */}
                  <div className="space-y-2">
                    <Label className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">I want to join as</Label>
                    <div className="grid grid-cols-2 gap-3 relative bg-muted/10 p-1.5 rounded-xl border border-border/80 overflow-hidden">
                      {/* Sliding background container */}
                      <div className="absolute inset-0 p-1.5 pointer-events-none select-none">
                        <motion.div
                          className="h-full rounded-lg bg-secondary/80 border border-foreground/15 shadow-xs"
                          animate={{
                            x: role === "CANDIDATE" ? 0 : "100%",
                          }}
                          style={{
                            width: "calc(50% - 12px)"
                          }}
                          transition={
                            shouldReduceMotion
                              ? { duration: 0 }
                              : { type: "spring", stiffness: 350, damping: 28 }
                          }
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setRole("CANDIDATE")}
                        className="relative z-10 flex flex-col items-start p-4 rounded-lg text-left transition-colors cursor-pointer select-none"
                      >
                        <UserIcon className={`h-5 w-5 mb-2 transition-colors ${role === "CANDIDATE" ? "text-foreground" : "text-muted-foreground"}`} />
                        <div className="font-semibold text-sm text-foreground">Candidate</div>
                        <div className="text-[11px] text-muted-foreground leading-tight mt-0.5 font-sans">Discover jobs that match your vector</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole("EMPLOYER")}
                        className="relative z-10 flex flex-col items-start p-4 rounded-lg text-left transition-colors cursor-pointer select-none"
                      >
                        <Briefcase className={`h-5 w-5 mb-2 transition-colors ${role === "EMPLOYER" ? "text-foreground" : "text-muted-foreground"}`} />
                        <div className="font-semibold text-sm text-foreground">Employer</div>
                        <div className="text-[11px] text-muted-foreground leading-tight mt-0.5 font-sans">Post roles & rank applicants</div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                    <motion.div
                      animate={{
                        scale: isNameFocused && !shouldReduceMotion ? 1.015 : 1,
                        borderColor: isNameFocused ? "var(--color-foreground)" : "var(--color-border)",
                      }}
                      transition={{ duration: 0.2 }}
                      className="rounded-xl border bg-background overflow-hidden"
                    >
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => setIsNameFocused(true)}
                        onBlur={() => setIsNameFocused(false)}
                        className="h-11 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 rounded-none shadow-none"
                      />
                    </motion.div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Email</Label>
                    <motion.div
                      animate={{
                        scale: isEmailFocused && !shouldReduceMotion ? 1.015 : 1,
                        borderColor: isEmailFocused ? "var(--color-foreground)" : "var(--color-border)",
                      }}
                      transition={{ duration: 0.2 }}
                      className="rounded-xl border bg-background overflow-hidden"
                    >
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setIsEmailFocused(true)}
                        onBlur={() => setIsEmailFocused(false)}
                        className="h-11 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 rounded-none shadow-none"
                      />
                    </motion.div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                    <motion.div
                      animate={{
                        scale: isPasswordFocused && !shouldReduceMotion ? 1.015 : 1,
                        borderColor: isPasswordFocused ? "var(--color-foreground)" : "var(--color-border)",
                      }}
                      transition={{ duration: 0.2 }}
                      className="rounded-xl border bg-background overflow-hidden"
                    >
                      <Input
                        id="password"
                        type="password"
                        required
                        placeholder="Min. 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        className="h-11 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 rounded-none shadow-none"
                      />
                    </motion.div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="btn-tactile w-full rounded-full bg-foreground py-6 text-sm font-semibold text-background transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:opacity-90 mt-4 cursor-pointer inline-flex items-center justify-center gap-2 overflow-hidden"
                  >
                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.span
                          key="loading"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-1.5"
                        >
                          <Loader2 className="h-4 w-4 animate-spin" /> Creating account...
                        </motion.span>
                      ) : (
                        <motion.span
                          key="idle"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-1.5"
                        >
                          Create Account <ArrowRight className="h-4 w-4" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </form>
              )}
            </AnimatePresence>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-center gap-1 border-t border-border mt-6 pt-4 text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-foreground hover:underline">
              Sign in
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
