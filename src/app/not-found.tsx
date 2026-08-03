import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full p-8 rounded-2xl bg-card border border-border shadow-match-glow space-y-4">
        <div className="w-12 h-12 rounded-full bg-secondary text-muted-foreground flex items-center justify-center mx-auto">
          <FileQuestion className="h-6 w-6 text-foreground" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block">
          404 Error
        </span>
        <h2 className="font-serif text-2xl font-bold">Page Not Found</h2>
        <p className="text-xs text-muted-foreground font-sans leading-relaxed">
          The requested page or resource could not be found. It may have been moved or deleted.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background font-mono text-xs font-bold hover:bg-foreground/90 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
