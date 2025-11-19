"use client";

import { Repeat2, Send, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { AVAILABLE_SKILLS, type LoyalSkill } from "@/types/skills";

const ACTION_SKILLS = AVAILABLE_SKILLS.filter((s) => s.category === "action");

type SkillsSelectorProps = {
  selectedSkillId?: string;
  onSkillSelect: (skill: LoyalSkill | null) => void;
  className?: string;
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
      return <Send className="h-3 w-3" />;
    }
    case "swap": {
      return <Repeat2 className="h-3 w-3" />;
    }
    default: {
      return null;
    }
  }
};

export function SkillsSelector({
  selectedSkillId,
  onSkillSelect,
  className,
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

  if (nlpState?.isActive) {
    const isSwap = nlpState.intent === "swap";
    const isReady = isSwap
      ? nlpState.parsedData.amount && nlpState.parsedData.currency && nlpState.parsedData.toCurrency
      : nlpState.parsedData.amount && nlpState.parsedData.currency && nlpState.parsedData.walletAddress;

    return (
      <div className={cn("flex gap-2", className)}>
        {/* Intent Pill (Send or Swap) */}
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 font-medium text-sm",
            "shadow-lg backdrop-blur-[18px]",
            isSwap
              ? "bg-gradient-to-br from-red-400/25 to-red-500/50 border-red-400/40 text-white"
              : "bg-gradient-to-br from-red-400/25 to-red-500/50 border-red-400/40 text-white"
          )}
        >
          {isSwap ? <Repeat2 size={14} /> : <Send size={14} />}
          {isSwap ? "Swap" : "Send"}
        </span>

        {/* Amount Pill */}
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 font-medium text-sm",
            "shadow-lg backdrop-blur-[18px]",
            nlpState.parsedData.amount
              ? "border-green-400/40 bg-green-400/25 text-white"
              : "border-white/10 bg-white/5 text-white/50 border-dashed"
          )}
        >
          {nlpState.parsedData.amount || "Amount"}
        </span>

        {/* Currency Pill (From) */}
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 font-medium text-sm",
            "shadow-lg backdrop-blur-[18px]",
            nlpState.parsedData.currency
              ? "border-white/25 bg-white/10 text-white"
              : "border-white/10 bg-white/5 text-white/50 border-dashed"
          )}
        >
          {nlpState.parsedData.currency || "Currency"}
        </span>

        {/* To Address OR To Currency Pill */}
        {isSwap ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 font-medium text-sm",
              "shadow-lg backdrop-blur-[18px]",
              nlpState.parsedData.toCurrency
                ? "border-blue-400/40 bg-blue-400/25 text-white"
                : "border-white/10 bg-white/5 text-white/50 border-dashed"
            )}
          >
            {nlpState.parsedData.toCurrency || "To Token"}
          </span>
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 font-medium text-sm",
              "shadow-lg backdrop-blur-[18px]",
              nlpState.parsedData.walletAddress
                ? "border-blue-400/40 bg-blue-400/25 text-white"
                : "border-white/10 bg-white/5 text-white/50 border-dashed"
            )}
            title={nlpState.parsedData.walletAddress || undefined}
          >
            {nlpState.parsedData.walletAddress
              ? (nlpState.parsedData.walletAddress.length > 12
                ? `${nlpState.parsedData.walletAddress.slice(0, 6)}...${nlpState.parsedData.walletAddress.slice(-4)}`
                : nlpState.parsedData.walletAddress)
              : "To Address"}
          </span>
        )}

        {/* Ready Hint */}
        {isReady && (
          <span className="ml-auto flex items-center text-xs font-medium text-white animate-pulse">
            Ready to execute
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2", className)}>
      {ACTION_SKILLS.map((skill) => {
        const isActive = selectedSkillId === skill.id;

        // Determine styles based on skill type
        let activeStyle = "bg-white/10 border-white/20";
        if (skill.id === "send") {
          activeStyle = "bg-gradient-to-br from-red-400/25 to-red-500/50 border-red-400/40";
        } else if (skill.id === "swap") {
          activeStyle = "bg-gradient-to-br from-purple-400/25 to-purple-500/50 border-purple-400/40";
        }

        return (
          <button
            key={skill.id}
            type="button"
            onClick={() => {
              handleButtonClick(skill);
            }}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 font-medium text-sm transition-all cursor-pointer",
              "shadow-lg backdrop-blur-[18px]",
              "text-white",
              isActive
                ? activeStyle
                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20",
              "focus:outline-none"
            )}
          >
            {getSkillIcon(skill.id)}
            {skill.label}
            {isActive && <X className="ml-1 h-3 w-3" />}
          </button>
        );
      })}
    </div>
  );
}
