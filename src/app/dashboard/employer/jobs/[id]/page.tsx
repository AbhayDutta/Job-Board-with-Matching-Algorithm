import { getJobApplicationsWithDetails } from "@/app/actions/applications";
import KanbanBoard from "./KanbanBoard";
import Link from "next/link";
import { ArrowLeft, LogOut } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import ThemeToggle from "@/components/ThemeToggle";
import UserProfileModal from "@/components/UserProfileModal";
import { SignOutButton } from "@/components/SignOutButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JobKanbanPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "EMPLOYER") {
    redirect("/login");
  }

  const userRecord = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, avatarUrl: true, role: true, plan: true },
  });

  const { id } = await params;
  const res = await getJobApplicationsWithDetails(id);

  if (!res.success || !res.job) {
    if (res.error === "Unauthorized.") {
      redirect("/login");
    }
    notFound();
  }

  const { job, applications } = res;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Sticky Glassmorphic Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="group flex items-center gap-2.5 text-lg font-black tracking-tight text-foreground select-none">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-foreground text-background text-xs font-mono transition-transform group-hover:rotate-6">◆</span>
            <span className="font-serif text-xl font-bold">Fitboard</span>
          </Link>
          <nav className="flex gap-6 text-sm font-semibold text-muted-foreground">
            <Link href="/dashboard/employer/jobs" className="transition-colors hover:text-foreground">
              My Postings
            </Link>
            <Link href="/dashboard/employer/jobs/new" className="transition-colors hover:text-foreground">
              Post a Job
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {userRecord && <UserProfileModal user={userRecord} />}
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/employer/jobs"
            className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-all shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Job List
          </Link>
        </div>

        <KanbanBoard jobTitle={job.title} initialApplications={applications as any} />
      </main>
    </div>
  );
}
