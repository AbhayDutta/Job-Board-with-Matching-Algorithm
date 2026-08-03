import Link from "next/link";
import { getJobs } from "@/app/actions/jobs";
import { LogOut, Briefcase, Sparkles, TrendingUp, Cpu, Award } from "lucide-react";
import { redirect } from "next/navigation";
import { getServerSession as getSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import ProfilePanel from "./ProfilePanel";
import JobCardList from "./JobCardList";
import { calculateMatchScore } from "@/lib/matching";
import WelcomeSkillsHeader from "./WelcomeSkillsHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import ThemeToggle from "@/components/ThemeToggle";
import UserProfileModal from "@/components/UserProfileModal";
import { SignOutButton } from "@/components/SignOutButton";

export default async function CandidateJobsPage() {
  const session = await getSession(authOptions);

  if (!session || session.user?.role !== "CANDIDATE") {
    redirect("/login");
  }

  // Load user record
  const userRecord = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, avatarUrl: true, role: true, plan: true },
  });

  // Load candidate profile
  const profile = await db.candidateProfile.findUnique({
    where: { userId: session.user.id },
  });

  const candidateSkills = profile && Array.isArray(profile.skills)
    ? (profile.skills as string[])
    : [];

  const res = await getJobs();
  const jobs = res.success && res.jobs ? res.jobs : [];

  const userApplications = await db.application.findMany({
    where: { candidateId: session.user.id },
    select: { jobId: true, status: true, interviewDate: true, joiningDate: true, noticePeriod: true },
  });
  const appliedJobIds = userApplications.map((app) => app.jobId);
  const userApplicationsMap = userApplications.reduce((acc, app) => {
    acc[app.jobId] = {
      status: app.status,
      interviewDate: app.interviewDate,
      joiningDate: app.joiningDate,
      noticePeriod: app.noticePeriod,
    };
    return acc;
  }, {} as Record<string, { status: string; interviewDate: Date | null; joiningDate?: Date | null; noticePeriod?: string | null }>);

  const userBookmarks = await db.bookmark.findMany({
    where: { candidateId: session.user.id },
    select: { jobId: true },
  });
  const bookmarkedJobIds = userBookmarks.map((b) => b.jobId);

  // Pre-calculate match scores for all jobs
  const jobsWithScores = jobs.map((job: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const mustHave = Array.isArray(job.skillsRequired) ? (job.skillsRequired as string[]) : [];
    const niceToHave = Array.isArray(job.skillsNiceToHave) ? (job.skillsNiceToHave as string[]) : [];
    const score = calculateMatchScore(candidateSkills, mustHave, niceToHave);
    return {
      ...job,
      skillsRequired: mustHave,
      skillsNiceToHave: niceToHave,
      score
    };
  });

  // Calculate Average Match Score
  const avgMatchScore = jobsWithScores.length > 0 
    ? Math.round(jobsWithScores.reduce((acc, j) => acc + j.score, 0) / jobsWithScores.length)
    : 0;

  // Calculate missing skills for recommendations
  const missingSkillsMap: Record<string, number> = {};
  jobsWithScores.forEach((job) => {
    const allJobSkills = [...job.skillsRequired, ...job.skillsNiceToHave];
    allJobSkills.forEach((skill) => {
      const normalizedSkill = skill.toLowerCase().trim();
      const hasSkill = candidateSkills.some(cs => cs.toLowerCase().trim() === normalizedSkill);
      if (!hasSkill && normalizedSkill !== "") {
        missingSkillsMap[skill] = (missingSkillsMap[skill] || 0) + 1;
      }
    });
  });

  const recommendedSkills = Object.entries(missingSkillsMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([skill]) => skill);

  // Skill categorization counts
  const frontendKeywords = ["react", "next.js", "nextjs", "vue", "angular", "svelte", "typescript", "javascript", "html", "css", "tailwind", "sass", "redux", "ui", "ux", "frontend"];
  const backendKeywords = ["node", "express", "python", "django", "flask", "ruby", "rails", "go", "golang", "java", "spring", "c#", ".net", "rust", "php", "laravel", "fastapi", "graphql", "rest", "backend"];
  const dbKeywords = ["sql", "postgres", "postgresql", "mysql", "mongodb", "redis", "sqlite", "prisma", "mongoose", "dynamodb", "oracle", "firebase", "firestore", "mariadb", "database"];

  let feCount = 0;
  let beCount = 0;
  let dbCount = 0;
  let toolCount = 0;

  candidateSkills.forEach(skill => {
    const s = skill.toLowerCase();
    if (frontendKeywords.some(kw => s.includes(kw))) {
      feCount++;
    } else if (backendKeywords.some(kw => s.includes(kw))) {
      beCount++;
    } else if (dbKeywords.some(kw => s.includes(kw))) {
      dbCount++;
    } else {
      toolCount++;
    }
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Sticky Glassmorphic Navbar */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="group flex items-center gap-2.5 text-lg font-black tracking-tight text-foreground select-none">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-foreground text-background text-xs font-mono transition-transform group-hover:rotate-6">◆</span>
            <span className="font-serif text-xl font-bold">Fitboard</span>
          </Link>
          <nav className="flex gap-6 text-sm font-semibold text-muted-foreground">
            <Link href="/dashboard/candidate/jobs" className="text-foreground border-b-2 border-foreground pb-1">
              Explore Jobs
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
      <main className="mx-auto max-w-7xl px-6 py-10 space-y-8">
        
        {/* Welcome & Profile Header Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 border-b border-border/40 pb-8 items-start">
          {/* Welcome Text Left */}
          <div className="lg:col-span-2 space-y-3.5 text-left">
            <h1 className="font-serif text-3xl md:text-4xl font-normal text-foreground">
              Candidate Workspace
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Analyze your parsed profile vector, view recommendations, and explore matched positions.
            </p>
            {profile?.resumeUrl && (
              <div className="inline-flex items-center gap-2 bg-card border border-border/80 px-3.5 py-1.5 rounded-xl text-xs font-medium text-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.88_0.22_130)] animate-pulse" />
                Vector profile synced
              </div>
            )}
          </div>
          
          {/* Abhay Dutta Profile Card in Header Right */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3 text-left shadow-xs relative hover:border-foreground/30 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-sans font-bold text-[15px] text-foreground">{profile?.name || session.user.email.split("@")[0]}</h4>
                <p className="text-[10px] text-muted-foreground font-mono">{session.user.email}</p>
              </div>
              
              {/* Radix Dialog wrapper for edit profile details */}
              <Dialog>
                <DialogTrigger
                  render={
                    <button className="text-[9.5px] font-bold uppercase tracking-wider bg-foreground text-background px-2.5 py-1 rounded-md font-mono hover:bg-[oklch(0.88_0.22_130)] hover:text-black cursor-pointer transition-colors shrink-0">
                      Edit Profile
                    </button>
                  }
                />
                <DialogContent className="sm:max-w-xl p-6 bg-card border border-border rounded-2xl shadow-match-glow max-h-[85vh] overflow-y-auto">
                  <DialogHeader className="mb-4">
                    <DialogTitle className="font-serif text-[24px] font-normal leading-[1.1] text-foreground">Candidate Profile Editor</DialogTitle>
                    <DialogDescription className="text-[12px] text-muted-foreground mt-1.5">
                      Upload your resume PDF, configure matching weights, and update your education/experience records.
                    </DialogDescription>
                  </DialogHeader>
                  <ProfilePanel
                    initialProfile={
                      profile
                        ? {
                            skills: Array.isArray(profile.skills) ? (profile.skills as string[]) : [],
                            education: Array.isArray(profile.education) ? (profile.education as string[]) : [],
                            experience: Array.isArray(profile.experience) ? (profile.experience as string[]) : [],
                            resumeUrl: profile.resumeUrl,
                            name: profile.name,
                          }
                        : null
                    }
                  />
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Skills:</span>
              {candidateSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {candidateSkills.slice(0, 4).map(skill => (
                    <span key={skill} className="rounded-md bg-secondary/60 px-2 py-0.5 text-[9.5px] font-bold text-muted-foreground uppercase font-sans">
                      {skill}
                    </span>
                  ))}
                  {candidateSkills.length > 4 && (
                    <span className="rounded-md bg-secondary/35 px-2 py-0.5 text-[9.5px] font-bold text-muted-foreground/60 uppercase font-sans">
                      +{candidateSkills.length - 4} More
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic font-sans">No skills added yet.</p>
              )}
            </div>

            {profile?.education && Array.isArray(profile.education) && profile.education.length > 0 && (
              <div className="space-y-0.5 pt-1.5 border-t border-border/40">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Education:</span>
                <p className="text-[11.5px] text-foreground font-medium truncate font-sans">
                  {String(profile.education[0])}
                </p>
              </div>
            )}
          </div>

          {/* Full-width Skills Vector Tags spanning all 3 columns */}
          <div className="lg:col-span-3 pt-4 border-t border-border/40">
            <WelcomeSkillsHeader candidateSkills={candidateSkills} />
          </div>
        </div>

        {/* Analytics Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Profile Status */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs hover:border-violet-500/30 transition-all duration-300 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground font-mono">Profile status</span>
              <Award className="h-4.5 w-4.5 text-violet-500" />
            </div>
            <div>
              <div className="text-2xl font-serif font-normal text-foreground flex items-center gap-1.5">
                {profile ? (profile.resumeUrl ? "Parsed" : "Manual") : "Setup Required"}
              </div>
              <div className="mt-2.5 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500" 
                  style={{ width: profile ? (profile.resumeUrl ? "100%" : "60%") : "10%" }} 
                />
              </div>
            </div>
          </div>

          {/* Skills Category breakdown */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs hover:border-blue-500/30 transition-all duration-300 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground font-mono">Skill categories</span>
              <Cpu className="h-4.5 w-4.5 text-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono font-bold">
              <div className="flex justify-between items-center bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2.5 py-1.5 rounded-lg">
                <span>FE</span>
                <span>{feCount}</span>
              </div>
              <div className="flex justify-between items-center bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 px-2.5 py-1.5 rounded-lg">
                <span>BE</span>
                <span>{beCount}</span>
              </div>
              <div className="flex justify-between items-center bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2.5 py-1.5 rounded-lg">
                <span>DB</span>
                <span>{dbCount}</span>
              </div>
              <div className="flex justify-between items-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg">
                <span>Tools</span>
                <span>{toolCount}</span>
              </div>
            </div>
          </div>

          {/* Match Average */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs hover:border-amber-500/30 transition-all duration-300 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground font-mono">Match efficiency</span>
              <TrendingUp className="h-4.5 w-4.5 text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-serif font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 dark:from-orange-400 dark:to-yellow-300">
                {avgMatchScore}% <span className="text-xs text-muted-foreground font-sans font-medium">Avg Fit</span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-1.5 font-mono">
                Based on {jobsWithScores.length} open roles
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations Alert */}
        {candidateSkills.length > 0 && recommendedSkills.length > 0 && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 flex items-start gap-4 shadow-xs backdrop-blur-md text-left">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber-500 text-background">
              <Sparkles className="h-4.5 w-4.5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif text-lg font-normal text-amber-600 dark:text-amber-400">AI Match Optimization</h4>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Recruiters are frequently looking for <span className="font-bold text-foreground">{recommendedSkills.join(", ")}</span>. Adding these skills to your profile can boost your match fit ratings across several positions by up to 25%.
              </p>
            </div>
          </div>
        )}

        {/* Job Listings Panel */}
        <JobCardList
          jobs={jobsWithScores}
          appliedJobIds={appliedJobIds}
          userApplicationsMap={userApplicationsMap}
          candidateSkillsLength={candidateSkills.length}
          initialBookmarkedJobIds={bookmarkedJobIds}
        />
      </main>
    </div>
  );
}
