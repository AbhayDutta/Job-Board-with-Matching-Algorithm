"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const handleSubmit = async (e: React.FormEvent) => {
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
          router.push("/dashboard/employer/jobs/new");
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
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-tr from-background via-background to-[oklch(0.88_0.22_130/0.05)] pointer-events-none" />
      
      <motion.div
        className="w-full max-w-md z-10"
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
            <CardTitle className="font-serif text-[30px] font-normal leading-[1.1] text-foreground">Welcome back</CardTitle>
            <CardDescription className="text-sm text-muted-foreground font-sans mt-1.5">
              Sign in to check your matches and pipeline
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                </div>
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
                      <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
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
                      Sign in <ArrowRight className="h-4 w-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-center gap-1 border-t border-border mt-6 pt-4 text-xs text-muted-foreground">
            {"Don't"} have an account?{" "}
            <Link href="/register" className="font-semibold text-foreground hover:underline">
              Sign up
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
