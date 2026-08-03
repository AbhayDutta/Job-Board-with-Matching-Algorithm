"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobPostingSchema, JobPostingFormData } from "@/lib/validations";
import { createJob, importJobFromUrl } from "@/app/actions/jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2, Sparkles, LogOut, Link2, Globe } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";
import UserProfileModal from "@/components/UserProfileModal";

class SkillSoundManager {
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

  static playHover(freq: number) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {
      console.warn("Audio Context failed:", e);
    }
  }

  static playClick(freq: number) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq * 1.5, now);
      osc.frequency.exponentialRampToValueAtTime(freq, now + 0.08);
      
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      console.warn("Audio Context failed:", e);
    }
  }
}

const TECH_STACK = [
  { name: "React", freq: 261.63, color: "#61DAFB" },
  { name: "TypeScript", freq: 293.66, color: "#3178C6" },
  { name: "JavaScript", freq: 329.63, color: "#F7DF1E" },
  { name: "Next.js", freq: 349.23, color: "#707070" },
  { name: "Node.js", freq: 392.00, color: "#339933" },
  { name: "PostgreSQL", freq: 440.00, color: "#4169E1" },
  { name: "Prisma", freq: 493.88, color: "#5A67D8" },
  { name: "Tailwind CSS", freq: 523.25, color: "#38BDF8" },
  { name: "Docker", freq: 587.33, color: "#2496ED" },
  { name: "Python", freq: 659.25, color: "#3776AB" },
  { name: "AWS", freq: 698.46, color: "#FF9900" },
  { name: "GraphQL", freq: 783.99, color: "#E10098" },
];

