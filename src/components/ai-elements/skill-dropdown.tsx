"use client";

import type { CSSProperties } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";
import type { LoyalSkill } from "@/types/skills";

type SkillDropdownProps = {
  skills: LoyalSkill[];
  selectedIndex: number;
  onSelect: (skill: LoyalSkill) => void;
  position?: { top: number; left: number };
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  style?: CSSProperties;
};

const DROPDOWN_SPACING = 12;
const VIEWPORT_PADDING = 16;
const MIN_DROPDOWN_HEIGHT = 100;
const DROPDOWN_MIN_WIDTH = 250;
const SKILL_ITEM_HEIGHT = 60;
const DROPDOWN_PADDING = 20;

export const SkillDropdown = ({
  skills,
  selectedIndex,
  onSelect,
  position,
  textareaRef,
  style,
}: SkillDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [calculatedPosition, setCalculatedPosition] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useLayoutEffect(() => {
    setIsMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!(textareaRef?.current && position)) {
      return;
    }

    const textarea = textareaRef.current;
    const textareaRect = textarea.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(textarea);
    const paddingTop = Number.parseFloat(computedStyle.paddingTop);
    const paddingLeft = Number.parseFloat(computedStyle.paddingLeft);

    const cursorTopInViewport = textareaRect.top + paddingTop + position.top;
    const cursorLeftInViewport =
      textareaRect.left + paddingLeft + position.left;

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const dropdownHeight = dropdownRef.current?.offsetHeight ?? 0;
    const estimatedHeight =
      dropdownHeight > 0
        ? dropdownHeight
        : skills.length * SKILL_ITEM_HEIGHT + DROPDOWN_PADDING;
    const spaceBelow = viewportHeight - cursorTopInViewport - DROPDOWN_SPACING;

    let top: number;
    if (spaceBelow < estimatedHeight && cursorTopInViewport > estimatedHeight) {
      top = Math.max(
        VIEWPORT_PADDING,
        cursorTopInViewport - estimatedHeight - DROPDOWN_SPACING
      );
    } else {
      top = cursorTopInViewport + DROPDOWN_SPACING;
    }

    top = Math.min(
      Math.max(VIEWPORT_PADDING, top),
      viewportHeight - VIEWPORT_PADDING - MIN_DROPDOWN_HEIGHT
    );

    const left = Math.min(
      Math.max(VIEWPORT_PADDING, cursorLeftInViewport),
      viewportWidth - VIEWPORT_PADDING - DROPDOWN_MIN_WIDTH
    );

    setCalculatedPosition({ top, left });
  }, [position, textareaRef, skills.length]);

  if (!(skills.length && isMounted)) {
    return null;
  }

  const dropdownElement = (
    <div
      className="pointer-events-auto"
      ref={dropdownRef}
      style={{
        position: "fixed",
        top: calculatedPosition.top,
        left: calculatedPosition.left,
        zIndex: 9999,
        ...style,
      }}
    >
      <div
        className="min-w-[15rem] rounded-[1.25rem] border border-white/25 bg-black/75 p-1 text-sm text-white backdrop-blur-[20px]"
        style={{
          boxShadow:
            "0 8px 32px 0 rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
          transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {skills.map((skill, index) => {
          const isActive = index === selectedIndex;

          return (
            <button
              className={cn(
                "flex w-full items-center rounded-[1.2rem] px-4 py-2.5 text-left transition-all duration-300",
                "text-white/90 hover:bg-white/15",
                isActive && "bg-white/20 text-white"
              )}
              key={skill.id}
              onMouseDown={(event) => {
                event.preventDefault();
                onSelect(skill);
              }}
              style={
                isActive
                  ? {
                      boxShadow:
                        "0 2px 8px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                    }
                  : undefined
              }
              type="button"
            >
              <div className="flex flex-1 items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium tracking-wide">
                    {skill.label}
                  </span>
                  {skill.description && (
                    <span className="text-white/60 text-xs">
                      {skill.description}
                    </span>
                  )}
                </div>
                {isActive && (
                  <div className="flex items-center gap-1.5">
                    <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-medium text-[10px] text-white/70">
                      Tab
                    </kbd>
                    <span className="text-white/50 text-xs">or</span>
                    <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-medium text-[10px] text-white/70">
                      ↵
                    </kbd>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return createPortal(dropdownElement, document.body);
};
