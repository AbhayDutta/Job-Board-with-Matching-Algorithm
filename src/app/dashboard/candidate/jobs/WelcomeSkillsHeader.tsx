"use client";

import { useState, useRef } from "react";
import { Sparkles } from "lucide-react";
import { BubbleTag, getSkillData, SkillSoundManager } from "@/components/BubbleTag";

interface WelcomeSkillsHeaderProps {
  candidateSkills: string[];
}

export default function WelcomeSkillsHeader({ candidateSkills }: WelcomeSkillsHeaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [containerMouse, setContainerMouse] = useState({ x: 0, y: 0, active: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setContainerMouse({
      x: e.clientX,
      y: e.clientY,
      active: true,
    });
  };

  const handleMouseLeaveContainer = () => {
    setContainerMouse((prev) => ({ ...prev, active: false }));
  };

  if (candidateSkills.length === 0) return null;

  return (
    <div className="space-y-3 text-left">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/80 font-mono select-none">
        <Sparkles className="h-4 w-4 text-[oklch(0.72_0.18_35)]" /> Skills Vector Tags
      </div>
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeaveContainer}
        className="flex flex-wrap gap-2 w-full"
      >
        {candidateSkills.map((skill) => {
          const data = getSkillData(skill);
          const isHovered = hoveredSkill === skill;
          const textColor = (data.color === "#F7DF1E" || data.color === "#C5F82A" || data.color === "#FCC624") ? "#000000" : "#ffffff";

          return (
            <BubbleTag
              key={skill}
              data={data}
              isHovered={isHovered}
              textColor={textColor}
              badgeStyle="text-[10px] font-bold py-1 px-3 bg-secondary/40 text-foreground border border-border/50 hover:border-foreground/30"
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
    </div>
  );
}
