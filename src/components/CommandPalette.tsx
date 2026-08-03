"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  PlusCircle,
  User,
  Search,
  Home,
  LogOut,
  Sparkles,
  Zap,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card px-3.5 py-1.5 text-xs font-mono text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-all cursor-pointer select-none"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Quick search...</span>
        <kbd className="pointer-events-none rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground font-mono">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-card border border-border rounded-2xl shadow-match-glow">
          <DialogTitle className="sr-only">Command Palette Navigation</DialogTitle>
          <DialogDescription className="sr-only">Quick search and navigate across Fitboard platform pages</DialogDescription>
          <Command className="w-full bg-transparent font-sans">
            <div className="flex items-center border-b border-border/60 px-4">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground mr-2" />
              <Command.Input
                placeholder="Type a command or search page..."
                className="h-12 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>

            <Command.List className="max-h-[320px] overflow-y-auto p-2 space-y-1">
              <Command.Empty className="py-6 text-center text-xs text-muted-foreground font-mono">
                No matching results found.
              </Command.Empty>

              <Command.Group heading="Navigation" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono px-2 py-1.5">
                <Command.Item
                  onSelect={() => runCommand(() => router.push("/"))}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer"
                >
                  <Home className="h-4 w-4 text-accent" />
                  <span>Landing Page</span>
                </Command.Item>

                <Command.Item
                  onSelect={() => runCommand(() => router.push("/dashboard/employer/jobs"))}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer"
                >
                  <Briefcase className="h-4 w-4 text-blue-500" />
                  <span>Employer Workspace & Postings</span>
                </Command.Item>

                <Command.Item
                  onSelect={() => runCommand(() => router.push("/dashboard/employer/jobs/new"))}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4 text-emerald-500" />
                  <span>Post a New Job Specification</span>
                </Command.Item>

                <Command.Item
                  onSelect={() => runCommand(() => router.push("/dashboard/candidate/jobs"))}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Candidate Vector Job Feed</span>
                </Command.Item>
              </Command.Group>
            </Command.List>

            <div className="flex items-center justify-between border-t border-border/40 px-4 py-2 text-[10px] text-muted-foreground font-mono bg-muted/20">
              <span>Fitboard Command Palette</span>
              <span>Use ↑↓ keys to navigate</span>
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