export default function NewJobPage() {
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isCompanyFocused, setIsCompanyFocused] = useState(false);
  const [isLocationFocused, setIsLocationFocused] = useState(false);
  const [isSalaryFocused, setIsSalaryFocused] = useState(false);
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  const [isReqSkillsFocused, setIsReqSkillsFocused] = useState(false);
  const [isNiceSkillsFocused, setIsNiceSkillsFocused] = useState(false);

  const [importUrl, setImportUrl] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [isImportFocused, setIsImportFocused] = useState(false);

  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobPostingFormData>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      salary: "",
      description: "",
      skillsRequired: "",
      skillsNiceToHave: "",
    },
  });

  const skillsRequired = watch("skillsRequired") || "";
  const skillsNiceToHave = watch("skillsNiceToHave") || "";

  const handleImport = async () => {
    if (!importUrl) {
      toast.error("Please enter a valid job URL to import.");
      return;
    }
    setImportLoading(true);
    setError(null);
    try {
      const res = await importJobFromUrl(importUrl);
      if (res.success && res.job) {
        setValue("title", res.job.title, { shouldValidate: true });
        setValue("company", res.job.company, { shouldValidate: true });
        setValue("location", res.job.location, { shouldValidate: true });
        setValue("salary", res.job.salary, { shouldValidate: true });
        setValue("description", res.job.description, { shouldValidate: true });
        
        const reqArr = Array.isArray(res.job.skillsRequired) ? (res.job.skillsRequired as string[]) : [];
        const niceArr = Array.isArray(res.job.skillsNiceToHave) ? (res.job.skillsNiceToHave as string[]) : [];
        setValue("skillsRequired", reqArr.join(", "), { shouldValidate: true });
        setValue("skillsNiceToHave", niceArr.join(", "), { shouldValidate: true });

        toast.success("Successfully imported job specifications! Please review and publish.");
        setImportUrl("");
      } else {
        setError(res.error || "Failed to import from URL.");
        toast.error(res.error || "Failed to import from URL.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred during import.");
      toast.error("An unexpected error occurred during import.");
    } finally {
      setImportLoading(false);
    }
  };

  const onSubmit = async (data: JobPostingFormData) => {
    setError(null);
    setLoading(true);

    const reqSkills = data.skillsRequired
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const niceSkills = (data.skillsNiceToHave || "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      const res = await createJob({
        title: data.title,
        company: data.company,
        location: data.location,
        salary: data.salary,
        description: data.description,
        skillsRequired: reqSkills,
        skillsNiceToHave: niceSkills,
      });

      if (!res.success) {
        setError(res.error || "An error occurred");
        setLoading(false);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard/employer/jobs");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  const parsedReqSkills = skillsRequired
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const parsedNiceSkills = skillsNiceToHave
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const handleTechClick = (techName: string, isRequired: boolean, isNice: boolean) => {
    const addSkill = (list: string, name: string) => {
      const skills = list.split(",").map(s => s.trim()).filter(s => s.length > 0);
      if (!skills.some(s => s.toLowerCase() === name.toLowerCase())) {
        skills.push(name);
      }
      return skills.join(", ");
    };

    const removeSkill = (list: string, name: string) => {
      return list
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0 && s.toLowerCase() !== name.toLowerCase())
        .join(", ");
    };

    if (isRequired) {
      // Required -> Nice-to-Have
      setValue("skillsRequired", removeSkill(skillsRequired, techName), { shouldValidate: true });
      setValue("skillsNiceToHave", addSkill(skillsNiceToHave, techName), { shouldValidate: true });
    } else if (isNice) {
      // Nice-to-Have -> Unselected
      setValue("skillsNiceToHave", removeSkill(skillsNiceToHave, techName), { shouldValidate: true });
    } else {
      // Unselected -> Required
      setValue("skillsRequired", addSkill(skillsRequired, techName), { shouldValidate: true });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="group flex items-center gap-2.5 text-lg font-black tracking-tight text-foreground select-none">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-foreground text-background text-xs font-mono transition-transform group-hover:rotate-6">◆</span>
            <span className="font-serif text-xl font-bold">Fitboard</span>
          </Link>
          <nav className="flex gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/dashboard/employer/jobs" className="transition-colors hover:text-foreground">
              My Postings
            </Link>
            <Link href="/dashboard/employer/jobs/new" className="text-foreground border-b-2 border-foreground pb-1 font-semibold">
              Post a Job
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {session?.user && (
              <UserProfileModal
                user={{
                  id: session.user.id || "employer-id",
                  email: session.user.email || "employer@fitboard.com",
                  name: (session.user as any).name || session.user.email?.split("@")[0],
                  role: session.user.role || "EMPLOYER",
                }}
              />
            )}
            <Button
              variant="ghost"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex items-center gap-1.5 text-sm font-semibold hover:bg-secondary rounded-full px-4 py-2 transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main container */}
      <main className="mx-auto max-w-3xl px-6 py-12">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Card className="border border-border bg-card shadow-match-glow rounded-2xl p-6">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                <Sparkles className="h-3.5 w-3.5 text-[oklch(0.72_0.18_35)]" />
                New Job Matching Specification
              </div>
              <CardTitle className="font-serif text-[30px] font-normal leading-[1.1] text-foreground">Post a new role</CardTitle>
              <CardDescription className="text-sm text-muted-foreground font-sans mt-1.5">
                Define requirements and candidate weighted skill vector criteria
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
                    <p className="text-lg font-serif font-medium text-foreground">Job posted successfully!</p>
                    <p className="text-xs text-muted-foreground">Redirecting to postings dashboard...</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

                    {/* URL Auto-Importer */}
                    <div className="space-y-3 rounded-2xl border border-dashed border-border/80 bg-secondary/15 p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="importUrl" className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 font-mono">
                          <Link2 className="h-3.5 w-3.5 text-accent" /> Import Spec from URL
                        </Label>
                        <span className="text-[9.5px] font-semibold font-mono text-muted-foreground select-none uppercase tracking-wider">
                          LinkedIn / Indeed
                        </span>
                      </div>
                      <div className="flex gap-2.5">
                        <motion.div
                          animate={{
                            scale: isImportFocused && !shouldReduceMotion ? 1.01 : 1,
                            borderColor: isImportFocused ? "var(--color-foreground)" : "var(--color-border)",
                          }}
                          transition={{ duration: 0.2 }}
                          className="flex-1 rounded-xl border bg-background overflow-hidden"
                        >
                          <Input
                            id="importUrl"
                            placeholder="Paste LinkedIn or Indeed job link..."
                            value={importUrl}
                            onChange={(e) => setImportUrl(e.target.value)}
                            onFocus={() => setIsImportFocused(true)}
                            onBlur={() => setIsImportFocused(false)}
                            className="h-10 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 rounded-none shadow-none text-xs"
                          />
                        </motion.div>
                        <button
                          type="button"
                          disabled={importLoading}
                          onClick={handleImport}
                          className="px-5 cursor-pointer h-10 inline-flex items-center justify-center gap-1.5 rounded-xl bg-foreground text-background text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:bg-[oklch(0.88_0.22_130)] hover:text-black disabled:opacity-50 select-none shadow-xs"
                        >
                          {importLoading ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Importing...
                            </>
                          ) : (
                            <>
                              <Globe className="h-3.5 w-3.5" /> Auto-Import
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-sans">
                        Provide a job posting link from the internet and we will automatically extract the specs, weights, and criteria.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Job Title</Label>
                        <motion.div
                          animate={{
                            scale: isTitleFocused && !shouldReduceMotion ? 1.015 : 1,
                            borderColor: errors.title ? "var(--color-destructive)" : isTitleFocused ? "var(--color-foreground)" : "var(--color-border)",
                          }}
                          transition={{ duration: 0.2 }}
                          className="rounded-xl border bg-background overflow-hidden"
                        >
                          <Input
                            id="title"
                            placeholder="e.g. Senior Frontend Engineer"
                            {...register("title")}
                            onFocus={() => setIsTitleFocused(true)}
                            onBlur={(e) => {
                              register("title").onBlur(e);
                              setIsTitleFocused(false);
                            }}
                            className="h-11 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 rounded-none shadow-none"
                          />
                        </motion.div>
                        {errors.title && (
                          <p className="text-[11.5px] font-medium text-destructive font-sans mt-1">
                            {errors.title.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Company Name</Label>
                        <motion.div
                          animate={{
                            scale: isCompanyFocused && !shouldReduceMotion ? 1.015 : 1,
                            borderColor: errors.company ? "var(--color-destructive)" : isCompanyFocused ? "var(--color-foreground)" : "var(--color-border)",
                          }}
                          transition={{ duration: 0.2 }}
                          className="rounded-xl border bg-background overflow-hidden"
                        >
                          <Input
                            id="company"
                            placeholder="e.g. Fitboard Inc."
                            {...register("company")}
                            onFocus={() => setIsCompanyFocused(true)}
                            onBlur={(e) => {
                              register("company").onBlur(e);
                              setIsCompanyFocused(false);
                            }}
                            className="h-11 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 rounded-none shadow-none text-[15px]"
                          />
                        </motion.div>
                        {errors.company && (
                          <p className="text-[11.5px] font-medium text-destructive font-sans mt-1">
                            {errors.company.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Location</Label>
                        <motion.div
                          animate={{
                            scale: isLocationFocused && !shouldReduceMotion ? 1.015 : 1,
                            borderColor: errors.location ? "var(--color-destructive)" : isLocationFocused ? "var(--color-foreground)" : "var(--color-border)",
                          }}
                          transition={{ duration: 0.2 }}
                          className="rounded-xl border bg-background overflow-hidden"
                        >
                          <Input
                            id="location"
                            placeholder="e.g. Bengaluru, India (Hybrid)"
                            {...register("location")}
                            onFocus={() => setIsLocationFocused(true)}
                            onBlur={(e) => {
                              register("location").onBlur(e);
                              setIsLocationFocused(false);
                            }}
                            className="h-11 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 rounded-none shadow-none text-[15px]"
                          />
                        </motion.div>
                        {errors.location && (
                          <p className="text-[11.5px] font-medium text-destructive font-sans mt-1">
                            {errors.location.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="salary" className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Salary / Compensation</Label>
                        <motion.div
                          animate={{
                            scale: isSalaryFocused && !shouldReduceMotion ? 1.015 : 1,
                            borderColor: errors.salary ? "var(--color-destructive)" : isSalaryFocused ? "var(--color-foreground)" : "var(--color-border)",
                          }}
                          transition={{ duration: 0.2 }}
                          className="rounded-xl border bg-background overflow-hidden"
                        >
                          <Input
                            id="salary"
                            placeholder="e.g. ₹18L - ₹24L per annum"
                            {...register("salary")}
                            onFocus={() => setIsSalaryFocused(true)}
                            onBlur={(e) => {
                              register("salary").onBlur(e);
                              setIsSalaryFocused(false);
                            }}
                            className="h-11 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 rounded-none shadow-none text-[15px]"
                          />
                        </motion.div>
                        {errors.salary && (
                          <p className="text-[11.5px] font-medium text-destructive font-sans mt-1">
                            {errors.salary.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Job Description</Label>
                      <motion.div
                        animate={{
                          scale: isDescriptionFocused && !shouldReduceMotion ? 1.01 : 1,
                          borderColor: errors.description ? "var(--color-destructive)" : isDescriptionFocused ? "var(--color-foreground)" : "var(--color-border)",
                        }}
                        transition={{ duration: 0.2 }}
                        className="rounded-xl border bg-background overflow-hidden"
                      >
                        <Textarea
                          id="description"
                          placeholder="Provide a detailed job description, responsibilities, and team expectations..."
                          {...register("description")}
                          onFocus={() => setIsDescriptionFocused(true)}
                          onBlur={(e) => {
                            register("description").onBlur(e);
                            setIsDescriptionFocused(false);
                          }}
                          className="min-h-32 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 rounded-none shadow-none leading-[1.5] text-[15px] outline-hidden"
                        />
                      </motion.div>
                      {errors.description && (
                        <p className="text-[11.5px] font-medium text-destructive font-sans mt-1">
                          {errors.description.message}
                        </p>
                      )}
                    </div>

                    {/* Skill Vectors */}
                    <div className="space-y-3 rounded-xl border border-border bg-background p-4">
                      <Label htmlFor="skillsRequired" className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
                        Required Skills (Must-Haves) — Comma Separated
                      </Label>
                      <motion.div
                        animate={{
                          scale: isReqSkillsFocused && !shouldReduceMotion ? 1.015 : 1,
                          borderColor: errors.skillsRequired ? "var(--color-destructive)" : isReqSkillsFocused ? "var(--color-foreground)" : "var(--color-border)",
                        }}
                        transition={{ duration: 0.2 }}
                        className="rounded-xl border bg-card overflow-hidden"
                      >
                        <Input
                          id="skillsRequired"
                          placeholder="e.g. TypeScript, React, PostgreSQL"
                          {...register("skillsRequired")}
                          onFocus={() => setIsReqSkillsFocused(true)}
                          onBlur={(e) => {
                            register("skillsRequired").onBlur(e);
                            setIsReqSkillsFocused(false);
                          }}
                          className="h-11 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 rounded-none shadow-none text-[15px]"
                        />
                      </motion.div>
                      {errors.skillsRequired && (
                        <p className="text-[11.5px] font-medium text-destructive font-sans mt-1">
                          {errors.skillsRequired.message}
                        </p>
                      )}
                      <p className="text-[12px] text-muted-foreground font-sans">
                        These skills carry heavy weight (vector value) in candidate matching.
                      </p>
                      {/* Live Skill Chips Preview */}
                      <div className="flex flex-wrap gap-1.5 pt-1 min-h-[22px]">
                        <AnimatePresence>
                          {parsedReqSkills.map((skill) => (
                            <motion.span
                              key={skill}
                              initial={shouldReduceMotion ? {} : { scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={shouldReduceMotion ? {} : { scale: 0.8, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="rounded-full bg-foreground px-3 py-1 text-[11px] font-bold uppercase text-background"
                            >
                              {skill}
                            </motion.span>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Quick Add Skills Matrix */}
                    <div className="space-y-3 rounded-xl border border-border bg-background p-4 shadow-match-glow">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <Label className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
                          Quick Add Tech Stack (Hover to play, click to add)
                        </Label>
                        <span className="text-[9.5px] font-semibold font-mono text-muted-foreground select-none uppercase tracking-wider">
                          Click cycle: Unselected → Required → Nice
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 pt-1">
                        {TECH_STACK.map((tech) => {
                          const isRequired = parsedReqSkills.some(s => s.toLowerCase() === tech.name.toLowerCase());
                          const isNice = parsedNiceSkills.some(s => s.toLowerCase() === tech.name.toLowerCase());
                          
                          let statusClass = "border-border text-muted-foreground hover:border-foreground/30 hover:bg-secondary/10";
                          let colorStyle = {};
                          
                          if (isRequired) {
                            const textColor = tech.name === "JavaScript" ? "#000000" : "#ffffff";
                            statusClass = "border-transparent font-bold";
                            colorStyle = { backgroundColor: tech.color, color: textColor, boxShadow: `0 0 14px ${tech.color}50` };
                          } else if (isNice) {
                            statusClass = "bg-transparent font-semibold border-2";
                            colorStyle = { borderColor: tech.color, color: tech.color, boxShadow: `0 0 10px ${tech.color}15` };
                          }

                          return (
                            <button
                              key={tech.name}
                              type="button"
                              onMouseEnter={() => SkillSoundManager.playHover(tech.freq)}
                              onClick={() => {
                                SkillSoundManager.playClick(tech.freq);
                                handleTechClick(tech.name, isRequired, isNice);
                              }}
                              className={`flex items-center justify-center py-2 px-3 rounded-lg border text-xs cursor-pointer select-none transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] ${statusClass}`}
                              style={colorStyle}
                            >
                              {tech.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-3 rounded-xl border border-border bg-background p-4">
                      <Label htmlFor="skillsNiceToHave" className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
                        Nice-to-Have Skills — Comma Separated
                      </Label>
                      <motion.div
                        animate={{
                          scale: isNiceSkillsFocused && !shouldReduceMotion ? 1.015 : 1,
                          borderColor: isNiceSkillsFocused ? "var(--color-foreground)" : "var(--color-border)",
                        }}
                        transition={{ duration: 0.2 }}
                        className="rounded-xl border bg-card overflow-hidden"
                      >
                        <Input
                          id="skillsNiceToHave"
                          placeholder="e.g. Next.js, Docker, AWS"
                          {...register("skillsNiceToHave")}
                          onFocus={() => setIsNiceSkillsFocused(true)}
                          onBlur={(e) => {
                            register("skillsNiceToHave").onBlur(e);
                            setIsNiceSkillsFocused(false);
                          }}
                          className="h-11 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 rounded-none shadow-none text-[15px]"
                        />
                      </motion.div>
                      <p className="text-[12px] text-muted-foreground font-sans">
                        Optional supporting skills to rank top-tier candidates.
                      </p>
                      {/* Live Skill Chips Preview */}
                      <div className="flex flex-wrap gap-1.5 pt-1 min-h-[22px]">
                        <AnimatePresence>
                          {parsedNiceSkills.map((skill) => (
                            <motion.span
                              key={skill}
                              initial={shouldReduceMotion ? {} : { scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={shouldReduceMotion ? {} : { scale: 0.8, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase text-muted-foreground bg-transparent"
                            >
                              {skill}
                            </motion.span>
                          ))}
                        </AnimatePresence>
                      </div>
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
                            <Loader2 className="h-4 w-4 animate-spin" /> Publishing Job Vector...
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
                            Publish Job Announcement <ArrowRight className="h-4 w-4" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Button>
                  </form>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
