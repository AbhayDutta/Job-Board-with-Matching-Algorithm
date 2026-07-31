"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useSpring } from "framer-motion";
import { deleteJob, updateJob } from "@/app/actions/jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Users,
  MapPin,
  IndianRupee,
  Calendar,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  FileText,
  Briefcase,
  GraduationCap,
  Sparkles,
} from "lucide-react";

import { BubbleTag, getSkillData, SkillSoundManager } from "@/components/BubbleTag";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    company: string;
    location: string;
    salary: string;
    skillsRequired: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    skillsNiceToHave: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    createdAt: Date | string;
    applications: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  };
}

export default function JobCard({ job }: JobCardProps) {
  // Parse skills safely
  const initialRequiredSkills = Array.isArray(job.skillsRequired)
    ? job.skillsRequired
    : [];
  const initialNiceSkills = Array.isArray(job.skillsNiceToHave)
    ? job.skillsNiceToHave
    : [];

  // Edit Form State
  const [title, setTitle] = useState(job.title);
  const [company, setCompany] = useState(job.company);
  const [location, setLocation] = useState(job.location);
  const [salary, setSalary] = useState(job.salary);
  const [description, setDescription] = useState(job.description);
  const [skillsRequired, setSkillsRequired] = useState(initialRequiredSkills.join(", "));
  const [skillsNiceToHave, setSkillsNiceToHave] = useState(initialNiceSkills.join(", "));

  // Status UI State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerMouse, setContainerMouse] = useState({ x: 0, y: 0, active: false });

  const handleMouseMove = (e: React.MouseEvent) => {
    setContainerMouse({
      x: e.clientX,
      y: e.clientY,
      active: true,
    });
  };

  const handleMouseLeaveContainer = () => {
    setContainerMouse((prev) => ({ ...prev, active: false }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setError(null);

    const reqSkills = skillsRequired
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const niceSkills = skillsNiceToHave
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      const res = await updateJob(job.id, {
        title,
        company,
        location,
        salary,
        description,
        skillsRequired: reqSkills,
        skillsNiceToHave: niceSkills,
      });

      if (res.success) {
        setIsEditDialogOpen(false);
      } else {
        setError(res.error || "Failed to update job posting.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    setError(null);
    try {
      const res = await deleteJob(job.id);
      if (res.success) {
        setIsDeleteDialogOpen(false);
      } else {
        setError(res.error || "Failed to delete job posting.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="group rounded-2xl border border-border bg-card p-6 shadow-match-glow transition-all hover:shadow-match-glow-hover hover:border-foreground/30 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-border pb-5">
          <div className="space-y-1">
            <h3 className="font-serif text-[22px] md:text-[24px] font-normal text-foreground leading-[1.1]">{job.title}</h3>
            <p className="text-[15px] font-medium text-muted-foreground">
              {job.company}
            </p>
          </div>
          
          {/* Action Row */}
          <div className="flex items-center gap-2 self-start">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-1.5 text-xs font-semibold text-foreground mr-1">
              <Users className="h-3.5 w-3.5" />
              {job.applications.length} applicant{job.applications.length !== 1 && "s"}
            </span>

            {/* Edit Button + Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
              setIsEditDialogOpen(open);
              if (!open) setError(null);
            }}>
              <DialogTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="rounded-full cursor-pointer h-8 w-8 p-0"
                    aria-label="Edit Job"
                  />
                }
              >
                <Edit className="h-3.5 w-3.5" />
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg p-6 bg-card border border-border rounded-2xl shadow-match-glow">
                <DialogHeader className="mb-4">
                  <DialogTitle className="font-serif text-[24px] font-normal leading-[1.1] text-foreground">Edit Job Details</DialogTitle>
                  <DialogDescription className="text-[12px] text-muted-foreground mt-1.5">
                    Update the specification and requirements for this role.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleEditSubmit} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive font-medium border border-destructive/20">
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-title" className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Job Title</Label>
                      <Input
                        id="edit-title"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-10 bg-background border-border rounded-xl focus-visible:ring-foreground focus-visible:border-foreground text-[15px]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-company" className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Company Name</Label>
                      <Input
                        id="edit-company"
                        required
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="h-10 bg-background border-border rounded-xl focus-visible:ring-foreground focus-visible:border-foreground text-[15px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-location" className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Location</Label>
                      <Input
                        id="edit-location"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="h-10 bg-background border-border rounded-xl focus-visible:ring-foreground focus-visible:border-foreground text-[15px]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-salary" className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Salary</Label>
                      <Input
                        id="edit-salary"
                        required
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        className="h-10 bg-background border-border rounded-xl focus-visible:ring-foreground focus-visible:border-foreground text-[15px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-description" className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Job Description</Label>
                    <Textarea
                      id="edit-description"
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-24 bg-background border-border rounded-xl focus-visible:ring-foreground focus-visible:border-foreground leading-[1.5] text-[15px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-required" className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Required Skills (Comma separated)</Label>
                    <Input
                      id="edit-required"
                      required
                      value={skillsRequired}
                      onChange={(e) => setSkillsRequired(e.target.value)}
                      className="h-10 bg-background border-border rounded-xl focus-visible:ring-foreground focus-visible:border-foreground text-[15px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-nice" className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Nice-To-Have Skills (Comma separated)</Label>
                    <Input
                      id="edit-nice"
                      value={skillsNiceToHave}
                      onChange={(e) => setSkillsNiceToHave(e.target.value)}
                      className="h-10 bg-background border-border rounded-xl focus-visible:ring-foreground focus-visible:border-foreground text-[15px]"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <DialogClose render={<Button type="button" variant="outline" className="rounded-full cursor-pointer" />}>
                      Cancel
                    </DialogClose>
                    <Button
                      type="submit"
                      disabled={editLoading}
                      className="rounded-full bg-foreground text-background cursor-pointer px-5"
                    >
                      {editLoading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Delete Button + Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
              setIsDeleteDialogOpen(open);
              if (!open) setError(null);
            }}>
              <DialogTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="rounded-full cursor-pointer h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 border-border/80"
                    aria-label="Delete Job"
                  />
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
              </DialogTrigger>
              <DialogContent className="sm:max-w-md p-6 bg-card border border-border rounded-2xl shadow-match-glow">
                <DialogHeader className="mb-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <DialogTitle className="font-serif text-[24px] font-normal leading-[1.1] text-center text-foreground">Delete Position?</DialogTitle>
                  <DialogDescription className="text-center text-[12px] text-muted-foreground mt-1.5">
                    Are you absolutely sure you want to delete <strong>{job.title}</strong>? This action cannot be undone and will delete all applicant files.
                  </DialogDescription>
                </DialogHeader>

                {error && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive font-medium border border-destructive/20">
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex justify-center gap-3 pt-2">
                  <DialogClose render={<Button type="button" variant="outline" className="rounded-full cursor-pointer" />}>
                    Cancel
                  </DialogClose>
                  <Button
                    type="button"
                    disabled={deleteLoading}
                    onClick={handleDelete}
                    className="rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground cursor-pointer px-5"
                  >
                    {deleteLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> Deleting...
                      </>
                    ) : (
                      "Delete Posting"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Metadata Details */}
        <div className="flex flex-wrap items-center gap-5 text-[12px] md:text-[13px] text-muted-foreground font-mono">
          <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
          <span className="flex items-center gap-1.5"><IndianRupee className="h-3.5 w-3.5" /> {job.salary}</span>
          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Posted {new Date(job.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Job Description (NEW for Recruiter's view to facilitate editing/verifying details) */}
        <div className="space-y-1.5 pt-1 border-t border-border/40 mt-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 font-mono">
            <FileText className="h-3 w-3" /> Job Description:
          </span>
          <p className="text-[15px] text-foreground/90 leading-[1.5] font-sans line-clamp-3 whitespace-pre-wrap">
            {job.description}
          </p>
        </div>

        {/* Skills Tags */}
        <div className="space-y-2 pt-3 border-t border-border/40">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-2 font-mono">Must-Haves:</span>
            {initialRequiredSkills.map((skill: string) => (
              <span key={skill} className="rounded-full bg-foreground px-3 py-1 text-[11px] font-bold uppercase text-background">
                {skill}
              </span>
            ))}
          </div>
          {initialNiceSkills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-2 font-mono">Nice-To-Have:</span>
              {initialNiceSkills.map((skill: string) => (
                <span key={skill} className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase text-muted-foreground bg-transparent">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Applicants Roster */}
      {job.applications.length > 0 && (
        <div className="mt-6 border-t border-border pt-4">
          <h4 className="text-[12px] uppercase tracking-wider text-muted-foreground font-bold mb-3 flex items-center gap-1.5 font-mono">
            <Users className="h-3.5 w-3.5" /> Applicant Roster (Sorted by Match Score)
          </h4>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
            {[...job.applications]
              .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))
              .map((app: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                const profile = app.candidate.candidateProfile;
                const skills = profile && Array.isArray(profile.skills) ? (profile.skills as string[]) : [];
                const education = profile && Array.isArray(profile.education) ? (profile.education as string[]) : [];
                const experience = profile && Array.isArray(profile.experience) ? (profile.experience as string[]) : [];
                const candidateName = profile?.name || app.candidate.email.split("@")[0];
                const matchScore = app.matchScore !== null ? Math.round(app.matchScore) : null;

                return (
                  <Dialog key={app.id}>
                    <DialogTrigger
                      render={
                        <button type="button" className="rounded-xl border border-border p-3 text-xs bg-background flex items-center justify-between hover:border-foreground/30 hover:shadow-match-glow transition-all cursor-pointer group w-full text-left" />
                      }
                    >
                      <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                        <span className="font-semibold text-foreground truncate font-sans group-hover:text-foreground">
                          {candidateName}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate font-mono">
                          {app.candidate.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {matchScore !== null ? (
                          <span className="rounded-full bg-[oklch(0.88_0.22_130)] text-[#182025] text-[11px] font-bold px-2.5 py-0.5">
                            {matchScore}%
                          </span>
                        ) : (
                          <span className="rounded-full bg-secondary text-muted-foreground text-[11px] font-medium px-2 py-0.5">
                            N/A
                          </span>
                        )}
                      </div>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-lg p-6 bg-card border border-border rounded-2xl shadow-match-glow">
                      <DialogHeader className="mb-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <DialogTitle className="font-serif text-[24px] font-normal leading-[1.1] text-foreground">
                              {candidateName}
                            </DialogTitle>
                            <DialogDescription className="text-[12px] text-muted-foreground mt-1.5">
                              Applicant for {job.title}
                            </DialogDescription>
                          </div>
                          {matchScore !== null && (
                            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-[3px] border-[oklch(0.88_0.22_130)] bg-background font-mono text-[15px] font-bold text-foreground shadow-xs">
                              {matchScore}%
                            </div>
                          )}
                        </div>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="text-[13px] space-y-1">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold">Email:</span>
                          <p className="font-sans text-foreground">{app.candidate.email}</p>
                        </div>

                        {profile?.resumeUrl && (
                          <div className="text-[13px] space-y-1">
                            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold">Resume:</span>
                            <p className="font-sans text-foreground flex items-center gap-1.5 text-muted-foreground">
                              <FileText className="h-3.5 w-3.5 text-foreground" /> {profile.resumeUrl.substring(37) || "Uploaded Resume"}
                            </p>
                          </div>
                        )}

                        <div className="space-y-1.5 pt-2 border-t border-border/40">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 font-mono">
                            <Sparkles className="h-3 w-3 text-[oklch(0.72_0.18_35)]" /> Skills Vector:
                          </span>
                          {skills.length > 0 ? (
                            <div
                              ref={containerRef}
                              onMouseMove={handleMouseMove}
                              onMouseLeave={handleMouseLeaveContainer}
                              className="flex flex-wrap gap-1.5"
                            >
                              {skills.map((skill: string) => {
                                const isRequired = Array.isArray(initialRequiredSkills) &&
                                  initialRequiredSkills.map((s: string) => s.toLowerCase().trim()).includes(skill.toLowerCase().trim());
                                const isNice = Array.isArray(initialNiceSkills) &&
                                  initialNiceSkills.map((s: string) => s.toLowerCase().trim()).includes(skill.toLowerCase().trim());

                                const data = getSkillData(skill);
                                const isHovered = hoveredSkill === skill;
                                const textColor = (data.color === "#F7DF1E" || data.color === "#C5F82A" || data.color === "#FCC624") ? "#000000" : "#ffffff";

                                let badgeStyle = "bg-secondary/70 text-muted-foreground border border-border/60";
                                if (isRequired) badgeStyle = "bg-foreground text-background font-bold border border-transparent";
                                else if (isNice) badgeStyle = "border border-border text-foreground font-medium";

                                return (
                                  <BubbleTag
                                    key={skill}
                                    data={data}
                                    isHovered={isHovered}
                                    textColor={textColor}
                                    badgeStyle={badgeStyle}
                                    onMouseEnter={() => {
                                      setHoveredSkill(skill);
                                      SkillSoundManager.playHover(data.freq);
                                    }}
                                    onMouseLeave={() => setHoveredSkill(null)}
                                    onClick={() => SkillSoundManager.playClick(data.freq)}
                                    containerMouse={containerMouse}
                                  >
                                    {skill}
                                  </BubbleTag>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic font-sans">No skills listed in profile.</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40">
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 font-mono">
                              <GraduationCap className="h-3.5 w-3.5" /> Education:
                            </span>
                            {education.length > 0 ? (
                              <ul className="text-[13px] text-foreground/80 space-y-1 font-sans list-disc list-inside leading-relaxed">
                                {education.map((edu: string, idx: number) => (
                                  <li key={idx}>{edu}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-muted-foreground italic font-sans">No education listed.</p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 font-mono">
                              <Briefcase className="h-3.5 w-3.5" /> Experience:
                            </span>
                            {experience.length > 0 ? (
                              <ul className="text-[13px] text-foreground/80 space-y-1 font-sans list-disc list-inside leading-relaxed">
                                {experience.map((exp: string, idx: number) => (
                                  <li key={idx}>{exp}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-muted-foreground italic font-sans">No experience listed.</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-border/40 mt-4">
                        <DialogClose render={<Button type="button" variant="outline" className="rounded-full cursor-pointer text-xs px-4" />}>
                          Close Profile
                        </DialogClose>
                      </div>
                    </DialogContent>
                  </Dialog>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
