"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ProfilePanel from "./ProfilePanel";
import { BubbleTag, getSkillData, SkillSoundManager } from "@/components/BubbleTag";

interface HeaderProfileCardProps {
  profile: any;
  session: any;
  candidateSkills: string[];
}

export default function HeaderProfileCard({ profile, session, candidateSkills }: HeaderProfileCardProps) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [containerMouse, setContainerMouse] = useState({ x: 0, y: 0, active: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!bubbleRef.current) return;
    const rect = bubbleRef.current.getBoundingClientRect();
    // Calculate coordinates relative to the viewport for getBoundingClientRect calculations
    setContainerMouse({
      x: e.clientX,
      y: e.clientY,
      active: true,
    });
  };

  const handleMouseLeaveContainer = () => {
    setContainerMouse((prev) => ({ ...prev, active: false }));
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3 text-left shadow-xs relative hover:border-foreground/30 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-sans font-bold text-[15px] text-foreground">
            {profile?.name || session?.user?.email?.split("@")[0] || "Abhay Dutta"}
          </h4>
          <p className="text-[10px] text-muted-foreground font-mono">
            {session?.user?.email || "abhaydutta123456@gmail.com"}
          </p>
        </div>
        
        {/* Radix Dialog wrapper for edit profile details */}
        <Dialog>
          <DialogTrigger
            render={
              <button className="text-[9.5px] font-bold uppercase tracking-wider bg-foreground text-background px-2.5 py-1 rounded-md font-mono hover:bg-[oklch(0.88_0.22_130)] hover:text-black cursor-pointer transition-colors shrink-0" />
            }
          >
            Edit Profile
          </DialogTrigger>
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
      
      <div className="space-y-1.5">
        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Skills:</span>
        {candidateSkills.length > 0 ? (
          <div
            ref={bubbleRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeaveContainer}
            className="flex flex-wrap gap-1.5"
          >
            {candidateSkills.slice(0, 4).map((skill) => {
              const data = getSkillData(skill);
              const isHovered = hoveredSkill === skill;
              const textColor = (data.color === "#F7DF1E" || data.color === "#C5F82A" || data.color === "#FCC624") ? "#000000" : "#ffffff";
              
              return (
                <BubbleTag
                  key={skill}
                  data={data}
                  isHovered={isHovered}
                  textColor={textColor}
                  badgeStyle="text-[9.5px] font-bold py-0.5 px-2 bg-secondary/60 text-muted-foreground border border-border/40"
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
            {candidateSkills.length > 4 && (
              <span className="rounded-full bg-secondary/35 border border-border/20 px-2 py-0.5 text-[9.5px] font-bold text-muted-foreground/60 uppercase font-sans select-none">
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
          <p className="text-[11.5px] text-foreground font-medium truncate font-sans" title={String(profile.education[0])}>
            {String(profile.education[0])}
          </p>
        </div>
      )}
    </div>
  );
}
