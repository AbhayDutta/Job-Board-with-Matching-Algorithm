"use client";

import { useState } from "react";
import { applyToJob } from "@/app/actions/jobs";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Loader2 } from "lucide-react";

import { toast } from "sonner";

export default function ApplyButton({ jobId, initialApplied }: { jobId: string; initialApplied: boolean }) {
  const [applied, setApplied] = useState(initialApplied);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await applyToJob(jobId);
      if (res.success) {
        setApplied(true);
        toast.success("Application submitted successfully!");
      } else {
        setError(res.error || "Failed to apply.");
        toast.error(res.error || "Failed to apply.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (applied) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.88_0.22_130)] px-4 py-2 text-xs font-bold text-foreground shadow-xs animate-scale-in">
        <Check className="h-3.5 w-3.5 stroke-[3]" /> Applied
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        onClick={handleApply}
        disabled={loading}
        className="rounded-full bg-foreground text-background px-5 py-2.5 text-xs font-semibold transition-all duration-300 hover:scale-105 hover:shadow-md cursor-pointer inline-flex items-center gap-1.5"
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting...
          </>
        ) : (
          <>
            Apply Now <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </Button>
      {error && <span className="text-[10px] text-destructive font-medium">{error}</span>}
    </div>
  );
}

