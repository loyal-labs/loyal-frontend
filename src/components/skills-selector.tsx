"use client";

import { Repeat2, Send, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { AVAILABLE_SKILLS, type LoyalSkill } from "@/types/skills";

const ACTION_SKILLS = AVAILABLE_SKILLS.filter((s) => s.category === "action");

type SkillsSelectorProps = {
  selectedSkillId?: string;
  onSkillSelect: (skill: LoyalSkill | null) => void;
  onClose?: () => void;
  className?: string;
  hintSkillId?: string;
  nlpState?: {
    isActive: boolean;
    intent: "send" | "swap" | null;
    parsedData: {
      amount: string | null;
      currency: string | null;
      currencyMint: string | null;
      currencyDecimals: number | null;
      walletAddress: string | null;
      toCurrency: string | null;
      toCurrencyMint: string | null;
      toCurrencyDecimals: number | null;
    };
  };
};

const getSkillIcon = (skillId: string) => {
  switch (skillId) {
    case "send": {
      return <Send className="h-4 w-4 opacity-60" />;
    }
    case "swap": {
      return <Repeat2 className="h-4 w-4 opacity-60" />;
    }
    default: {
      return null;
    }
  }
};

export function SkillsSelector({
  selectedSkillId,
  onSkillSelect,
  onClose,
  className,
  hintSkillId,
  nlpState,
}: SkillsSelectorProps) {
  const handleButtonClick = (skill: LoyalSkill) => {
    // If clicking the currently selected skill, deactivate it
    if (selectedSkillId === skill.id) {
      onSkillSelect(null);
    } else {
      // Otherwise, activate this skill
      onSkillSelect(skill);
    }
  };

  // Base styles for NLP flow pills - matching Send/Swap button styling
  const basePillStyle =
    "inline-flex items-center justify-center gap-1.5 rounded-[32px] px-4 py-1.5 text-sm transition-all text-white backdrop-blur-[24px]";
  const filledPillStyle =
    "shadow-[0px_4px_8px_0px_rgba(0,0,0,0.04),0px_4px_24px_0px_rgba(0,0,0,0.08)]";
  const emptyPillStyle =
    "border border-dashed border-white/20 bg-[rgba(38,38,38,0.5)] text-white/50 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.04),0px_4px_24px_0px_rgba(0,0,0,0.08)]";

  if (nlpState?.isActive) {
    const isSwap = nlpState.intent === "swap";
    const isReady = isSwap
      ? nlpState.parsedData.amount &&
        nlpState.parsedData.currency &&
        nlpState.parsedData.toCurrency
      : nlpState.parsedData.amount &&
        nlpState.parsedData.currency &&
        nlpState.parsedData.walletAddress;

    return (
      <div
        className={cn("flex flex-col gap-2 md:flex-row md:gap-2", className)}
      >
        {/* Intent Pill (Send or Swap) */}
        <span
          className={cn(
            basePillStyle,
            filledPillStyle,
            "bg-[rgba(127,29,29,0.6)]"
          )}
        >
          {isSwap ? (
            <Repeat2 className="h-4 w-4 opacity-80" />
          ) : (
            <Send className="h-4 w-4 opacity-80" />
          )}
          {isSwap ? "Swap" : "Send"}
          {onClose && (
            <button
              className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              type="button"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          )}
        </span>

        {/* Amount Pill */}
        <span
          className={cn(
            basePillStyle,
            nlpState.parsedData.amount
              ? cn(filledPillStyle, "bg-[rgba(22,101,52,0.6)]")
              : emptyPillStyle
          )}
        >
          {nlpState.parsedData.amount || "Amount"}
        </span>

        {/* Currency Pill (From) */}
        <span
          className={cn(
            basePillStyle,
            nlpState.parsedData.currency
              ? cn(filledPillStyle, "bg-[rgba(38,38,38,0.6)]")
              : emptyPillStyle
          )}
        >
          {nlpState.parsedData.currency || "Currency"}
        </span>

        {/* To Address OR To Currency Pill */}
        {isSwap ? (
          <span
            className={cn(
              basePillStyle,
              nlpState.parsedData.toCurrency
                ? cn(filledPillStyle, "bg-[rgba(30,64,175,0.6)]")
                : emptyPillStyle
            )}
          >
            {nlpState.parsedData.toCurrency || "To Token"}
          </span>
        ) : (
          <span
            className={cn(
              basePillStyle,
              nlpState.parsedData.walletAddress
                ? cn(filledPillStyle, "bg-[rgba(30,64,175,0.6)]")
                : emptyPillStyle
            )}
            title={nlpState.parsedData.walletAddress || undefined}
          >
            {nlpState.parsedData.walletAddress
              ? nlpState.parsedData.walletAddress.length > 12
                ? `${nlpState.parsedData.walletAddress.slice(0, 6)}...${nlpState.parsedData.walletAddress.slice(-4)}`
                : nlpState.parsedData.walletAddress
              : "Recipient"}
          </span>
        )}

        {/* Ready Hint */}
        {isReady && (
          <span className="flex animate-pulse items-center font-medium text-white/70 text-xs md:ml-auto">
            Press Enter
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2", className)}>
      {ACTION_SKILLS.map((skill) => {
        const isActive = selectedSkillId === skill.id;
        const isHinted = hintSkillId === skill.id && !isActive;

        return (
          <button
            className={cn(
              "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-[32px] px-4 py-1.5 text-sm transition-all",
              "text-white backdrop-blur-[24px]",
              isActive
                ? "bg-[rgba(58,58,58,0.6)] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.08),0px_4px_24px_0px_rgba(0,0,0,0.12)]"
                : "bg-[rgba(38,38,38,0.5)] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.04),0px_4px_24px_0px_rgba(0,0,0,0.08)] hover:bg-[rgba(58,58,58,0.6)]",
              isHinted && "border border-dashed border-red-400/60",
              "focus:outline-none"
            )}
            key={skill.id}
            onClick={() => {
              handleButtonClick(skill);
            }}
            type="button"
          >
            {getSkillIcon(skill.id)}
            {skill.label}
          </button>
        );
      })}
    </div>
  );
}
