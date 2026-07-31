import Link from "next/link";
import { getEmployerJobs } from "@/app/actions/jobs";
import { Plus, Briefcase, LogOut, Users, Award } from "lucide-react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import EmployerJobList from "./EmployerJobList";
import { calculateMatchScore } from "@/lib/matching";

export default async function EmployerJobsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "EMPLOYER") {
    redirect("/login");
  }

  const res = await getEmployerJobs();
  const jobs = res.success && res.jobs ? res.jobs : [];

  // Calculate Metrics
  const totalPostings = jobs.length;
  let totalApplicants = 0;
  let totalScoreSum = 0;
  let scoreCount = 0;

  jobs.forEach((job) => {
    totalApplicants += job.applications.length;
    const jobSkills = Array.isArray(job.skillsRequired) ? (job.skillsRequired as string[]) : [];
    const niceToHave = Array.isArray(job.skillsNiceToHave) ? (job.skillsNiceToHave as string[]) : [];
    
    job.applications.forEach((app: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const candidateSkills = app.candidate?.candidateProfile && Array.isArray(app.candidate.candidateProfile.skills)
        ? (app.candidate.candidateProfile.skills as string[])
        : [];
      
      const score = calculateMatchScore(candidateSkills, jobSkills, niceToHave);
      totalScoreSum += score;
      scoreCount++;
    });
  });

  const avgMatchScore = scoreCount > 0 ? Math.round(totalScoreSum / scoreCount) : 0;

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
            <Link href="/dashboard/employer/jobs" className="text-foreground border-b-2 border-foreground pb-1">
              My Postings
            </Link>
            <Link href="/dashboard/employer/jobs/new" className="transition-colors hover:text-foreground">
              Post a Job
            </Link>
          </nav>
          <Link
            href="/api/auth/signout"
            className="inline-flex items-center gap-1.5 text-xs font-semibold hover:bg-secondary rounded-full px-4 py-2 transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-6 py-10 space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal text-foreground">Employer Workspace</h1>
            <p className="text-sm text-muted-foreground mt-1 font-sans">
              Manage job specifications and monitor candidate application pipelines
            </p>
          </div>
          <Link
            href="/dashboard/employer/jobs/new"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-xs font-bold text-background transition-transform duration-300 hover:scale-102 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Post a role
          </Link>
        </div>

        {/* Recruiter Analytics Bento Row */}
        {jobs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 animate-slide-up">
            {/* Total Positions */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs hover:border-violet-500/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground font-mono">Active roles</span>
                <Briefcase className="h-4.5 w-4.5 text-violet-500" />
              </div>
              <div>
                <div className="text-3xl font-serif font-normal text-foreground">
                  {totalPostings}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1.5 font-mono">
                  Currently accepting applicants
                </div>
              </div>
            </div>

            {/* Total Applicants */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs hover:border-blue-500/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground font-mono">Total candidates</span>
                <Users className="h-4.5 w-4.5 text-blue-500" />
              </div>
              <div>
                <div className="text-3xl font-serif font-normal text-foreground">
                  {totalApplicants}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1.5 font-mono">
                  Across all active listings
                </div>
              </div>
            </div>

            {/* Match Average */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs hover:border-amber-500/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground font-mono">Pipeline fit efficiency</span>
                <Award className="h-4.5 w-4.5 text-amber-500" />
              </div>
              <div>
                <div className="text-3xl font-serif font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 dark:from-orange-400 dark:to-yellow-300">
                  {avgMatchScore}% <span className="text-xs text-muted-foreground font-sans font-medium">Avg</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1.5 font-mono">
                  Vector fit score average
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-normal text-foreground">Active Postings</h2>
            <p className="text-xs text-muted-foreground font-sans">
              Search and filter specifications and review candidate matching vectors.
            </p>
          </div>

          {jobs.length === 0 ? (
            <div className="rounded-2xl border border-border border-dashed p-16 text-center bg-card/50">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-foreground mb-4 shadow-xs">
                <Briefcase className="h-7 w-7" />
              </div>

              <h3 className="text-xl font-serif font-normal text-foreground">No active job postings</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto font-sans leading-relaxed">
                Get started by defining requirement skill vectors and creating your first job post.
              </p>
              <Link
                href="/dashboard/employer/jobs/new"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-xs font-bold text-background transition-transform duration-300 hover:scale-102"
              >
                <Plus className="h-4 w-4" /> Create a post
              </Link>
            </div>
          ) : (
            <EmployerJobList jobs={jobs} />
          )}
        </div>
      </main>
    </div>
  );
}
