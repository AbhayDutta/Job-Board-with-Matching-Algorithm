"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Calendar, MapPin, IndianRupee, Search, SlidersHorizontal, Briefcase, Bookmark, BookmarkCheck, RefreshCw, Loader2, Heart, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import ApplyButton from "./ApplyButton";
import MatchScoreBadge from "@/components/MatchScoreBadge";
import { syncExternalJobs, syncPlatformJobs, disconnectPlatformJobs, toggleBookmarkAction } from "@/app/actions/jobs";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  salary: string;
  skillsRequired: string[];
  skillsNiceToHave: string[];
  createdAt: Date | string;
  score: number;
}

interface JobCardListProps {
  jobs: Job[];
  appliedJobIds: string[];
  candidateSkillsLength: number;
  initialBookmarkedJobIds: string[];
}

export default function JobCardList({ jobs, appliedJobIds, candidateSkillsLength, initialBookmarkedJobIds }: JobCardListProps) {
  const [activeTab, setActiveTab] = useState<"explore" | "portfolio">("explore");
  const [searchQuery, setSearchQuery] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);
  const [seniorities, setSeniorities] = useState<string[]>([]);
  const [minSalaryInput, setMinSalaryInput] = useState("");
  const [maxSalaryInput, setMaxSalaryInput] = useState("");
  const [appliedMinSalary, setAppliedMinSalary] = useState<number | null>(null);
  const [appliedMaxSalary, setAppliedMaxSalary] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "score" | "salary">("newest");

  const handleEmploymentToggle = (type: string) => {
    setEmploymentTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleSeniorityToggle = (level: string) => {
    setSeniorities(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const handleApplySalary = () => {
    const minVal = parseFloat(minSalaryInput.replace(/[^\d.]/g, ""));
    const maxVal = parseFloat(maxSalaryInput.replace(/[^\d.]/g, ""));
    setAppliedMinSalary(isNaN(minVal) ? null : minVal);
    setAppliedMaxSalary(isNaN(maxVal) ? null : maxVal);
    toast.success("Salary filters applied!");
  };

  const handleResetSalary = () => {
    setMinSalaryInput("");
    setMaxSalaryInput("");
    setAppliedMinSalary(null);
    setAppliedMaxSalary(null);
    toast.success("Salary filters reset.");
  };
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Record<string, boolean>>(() => {
    const initial = {} as Record<string, boolean>;
    initialBookmarkedJobIds.forEach(id => {
      initial[id] = true;
    });
    return initial;
  });
  const shouldReduceMotion = useReducedMotion();
  const appliedSet = new Set(appliedJobIds);



  const [syncLoading, setSyncLoading] = useState(false);

  const handleSync = async () => {
    setSyncLoading(true);
    try {
      const res = await syncExternalJobs();
      if (res.success) {
        if (res.count && res.count > 0) {
          toast.success(`Connected! Synced ${res.count} jobs from LinkedIn & Indeed.`);
        } else {
          toast.info("Fitboard connected jobs are already fully synchronized!");
        }
      } else {
        toast.error(res.error || "Failed to sync jobs.");
      }
    } catch (e) {
      console.error(e);
      toast.error("An unexpected error occurred during sync.");
    } finally {
      setSyncLoading(false);
    }
  };

  const [connections, setConnections] = useState<Record<string, boolean>>({
    linkedin: false,
    indeed: false,
    google: false,
    github: false,
    ziprecruiter: false,
  });
  const [connLoading, setConnLoading] = useState<Record<string, boolean>>({});

  // Synchronize initial connection toggles from loaded jobs
  useState(() => {
    const initialConns = { linkedin: false, indeed: false, google: false, github: false, ziprecruiter: false };
    jobs.forEach(job => {
      const desc = job.description || "";
      if (desc.startsWith("[Source: LinkedIn]")) initialConns.linkedin = true;
      if (desc.startsWith("[Source: Indeed]")) initialConns.indeed = true;
      if (desc.startsWith("[Source: Google Jobs]")) initialConns.google = true;
      if (desc.startsWith("[Source: GitHub Jobs]")) initialConns.github = true;
      if (desc.startsWith("[Source: ZipRecruiter]")) initialConns.ziprecruiter = true;
    });
    setConnections(initialConns);
  });

  const toggleConnection = async (platform: string, label: string) => {
    const isConnecting = !connections[platform];
    setConnLoading(prev => ({ ...prev, [platform]: true }));
    
    try {
      if (isConnecting) {
        const res = await syncPlatformJobs(platform);
        if (res.success) {
          setConnections(prev => ({ ...prev, [platform]: true }));
          toast.success(`Connected to ${label} API! Synced ${res.count || 4} active positions.`);
        } else {
          toast.error(res.error || `Failed to connect to ${label}.`);
        }
      } else {
        const res = await disconnectPlatformJobs(label);
        if (res.success) {
          setConnections(prev => ({ ...prev, [platform]: false }));
          toast.success(`Disconnected from ${label} API. Job listings removed.`);
        } else {
          toast.error(res.error || `Failed to disconnect from ${label}.`);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(`An unexpected error occurred while toggling connection.`);
    } finally {
      setConnLoading(prev => ({ ...prev, [platform]: false }));
    }
  };

  const toggleBookmark = async (id: string) => {
    setBookmarkedJobs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));

    try {
      const res = await toggleBookmarkAction(id);
      if (res.success) {
        toast.success(res.bookmarked ? "Job bookmarked persistently!" : "Bookmark removed.");
      } else {
        setBookmarkedJobs(prev => ({
          ...prev,
          [id]: !prev[id]
        }));
        toast.error(res.error || "Failed to update bookmark.");
      }
    } catch (err) {
      console.error(err);
      setBookmarkedJobs(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
      toast.error("An unexpected error occurred while toggling bookmark.");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skillsRequired.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      job.skillsNiceToHave.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesScore = job.score >= minScore;

    let matchesEmployment = true;
    if (employmentTypes.length > 0) {
      const desc = job.description.toLowerCase();
      const tit = job.title.toLowerCase();
      const loc = job.location.toLowerCase();
      
      matchesEmployment = employmentTypes.some(type => {
        if (type === "full-time") return !desc.includes("part-time") && !tit.includes("part");
        if (type === "part-time") return desc.includes("part-time") || tit.includes("part");
        if (type === "remote") return loc.includes("remote") || desc.includes("remote");
        if (type === "internship") return desc.includes("intern") || desc.includes("training") || tit.includes("intern");
        return false;
      });
    }

    let matchesSeniority = true;
    if (seniorities.length > 0) {
      const tit = job.title.toLowerCase();
      matchesSeniority = seniorities.some(level => {
        if (level === "student") return tit.includes("intern") || tit.includes("student");
        if (level === "entry") return tit.includes("junior") || tit.includes("entry") || tit.includes("associate");
        if (level === "mid") return tit.includes("mid") || (!tit.includes("senior") && !tit.includes("lead") && !tit.includes("junior"));
        if (level === "senior") return tit.includes("senior") || tit.includes("sr");
        if (level === "director") return tit.includes("director") || tit.includes("manager");
        if (level === "vp") return tit.includes("vp") || tit.includes("president") || tit.includes("cto") || tit.includes("head");
        return false;
      });
    }

    let matchesSalary = true;
    const getSalaryNum = (salaryStr: string) => {
      const clean = salaryStr.replace(/[^\d.]/g, "");
      const num = parseFloat(clean);
      if (isNaN(num)) return 0;
      if (salaryStr.toUpperCase().includes("L")) return num * 100000;
      if (salaryStr.toUpperCase().includes("K")) return num * 1000;
      return num;
    };

    if (appliedMinSalary !== null || appliedMaxSalary !== null) {
      const salVal = getSalaryNum(job.salary);
      if (appliedMinSalary !== null && salVal < appliedMinSalary) matchesSalary = false;
      if (appliedMaxSalary !== null && salVal > appliedMaxSalary) matchesSalary = false;
    }

    return matchesSearch && matchesScore && matchesEmployment && matchesSeniority && matchesSalary;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === "newest") {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    }
    if (sortBy === "score") {
      return b.score - a.score;
    }
    if (sortBy === "salary") {
      const getSalaryNum = (salaryStr: string) => {
        const clean = salaryStr.replace(/[^\d.]/g, "");
        const num = parseFloat(clean);
        if (isNaN(num)) return 0;
        if (salaryStr.toUpperCase().includes("L")) return num * 100000;
        if (salaryStr.toUpperCase().includes("K")) return num * 1000;
        return num;
      };
      return getSalaryNum(b.salary) - getSalaryNum(a.salary);
    }
    return 0;
  });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.04,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" as const },
    },
  };

  // Helper to generate premium color initials for mock company logos
  const getCompanyColor = (name: string) => {
    const tones = [
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return tones[sum % tones.length];
  };

  const getPlatformBadge = (description: string) => {
    if (description.startsWith("[Source: LinkedIn]")) {
      return { name: "LinkedIn", color: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400" };
    }
    if (description.startsWith("[Source: Indeed]")) {
      return { name: "Indeed", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400" };
    }
    if (description.startsWith("[Source: Google Jobs]")) {
      return { name: "Google Jobs", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" };
    }
    if (description.startsWith("[Source: GitHub Jobs]")) {
      return { name: "GitHub Jobs", color: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20 dark:text-zinc-400" };
    }
    if (description.startsWith("[Source: ZipRecruiter]")) {
      return { name: "ZipRecruiter", color: "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400" };
    }
    return null;
  };

  const getCompanyLogo = (company: string) => {
    const c = company.toLowerCase().trim();
    if (c.includes("vercel")) {
      return (
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-black text-white border border-neutral-800">
          <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
            <path d="M12 2L2 22h20L12 2z" />
          </svg>
        </div>
      );
    }
    if (c.includes("stripe")) {
      return (
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#635BFF] text-white">
          <span className="font-sans font-black text-2xl tracking-tighter italic">S</span>
        </div>
      );
    }
    if (c.includes("linear")) {
      return (
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-neutral-900 text-[#F2F2F2] border border-neutral-800">
          <svg className="h-5 w-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v18M3 12h18" strokeDasharray="3 3" />
          </svg>
        </div>
      );
    }
    if (c.includes("figma")) {
      return (
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-neutral-950 text-white">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
            <path d="M8 5a3 3 0 113 3V5zm0 6a3 3 0 113 3v-3H8zm6-6a3 3 0 013 3v-3h-3zm-3 6a3 3 0 013-3v3h-3zm3 6a3 3 0 11-3-3v3h3z" fill="#F24E1E" />
          </svg>
        </div>
      );
    }
    if (c.includes("openai")) {
      return (
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#10a37f] text-white">
          <span className="font-serif font-black text-2xl">O</span>
        </div>
      );
    }
    if (c.includes("discord")) {
      return (
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#5865F2] text-white">
          <span className="font-sans font-bold text-xl">D</span>
        </div>
      );
    }
    if (c.includes("apple")) {
      return (
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-zinc-950 text-white border border-zinc-800">
          <span className="font-serif font-bold text-xl"></span>
        </div>
      );
    }
    if (c.includes("shopify")) {
      return (
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#96bf48] text-white">
          <span className="font-sans font-black text-xl">S</span>
        </div>
      );
    }
    if (c.includes("google")) {
      return (
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white text-black border border-neutral-200">
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
        </div>
      );
    }
    if (c.includes("netflix")) {
      return (
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-black text-[#E50914] border border-neutral-900">
          <span className="font-sans font-black text-2xl">N</span>
        </div>
      );
    }
    if (c.includes("spotify")) {
      return (
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#1DB954] text-black">
          <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.59 14.4c-.18.3-.58.4-.88.22-2.42-1.48-5.46-1.8-9.05-1-.34.08-.68-.14-.76-.48-.08-.34.14-.68.48-.76 3.92-.9 7.28-.53 10 1.15.28.18.38.58.21.87zm1.22-2.73c-.22.37-.7.49-1.07.27-2.76-1.69-6.97-2.18-10.23-1.2-.42.12-.85-.12-.97-.53-.12-.42.12-.85.53-.97 3.73-1.13 8.36-.58 11.47 1.33.37.22.49.7.27 1.1zm.1-2.82C14.7 8.76 9.42 8.58 6.36 9.5c-.47.14-.96-.12-1.1-.6-.14-.47.12-.96.6-1.1 3.51-1.06 9.33-.86 13.06 1.35.42.25.56.8.31 1.22-.25.42-.8.56-1.23.31z"/>
          </svg>
        </div>
      );
    }
    if (c.includes("neon")) {
      return (
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-black text-[#00E599] border border-neutral-900">
          <span className="font-mono font-bold text-xl">N</span>
        </div>
      );
    }

    const initials = company.substring(0, 2).toUpperCase();
    const colors = [
      "bg-emerald-600 text-white shadow-xs border-transparent",
      "bg-blue-600 text-white shadow-xs border-transparent",
      "bg-orange-500 text-white shadow-xs border-transparent",
      "bg-violet-600 text-white shadow-xs border-transparent",
      "bg-rose-600 text-white shadow-xs border-transparent",
      "bg-neutral-800 text-white shadow-xs border-transparent",
    ];
    let hash = 0;
    for (let i = 0; i < company.length; i++) hash += company.charCodeAt(i);
    const color = colors[hash % colors.length];

    return (
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-[15px] font-extrabold font-sans tracking-wider ${color}`}>
        {initials}
      </div>
    );
  };

  const renderJobCard = (job: Job) => {
    const isBookmarked = !!bookmarkedJobs[job.id];
    const tags = [...job.skillsRequired.slice(0, 2), ...job.skillsNiceToHave.slice(0, 1)];
    const locationUpper = job.location.toUpperCase();

    // Determine seniority
    let seniority = "Senior";
    if (job.title.toLowerCase().includes("mid")) seniority = "Mid-Senior";
    else if (job.title.toLowerCase().includes("junior") || job.title.toLowerCase().includes("entry")) seniority = "Student-Entry";
    else if (job.title.toLowerCase().includes("lead") || job.title.toLowerCase().includes("staff")) seniority = "Lead";

    // Determine job type
    let jobType = "Full-Time";
    if (job.description.toLowerCase().includes("part-time") || job.title.toLowerCase().includes("part")) jobType = "Part-Time";
    else if (job.location.toLowerCase().includes("remote") || job.description.toLowerCase().includes("remote")) jobType = "Remote Job";

    const formattedDate = new Date(job.createdAt).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    return (
      <motion.div
        key={job.id}
        layout={shouldReduceMotion ? false : "position"}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
        whileHover={shouldReduceMotion ? {} : { y: -3, boxShadow: "0 12px 30px -10px rgba(0,0,0,0.04)" }}
        className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs flex flex-col justify-between min-h-[380px] text-left transition-all duration-300 relative group"
      >
        <div className="space-y-4.5">
          {/* Header Row: Logo, Title, Badges */}
          <div className="flex items-start justify-between gap-4 min-w-0">
            <div className="flex items-start gap-4 min-w-0">
              {getCompanyLogo(job.company)}
              <div className="min-w-0 space-y-1">
                <h3 className="font-sans font-bold text-[16px] md:text-[17px] leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {job.title}
                </h3>
                <p className="text-[11px] font-bold tracking-wider text-muted-foreground/80 uppercase font-sans">
                  {job.company}
                </p>
              </div>
            </div>
            
            {/* Badges Column on Right */}
            <div className="flex flex-col items-end shrink-0 gap-1.5 pt-0.5">
              {candidateSkillsLength > 0 && <MatchScoreBadge score={job.score} />}
              {(() => {
                const badge = getPlatformBadge(job.description);
                if (badge) {
                  return (
                    <span className={`rounded-full px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider font-mono border ${badge.color} shrink-0`}>
                      {badge.name}
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          </div>

          {/* Location row */}
          <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-muted-foreground/90 font-sans tracking-wide">
            <MapPin className="h-4 w-4 text-muted-foreground/75" /> {locationUpper}
          </div>

          {/* Grid attributes (Yo Job Style - Clean Spacing) */}
          <div className="flex justify-between items-center py-2 text-[12.5px] font-bold text-foreground font-sans border-y border-border/25">
            <span className="text-left shrink-0">{seniority}</span>
            <span className="text-center shrink-0">{jobType}</span>
            <span className="text-right shrink-0">{job.salary}</span>
          </div>

          {/* Description snippet */}
          <p className="text-[13px] text-foreground/85 leading-relaxed font-sans line-clamp-3 whitespace-pre-wrap">
            {job.description.replace(/^\[Source: [^\]]+\]\s*/, "")}
          </p>
        </div>

        {/* Footer Row: Tags, Date, Actions */}
        <div className="space-y-4 pt-4 border-t border-border/40 mt-3">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {tags.map(tag => (
              <span key={tag} className="rounded-lg bg-secondary/55 px-2.5 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-sans">
                {tag}
              </span>
            ))}
          </div>

          {/* Footer bottom */}
          <div className="flex items-center justify-between text-[11.5px] text-muted-foreground font-sans">
            <span className="font-semibold">{formattedDate}</span>
            
            <div className="flex items-center gap-3">
              {/* Close/Reject trigger placeholder */}
              <button 
                type="button" 
                className="p-1 hover:text-foreground hover:bg-secondary rounded-full cursor-pointer transition-colors" 
                title="Dismiss"
              >
                <X className="h-4 w-4 text-muted-foreground/80 hover:text-foreground" />
              </button>

              {/* Bookmark heart toggle */}
              <button
                type="button"
                onClick={() => toggleBookmark(job.id)}
                className="p-1 hover:bg-secondary rounded-full cursor-pointer transition-all"
                title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
              >
                <Heart className={`h-4 w-4 transition-colors ${
                  isBookmarked 
                    ? "fill-red-500 text-red-500" 
                    : "text-muted-foreground/80 hover:text-red-500"
                }`} />
              </button>
              
              {/* Apply Button */}
              <ApplyButton jobId={job.id} initialApplied={appliedSet.has(job.id)} />
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Platform Connections Panel */}
      <div className="bg-card p-5 rounded-2xl border border-border/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 font-mono">
              <RefreshCw className="h-4 w-4 text-[oklch(0.72_0.18_35)]" /> Job Board API Connections
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Link external platforms to fetch, match, and apply to developer postings directly.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {[
            { key: "linkedin", label: "LinkedIn", color: "text-[#0A66C2]", bg: "hover:border-[#0A66C2]/30", icon: "in" },
            { key: "indeed", label: "Indeed", color: "text-[#003A9B]", bg: "hover:border-[#003A9B]/30", icon: "Id" },
            { key: "google", label: "Google Jobs", color: "text-[#EA4335]", bg: "hover:border-[#EA4335]/30", icon: "G" },
            { key: "github", label: "GitHub Jobs", color: "text-foreground", bg: "hover:border-foreground/30", icon: "Git" },
            { key: "ziprecruiter", label: "ZipRecruiter", color: "text-[#00B074]", bg: "hover:border-[#00B074]/30", icon: "ZR" }
          ].map((platform) => {
            const isConnected = !!connections[platform.key];
            const isLoading = !!connLoading[platform.key];
            
            return (
              <div 
                key={platform.key}
                className={`relative rounded-xl border border-border/50 p-3 bg-secondary/15 flex flex-col justify-between gap-3 transition-all duration-300 ${platform.bg} hover:shadow-sm select-none`}
              >
                <div className="flex items-start justify-between min-w-0">
                  <div className="min-w-0">
                    <span className={`font-serif text-[15px] font-normal leading-tight block truncate ${platform.color}`}>
                      {platform.label}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground">
                      {isConnected ? "Ping: 14ms" : "Offline"}
                    </span>
                  </div>
                  <span className={`h-2 w-2 rounded-full shrink-0 ${isConnected ? "bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" : "bg-muted"}`} />
                </div>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => toggleConnection(platform.key, platform.label)}
                  className={`w-full cursor-pointer h-7 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-1 active:scale-[0.98] ${
                    isConnected 
                      ? "bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20" 
                      : "bg-foreground text-background hover:bg-[oklch(0.88_0.22_130)] hover:text-black"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : isConnected ? (
                    "Disconnect"
                  ) : (
                    "Connect"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dashboard Tab Navigation */}
      <div className="flex gap-2.5 border-b border-border/40 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("explore")}
          className={`cursor-pointer px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-2 select-none active:scale-[0.98] ${
            activeTab === "explore"
              ? "bg-foreground text-background shadow-sm font-bold"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/45 font-medium"
          }`}
        >
          <Briefcase className="h-4 w-4" /> Explore Jobs Feed
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("portfolio")}
          className={`cursor-pointer px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-2 select-none active:scale-[0.98] ${
            activeTab === "portfolio"
              ? "bg-foreground text-background shadow-sm font-bold"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/45 font-medium"
          }`}
        >
          <BookmarkCheck className="h-4 w-4" /> Bookmarked & Applied
        </button>
      </div>

      {activeTab === "explore" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Yo! Job Sidebar Filters Column */}
          <div className="lg:col-span-3 space-y-5 lg:sticky lg:top-24 text-left">
            {/* Type of Employment */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-mono">Type of Employment</h3>
              <div className="space-y-3">
                {[
                  { key: "full-time", label: "Full Time Jobs" },
                  { key: "part-time", label: "Part Time Jobs" },
                  { key: "remote", label: "Remote Jobs" },
                  { key: "internship", label: "Training Jobs" },
                ].map((item) => {
                  const count = jobs.filter(j => {
                    const desc = j.description.toLowerCase();
                    const loc = j.location.toLowerCase();
                    const tit = j.title.toLowerCase();
                    if (item.key === "full-time") return !desc.includes("part-time") && !tit.includes("part");
                    if (item.key === "part-time") return desc.includes("part-time") || tit.includes("part");
                    if (item.key === "remote") return loc.includes("remote") || desc.includes("remote");
                    if (item.key === "internship") return desc.includes("intern") || desc.includes("training") || tit.includes("intern");
                    return true;
                  }).length;

                  return (
                    <div 
                      key={item.key} 
                      onClick={() => handleEmploymentToggle(item.key)}
                      className="flex items-center justify-between cursor-pointer group select-none text-xs font-medium font-sans text-foreground hover:opacity-80 transition-opacity"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={employmentTypes.includes(item.key)}
                          readOnly
                          className="h-4 w-4 rounded border-border text-foreground focus:ring-0 focus:ring-offset-0 accent-foreground cursor-pointer pointer-events-none"
                        />
                        <span>{item.label}</span>
                      </div>
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground group-hover:bg-foreground/5 font-mono">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Seniority Level */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-mono">Seniority Level</h3>
              <div className="space-y-3">
                {[
                  { key: "student", label: "Student Level" },
                  { key: "entry", label: "Entry Level" },
                  { key: "mid", label: "Mid Level" },
                  { key: "senior", label: "Senior Level" },
                  { key: "director", label: "Directors" },
                  { key: "vp", label: "VP or Above" },
                ].map((item) => {
                  const count = jobs.filter(j => {
                    const tit = j.title.toLowerCase();
                    if (item.key === "student") return tit.includes("intern") || tit.includes("student");
                    if (item.key === "entry") return tit.includes("junior") || tit.includes("entry") || tit.includes("associate");
                    if (item.key === "mid") return tit.includes("mid") || (!tit.includes("senior") && !tit.includes("lead") && !tit.includes("junior"));
                    if (item.key === "senior") return tit.includes("senior") || tit.includes("sr");
                    if (item.key === "director") return tit.includes("director") || tit.includes("manager");
                    if (item.key === "vp") return tit.includes("vp") || tit.includes("president") || tit.includes("cto") || tit.includes("head");
                    return true;
                  }).length;

                  return (
                    <div 
                      key={item.key} 
                      onClick={() => handleSeniorityToggle(item.key)}
                      className="flex items-center justify-between cursor-pointer group select-none text-xs font-medium font-sans text-foreground hover:opacity-80 transition-opacity"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={seniorities.includes(item.key)}
                          readOnly
                          className="h-4 w-4 rounded border-border text-foreground focus:ring-0 focus:ring-offset-0 accent-foreground cursor-pointer pointer-events-none"
                        />
                        <span>{item.label}</span>
                      </div>
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground group-hover:bg-foreground/5 font-mono">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Salary Range */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-mono">Salary Range</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold font-mono">Min</span>
                    <Input
                      placeholder="Min"
                      value={minSalaryInput}
                      onChange={(e) => setMinSalaryInput(e.target.value)}
                      className="h-9 text-xs bg-background border-border rounded-lg"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold font-mono">Max</span>
                    <Input
                      placeholder="Max"
                      value={maxSalaryInput}
                      onChange={(e) => setMaxSalaryInput(e.target.value)}
                      className="h-9 text-xs bg-background border-border rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleApplySalary}
                    className="flex-1 cursor-pointer h-8 text-[10px] font-bold uppercase tracking-wider bg-foreground text-background rounded-lg hover:bg-[oklch(0.88_0.22_130)] hover:text-black transition-colors"
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    onClick={handleResetSalary}
                    className="flex-1 cursor-pointer h-8 text-[10px] font-bold uppercase tracking-wider bg-secondary border border-border text-muted-foreground rounded-lg hover:text-foreground transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Search + Count + Cards Grid (takes 9/12 space) */}
          <div className="lg:col-span-9 space-y-6">
            {/* Filtering Panel */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end justify-between bg-card p-5 rounded-2xl border border-border/80 shadow-xs">
              {/* Search */}
              <div className="flex-1 space-y-2 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 font-mono">
                  <Search className="h-3.5 w-3.5" /> Search open positions
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, company, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 bg-background border-border rounded-xl focus-visible:ring-foreground focus-visible:border-foreground"
                  />
                </div>
              </div>
              
              {/* Match score filter */}
              {candidateSkillsLength > 0 && (
                <div className="space-y-2 min-w-[220px] text-left">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 font-mono">
                      <SlidersHorizontal className="h-3.5 w-3.5" /> Min Match Fit
                    </label>
                    <span className="text-xs font-bold text-foreground font-mono">{minScore}%</span>
                  </div>
                  <div className="h-11 flex items-center px-4 border border-border rounded-xl bg-background">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={minScore}
                      onChange={(e) => setMinScore(Number(e.target.value))}
                      className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-foreground"
                    />
                  </div>
                </div>
              )}

              {/* Sync Button */}
              <div className="flex items-end self-stretch md:self-auto">
                <button
                  type="button"
                  disabled={syncLoading}
                  onClick={handleSync}
                  className="h-11 cursor-pointer w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-foreground text-background px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:bg-[oklch(0.88_0.22_130)] hover:text-black hover:scale-[1.02] disabled:opacity-50 select-none shadow-xs border border-transparent hover:border-transparent active:scale-[0.98]"
                >
                  {syncLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5" /> Sync Jobs
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Header: Jobs count & sort selector */}
            <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4 text-left">
              <h2 className="font-serif text-xl font-normal text-foreground">
                {sortedJobs.length} Jobs Found
              </h2>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground select-none">
                Sort by:
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-foreground border-none outline-none cursor-pointer font-bold focus:ring-0"
                >
                  <option value="newest" className="bg-card text-foreground">Newest Post</option>
                  <option value="score" className="bg-card text-foreground">Highest Match Fit</option>
                  <option value="salary" className="bg-card text-foreground">Highest Salary</option>
                </select>
              </div>
            </div>

            {/* List Container */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              layout={shouldReduceMotion ? false : "position"}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {sortedJobs.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="rounded-2xl border border-border border-dashed p-16 text-center bg-card/50 col-span-full"
                  >
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-foreground mb-4 shadow-xs">
                      <Briefcase className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-serif font-normal text-foreground">No matching positions found</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto font-sans leading-relaxed">
                      Try widening your search terms, lowering your match criteria, or pull active job postings from the internet.
                    </p>
                    <button
                      type="button"
                      disabled={syncLoading}
                      onClick={handleSync}
                      className="mt-5 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-foreground text-background px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:bg-[oklch(0.88_0.22_130)] hover:text-black hover:scale-[1.02] disabled:opacity-50 select-none border border-transparent shadow-xs"
                    >
                      {syncLoading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Pulling jobs...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3.5 w-3.5" /> Pull jobs from LinkedIn / Indeed
                        </>
                      )}
                    </button>
                  </motion.div>
                ) : (
                  sortedJobs.map((job) => renderJobCard(job))
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
          {/* Persistent Bookmarked Jobs Column */}
          <div className="space-y-4">
            <h3 className="font-serif text-[22px] font-normal text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
              <Bookmark className="h-5 w-5 text-accent" /> Saved Bookmarks ({jobs.filter(j => bookmarkedJobs[j.id]).length})
            </h3>
            <div className="space-y-4">
              {jobs.filter(j => bookmarkedJobs[j.id]).length === 0 ? (
                <div className="rounded-2xl border border-border border-dashed p-10 text-center bg-card/45">
                  <Bookmark className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground font-sans">No persistent bookmarks yet. Save listings by toggling the bookmark symbol in the explore feed.</p>
                </div>
              ) : (
                jobs.filter(j => bookmarkedJobs[j.id]).map(job => renderJobCard(job))
              )}
            </div>
          </div>

          {/* Persistent Applied Jobs Column */}
          <div className="space-y-4">
            <h3 className="font-serif text-[22px] font-normal text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
              <BookmarkCheck className="h-5 w-5 text-[oklch(0.88_0.22_130)]" /> Applied Positions ({jobs.filter(j => appliedSet.has(j.id)).length})
            </h3>
            <div className="space-y-4">
              {jobs.filter(j => appliedSet.has(j.id)).length === 0 ? (
                <div className="rounded-2xl border border-border border-dashed p-10 text-center bg-card/45">
                  <Briefcase className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground font-sans">No active applications. Start applying to matched postings inside the explore tab.</p>
                </div>
              ) : (
                jobs.filter(j => appliedSet.has(j.id)).map(job => renderJobCard(job))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
