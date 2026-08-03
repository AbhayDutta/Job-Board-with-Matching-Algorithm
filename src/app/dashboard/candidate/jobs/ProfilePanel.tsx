"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useSpring } from "framer-motion";
import { uploadResumeAction, updateCandidateProfile } from "@/app/actions/candidate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Upload,
  Check,
  FileText,
  Loader2,
  Briefcase,
  GraduationCap,
  Sparkles,
  User,
} from "lucide-react";

import { toast } from "sonner";
import { BubbleTag, getSkillData, SkillSoundManager } from "@/components/BubbleTag";

import ResumeDropzone from "@/components/ResumeDropzone";

interface ProfilePanelProps {
  initialProfile: {
    skills: string[];
    education: string[];
    experience: string[];
    resumeUrl: string | null;
    name: string;
  } | null;
}

export default function ProfilePanel({ initialProfile }: ProfilePanelProps) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
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

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit form state
  const [isOpen, setIsOpen] = useState(false);
  const [editSkills, setEditSkills] = useState(initialProfile?.skills.join(", ") || "");
  const [editEducation, setEditEducation] = useState(initialProfile?.education.join("\n") || "");
  const [editExperience, setEditExperience] = useState(initialProfile?.experience.join("\n") || "");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // File Upload Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processResumeFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processResumeFile(e.target.files[0]);
    }
  };

  const processResumeFile = async (file: File) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadMessage({
        type: "error",
        text: "Unsupported file type. Please upload a PDF or DOCX file.",
      });
      return;
    }

    setUploading(true);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await uploadResumeAction(formData);
      if (res.success) {
        setProfile(res.profile ? { ...res.profile, name: profile?.name || "Candidate" } : null);
        
        // Sync the edit form state with newly parsed values
        setEditSkills(res.profile?.skills.join(", ") || "");
        setEditEducation(res.profile?.education.join("\n") || "");
        setEditExperience(res.profile?.experience.join("\n") || "");

        if (res.fallback) {
          const msg = res.error || "File uploaded, but could not auto-extract details. Please enter them manually.";
          setUploadMessage({
            type: "error",
            text: msg,
          });
          toast.error(msg);
        } else {
          setUploadMessage({
            type: "success",
            text: "Resume uploaded and auto-parsed successfully with Gemini!",
          });
          toast.success("Resume uploaded and parsed successfully!");
        }
        router.refresh();
      } else {
        const msg = res.error || "Failed to process resume.";
        setUploadMessage({
          type: "error",
          text: msg,
        });
        toast.error(msg);
      }
    } catch (err) {
      console.error(err);
      setUploadMessage({
        type: "error",
        text: "An unexpected error occurred during upload.",
      });
      toast.error("An unexpected error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  // Profile Save Handler
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveError(null);

    const parsedSkills = editSkills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const parsedEducation = editEducation
      .split("\n")
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    const parsedExperience = editExperience
      .split("\n")
      .map((ex) => ex.trim())
      .filter((ex) => ex.length > 0);

    try {
      const res = await updateCandidateProfile(parsedSkills, parsedEducation, parsedExperience);
      if (res.success) {
        setProfile(res.profile ? { ...res.profile, name: profile?.name || "Candidate" } : null);
        setIsOpen(false);
        setUploadMessage({
          type: "success",
          text: "Profile updated successfully!",
        });
        toast.success("Candidate profile updated successfully!");
        router.refresh();
      } else {
        setSaveError(res.error || "Failed to update profile.");
        toast.error(res.error || "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      setSaveError("An unexpected error occurred.");
      toast.error("An unexpected error occurred.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile details card */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-match-glow space-y-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-foreground">
            <User className="h-5.5 w-5.5" />
          </div>
          <div className="truncate">
            <h2 className="font-serif text-xl font-normal text-foreground">
              {profile?.name || "Candidate Profile"}
            </h2>
            <p className="text-[10px] text-muted-foreground font-mono truncate">
              {profile?.resumeUrl ? `Resume: ${profile.resumeUrl.substring(37)}` : "No resume synced"}
            </p>
          </div>
        </div>

        {/* Skill vector tags list */}
        <div className="space-y-2 pt-2 border-t border-border/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 font-mono">
            <Sparkles className="h-3 w-3 text-[oklch(0.72_0.18_35)]" /> Skills Vector Tags
          </span>
          {profile && profile.skills.length > 0 ? (
            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeaveContainer}
              className="flex flex-wrap gap-1.5"
            >
              {profile.skills.map((skill) => {
                const data = getSkillData(skill);
                const isHovered = hoveredSkill === skill;
                const textColor = (data.color === "#F7DF1E" || data.color === "#C5F82A" || data.color === "#FCC624") ? "#000000" : "#ffffff";
                
                return (
                  <BubbleTag
                    key={skill}
                    data={data}
                    isHovered={isHovered}
                    textColor={textColor}
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
            <p className="text-xs text-muted-foreground italic font-sans">
              No skills vector mapped yet. Upload your resume.
            </p>
          )}
        </div>

        {/* Education Timeline */}
        <div className="space-y-2 pt-2 border-t border-border/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 font-mono">
            <GraduationCap className="h-3 w-3" /> Education history
          </span>
          {profile && profile.education.length > 0 ? (
            <ul className="text-xs text-foreground/80 space-y-1.5 font-sans pl-1.5 border-l border-border/40 ml-1">
              {profile.education.map((edu, idx) => (
                <li key={idx} className="relative pl-3.5" title={edu}>
                  <span className="absolute left-0 top-1.5 h-1.5 w-1.5 rounded-full bg-foreground/35" />
                  <span className="line-clamp-2 leading-relaxed">{edu}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground italic font-sans pl-1">No education entries added.</p>
          )}
        </div>

        {/* Experience Timeline */}
        <div className="space-y-2 pt-2 border-t border-border/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 font-mono">
            <Briefcase className="h-3 w-3" /> Professional Experience
          </span>
          {profile && profile.experience.length > 0 ? (
            <ul className="text-xs text-foreground/80 space-y-1.5 font-sans pl-1.5 border-l border-border/40 ml-1">
              {profile.experience.map((exp, idx) => (
                <li key={idx} className="relative pl-3.5" title={exp}>
                  <span className="absolute left-0 top-1.5 h-1.5 w-1.5 rounded-full bg-[oklch(0.88_0.22_130)]" />
                  <span className="line-clamp-2 leading-relaxed">{exp}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground italic font-sans pl-1">No job experience entries added.</p>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-border/40">
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) setSaveError(null);
          }}>
            <DialogTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-full border-border/80 cursor-pointer text-xs font-semibold px-4"
                >
                  Modify Vector Data
                </Button>
              }
            />
            <DialogContent className="sm:max-w-lg p-6 bg-card border border-border rounded-2xl shadow-match-glow">
              <DialogHeader className="mb-4">
                <DialogTitle className="font-serif text-[24px] font-normal leading-[1.1] text-foreground">
                  Edit Profile Details
                </DialogTitle>
                <DialogDescription className="text-[12px] text-muted-foreground mt-1.5">
                  Manually fine-tune the skills and history stored in your candidate vector.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                {saveError && (
                  <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive font-medium border border-destructive/20">
                    <span>{saveError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="skills" className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
                    Skills (Comma separated)
                  </Label>
                  <Input
                    id="skills"
                    required
                    value={editSkills}
                    onChange={(e) => setEditSkills(e.target.value)}
                    placeholder="e.g. TypeScript, React, PostgreSQL, Node.js"
                    className="h-10 bg-background border-border rounded-xl focus-visible:ring-foreground focus-visible:border-foreground text-[15px] font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="education" className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
                    Education History (One entry per line)
                  </Label>
                  <textarea
                    id="education"
                    rows={3}
                    value={editEducation}
                    onChange={(e) => setEditEducation(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science - IIT&#10;Secondary Education - DPS"
                    className="w-full p-3 bg-background border border-border rounded-xl focus-visible:ring-foreground focus-visible:border-foreground text-[15px] font-sans resize-y leading-[1.5] outline-hidden focus:border-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="experience" className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
                    Experience History (One entry per line)
                  </Label>
                  <textarea
                    id="experience"
                    rows={3}
                    value={editExperience}
                    onChange={(e) => setEditExperience(e.target.value)}
                    placeholder="e.g. Senior Software Engineer - Acme Corp (2024-Present)&#10;Full Stack Developer - Startup Co (2022-2024)"
                    className="w-full p-3 bg-background border border-border rounded-xl focus-visible:ring-foreground focus-visible:border-foreground text-[15px] font-sans resize-y leading-[1.5] outline-hidden focus:border-foreground"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <DialogClose
                    render={
                      <Button type="button" variant="outline" className="rounded-full cursor-pointer">
                        Cancel
                      </Button>
                    }
                  />
                  <Button
                    type="submit"
                    disabled={saveLoading}
                    className="rounded-full bg-foreground text-background cursor-pointer px-5"
                  >
                    {saveLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> Saving...
                      </>
                    ) : (
                      "Save Profile"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Resume Dropzone card */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-match-glow space-y-4">
        <h3 className="font-serif text-lg font-normal text-foreground">Resume Skill Vector Uploader</h3>
        <p className="text-xs text-muted-foreground font-sans leading-relaxed">
          Upload or drop a fresh resume copy (PDF/DOCX) to recalculate candidate matching vectors.
        </p>

        <ResumeDropzone
          currentResumeUrl={profile?.resumeUrl}
          onSuccess={(updatedProfile) => {
            setProfile(updatedProfile ? { ...updatedProfile, name: profile?.name || "Candidate" } : null);
            setEditSkills(updatedProfile?.skills.join(", ") || "");
            setEditEducation(updatedProfile?.education.join("\n") || "");
            setEditExperience(updatedProfile?.experience.join("\n") || "");
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
