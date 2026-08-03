"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={
        className ||
        "inline-flex items-center gap-1.5 text-xs font-semibold hover:bg-secondary rounded-full px-4 py-2 transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
      }
    >
      <LogOut className="h-4 w-4" /> Sign out
    </button>
  );
}
