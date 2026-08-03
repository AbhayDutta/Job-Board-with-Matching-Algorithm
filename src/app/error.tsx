"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary caught error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full p-8 rounded-2xl bg-card border border-border shadow-match-glow space-y-4">
        <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="font-serif text-2xl font-bold">Something went wrong</h2>
        <p className="text-xs text-muted-foreground font-sans leading-relaxed">
          An unexpected error occurred while loading this page. Our server details have been logged safely.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="rounded-full bg-foreground text-background font-mono text-xs cursor-pointer gap-2"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Try Again
          </Button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-border text-xs font-mono font-medium hover:bg-secondary transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
