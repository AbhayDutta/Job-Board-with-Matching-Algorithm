"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { switchUserRoleAction } from "@/app/actions/user";
import { Loader2, Repeat } from "lucide-react";
import { toast } from "sonner";

export default function RoleSwitchButton({
  currentRole,
}: {
  currentRole: "CANDIDATE" | "EMPLOYER";
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const targetRole = currentRole === "EMPLOYER" ? "CANDIDATE" : "EMPLOYER";
  const targetLabel = currentRole === "EMPLOYER" ? "Switch to Candidate Mode" : "Switch to Recruiter Mode";

  const handleSwitch = async () => {
    setLoading(true);
    try {
      const res = await switchUserRoleAction(targetRole);
      if (res.success && res.redirectUrl) {
        toast.success(`Switched to ${targetRole === "EMPLOYER" ? "Recruiter" : "Candidate"} Mode!`);
        router.push(res.redirectUrl);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to switch role.");
        setLoading(false);
      }
    } catch {
      toast.error("An error occurred while switching role.");
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSwitch}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono bg-secondary/80 text-foreground border border-border/80 hover:bg-accent hover:text-black transition-all cursor-pointer disabled:opacity-40 shadow-xs"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Repeat className="h-3.5 w-3.5 text-accent group-hover:text-black" />
      )}
      <span>{targetLabel}</span>
    </button>
  );
}
