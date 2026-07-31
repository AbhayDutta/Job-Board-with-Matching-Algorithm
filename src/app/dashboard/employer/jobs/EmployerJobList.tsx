"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Search, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import JobCard from "./JobCard";

interface EmployerJobListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jobs: any[];
}

export default function EmployerJobList({ jobs }: EmployerJobListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const shouldReduceMotion = useReducedMotion();

  const filteredJobs = jobs.filter((job) => {
    return (
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skillsRequired.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );
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

  return (
    <div className="space-y-6">
      {/* Search Filter bar */}
      <div className="flex gap-4 items-stretch bg-card p-4 rounded-2xl border border-border/80 shadow-match-glow">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search postings by title, location, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-background border-border rounded-xl focus-visible:ring-foreground focus-visible:border-foreground"
          />
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        layout={shouldReduceMotion ? false : "position"}
        className="space-y-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredJobs.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="rounded-2xl border border-border border-dashed p-16 text-center bg-card/50"
            >
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-foreground mb-4 shadow-xs">
                <Briefcase className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-serif font-normal text-foreground">No postings found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto font-sans leading-relaxed">
                No active postings match your search filter criteria.
              </p>
            </motion.div>
          ) : (
            filteredJobs.map((job) => (
              <motion.div
                key={job.id}
                layout={shouldReduceMotion ? false : "position"}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
                whileHover={shouldReduceMotion ? {} : { y: -2, boxShadow: "0 20px 50px -12px oklch(0.18 0.02 250 / 0.14)" }}
                className="transition-all duration-300 rounded-2xl"
              >
                <JobCard job={job} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
