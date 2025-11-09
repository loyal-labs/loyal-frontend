"use client";

import type { CSSProperties } from "react";

import type { SkillTextSegment } from "@/lib/skills-text";
import { cn } from "@/lib/utils";

type SkillHighlightOverlayProps = {
  segments: SkillTextSegment[];
  className?: string;
  style?: CSSProperties;
  skillClassName?: string;
  skillStyle?: CSSProperties;
  textClassName?: string;
  textStyle?: CSSProperties;
};

export const SkillHighlightOverlay = ({
  segments,
  className,
  style,
  skillClassName,
  skillStyle,
  textClassName,
  textStyle,
}: SkillHighlightOverlayProps) => {
  if (!segments.some((segment) => segment.isSkill)) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 z-0 whitespace-pre-wrap break-words",
        className
      )}
      style={style}
    >
      {segments.map((segment, index) => {
        const key = `${segment.isSkill ? "skill" : "text"}-${index}`;

        if (segment.isSkill) {
          const isActionSkill = segment.skill?.category === "action";

          // All skills get base styling, only action skills get colored background
          const finalStyle: CSSProperties | undefined = isActionSkill
            ? skillStyle
            : {
                ...skillStyle,
                background: "rgba(255, 255, 255, 0.1)",
                boxShadow: "none",
              };

          return (
            <span
              className={cn(
                "inline rounded-full border text-transparent",
                isActionSkill ? "border-primary/40" : "border-white/25",
                skillClassName
              )}
              key={key}
              style={finalStyle}
            >
              {segment.text}
            </span>
          );
        }

        return (
          <span
            className={cn("opacity-0", textClassName)}
            key={key}
            style={textStyle}
          >
            {segment.text}
          </span>
        );
      })}
    </div>
  );
};
