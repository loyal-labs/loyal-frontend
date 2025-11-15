"use client";

import type { CSSProperties, TextareaHTMLAttributes } from "react";
import {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { SkillDropdown } from "@/components/ai-elements/skill-dropdown";
import { SkillHighlightOverlay } from "@/components/skill-highlight-overlay";
import { useSkillInvocation } from "@/hooks/use-skill-invocation";
import { detectSwapSkill } from "@/lib/skills-text";
import type { LoyalSkill } from "@/types/skills";

const SKILL_HORIZONTAL_PADDING_REM = 0.65;
const SKILL_VERTICAL_PADDING_REM = 0.15;

export type SkillsTextareaProps =
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    onSkillSelect?: (skill: LoyalSkill, slashIndex: number) => void;
    onSwapComplete?: (data: {
      amount: string;
      fromCurrency: string;
      toCurrency: string;
    }) => void;
  } & {
    placeholder?: string;
  };

export const SkillsTextarea = forwardRef<
  HTMLTextAreaElement,
  SkillsTextareaProps
>(({ onKeyDown, onInput, onChange, value, ...props }, ref) => {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const [typographyStyles, setTypographyStyles] = useState<
    Pick<
      CSSProperties,
      "fontFamily" | "fontSize" | "fontWeight" | "letterSpacing" | "lineHeight"
    >
  >(() => ({
    fontFamily: props.style?.fontFamily ?? "inherit",
    fontSize: props.style?.fontSize ?? "1rem",
    fontWeight: props.style?.fontWeight,
    letterSpacing: props.style?.letterSpacing,
    lineHeight: props.style?.lineHeight ?? "1.5",
  }));

  const textareaRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      internalRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );

  const {
    isDropdownOpen,
    dropdownPosition,
    selectedSkillIndex,
    filteredSkills,
    skillSegments,
    handleKeyDown: handleSkillKeyDown,
    handleInput: handleSkillInput,
    selectSkill,
    pendingAmountInput,
    pendingCurrencySelection,
    showDeactivatedHint,
    pendingSwapToCurrency,
    swapData,
  } = useSkillInvocation({
    textareaRef: internalRef,
    onChange,
    currentValue: value as string | undefined,
  });

  const handleKeyDownCombined = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    const handledBySkill = handleSkillKeyDown(e);
    if (!handledBySkill && onKeyDown) {
      onKeyDown(e);
    }
  };

  const handleInputCombined = (e: React.FormEvent<HTMLTextAreaElement>) => {
    handleSkillInput(e);
    if (onInput) {
      onInput(e);
    }
  };

  const handleChangeCombined = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e);
    }
  };

  const styleDependencies = {
    fontFamily: props.style?.fontFamily,
    fontSize: props.style?.fontSize,
    fontWeight: props.style?.fontWeight,
    letterSpacing: props.style?.letterSpacing,
    lineHeight: props.style?.lineHeight,
  };

  useLayoutEffect(() => {
    const textarea = internalRef.current;
    if (!textarea) {
      return;
    }

    const syncTypography = () => {
      const computed = window.getComputedStyle(textarea);
      setTypographyStyles({
        fontFamily: styleDependencies.fontFamily ?? computed.fontFamily,
        fontSize: styleDependencies.fontSize ?? computed.fontSize,
        fontWeight: styleDependencies.fontWeight ?? computed.fontWeight,
        letterSpacing:
          styleDependencies.letterSpacing ?? computed.letterSpacing,
        lineHeight: styleDependencies.lineHeight ?? computed.lineHeight,
      });
    };

    syncTypography();

    const fontSet = document.fonts;
    const supportsFontEvents = Boolean(fontSet?.addEventListener);
    if (supportsFontEvents) {
      fontSet.addEventListener("loadingdone", syncTypography);
    }

    return () => {
      if (supportsFontEvents) {
        fontSet.removeEventListener("loadingdone", syncTypography);
      }
    };
  }, [
    styleDependencies.fontFamily,
    styleDependencies.fontSize,
    styleDependencies.fontWeight,
    styleDependencies.letterSpacing,
    styleDependencies.lineHeight,
  ]);

  const hasActionSkills = skillSegments.some(
    (segment) => segment.isSkill && segment.skill?.category === "action"
  );

  // Check if swap is complete (has all required data)
  const swapSkillData = value ? detectSwapSkill(value as string) : null;
  const isSwapComplete = swapSkillData !== null;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        flex: 1,
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      {hasActionSkills && (
        <div
          style={{
            position: "absolute",
            inset: "0",
            borderRadius: "20px",
            boxShadow: isSwapComplete
              ? "0 0 0 2px rgba(34, 197, 94, 0.6), 0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(34, 197, 94, 0.2)"
              : "0 0 0 2px rgba(255, 255, 255, 0.6), 0 0 20px rgba(255, 255, 255, 0.4), 0 0 40px rgba(255, 255, 255, 0.2)",
            pointerEvents: "none",
            zIndex: 0,
            transition: "all 0.3s ease",
          }}
        />
      )}
      <SkillHighlightOverlay
        segments={skillSegments}
        skillClassName="text-transparent"
        skillStyle={{
          display: "inline-block",
          padding: `${SKILL_VERTICAL_PADDING_REM}rem ${SKILL_HORIZONTAL_PADDING_REM}rem`,
          marginLeft: "0.25rem",
          borderRadius: "999px",
          background:
            "linear-gradient(135deg, rgba(248, 113, 113, 0.25), rgba(239, 68, 68, 0.5))",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          boxShadow:
            "0 14px 35px rgba(239, 68, 68, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(239, 68, 68, 0.4)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
        }}
        style={{
          padding: props.style?.padding || "1.25rem 1.75rem",
          paddingRight: props.style?.paddingRight || "3.5rem",
          color: props.style?.color || "#fff",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          overflowWrap: "break-word",
          overflow: "hidden",
          zIndex: 0,
          ...typographyStyles,
        }}
        textClassName="opacity-0"
      />

      <textarea
        onChange={handleChangeCombined}
        onInput={handleInputCombined}
        onKeyDown={handleKeyDownCombined}
        placeholder={
          pendingCurrencySelection && !swapData.fromCurrency
            ? "Select FROM currency (SOL, Loyal, etc.)..."
            : pendingAmountInput
              ? "Type amount (e.g., 10) then press Enter..."
              : pendingSwapToCurrency
                ? "Select TO currency..."
                : props.placeholder
        }
        ref={textareaRef}
        {...props}
        style={{
          ...props.style,
          position: "relative",
          zIndex: 1,
          backgroundColor:
            (typeof props.style?.background === "string"
              ? props.style.background
              : undefined) || "transparent",
          caretColor: props.style?.color || "#fff",
        }}
      />
      {(pendingAmountInput ||
        pendingCurrencySelection ||
        pendingSwapToCurrency) && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "0.75rem 1rem",
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            borderRadius: "1.25rem",
            color: "rgba(255, 255, 255, 0.9)",
            fontSize: "0.875rem",
            fontWeight: 500,
            pointerEvents: "none",
            zIndex: 10,
            whiteSpace: "nowrap",
            boxShadow:
              "0 8px 32px 0 rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
          }}
        >
          {pendingCurrencySelection && !swapData.fromCurrency ? (
            <>
              Select <strong>FROM</strong> currency
            </>
          ) : pendingSwapToCurrency && pendingCurrencySelection ? (
            <>
              Select <strong>TO</strong> currency
            </>
          ) : (
            <>
              Enter amount then{" "}
              <kbd
                style={{
                  padding: "0.25rem 0.5rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "0.25rem",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  fontFamily: "inherit",
                  fontSize: "0.625rem",
                  fontWeight: 500,
                  color: "rgba(255, 255, 255, 0.7)",
                }}
              >
                ↵
              </kbd>
            </>
          )}
        </div>
      )}
      {showDeactivatedHint && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "0.75rem 1rem",
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            borderRadius: "1.25rem",
            color: "rgba(255, 255, 255, 0.9)",
            fontSize: "0.875rem",
            fontWeight: 500,
            pointerEvents: "none",
            zIndex: 10,
            whiteSpace: "nowrap",
            boxShadow:
              "0 8px 32px 0 rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
          }}
        >
          Skill mode deactivated
        </div>
      )}

      {isDropdownOpen && (
        <SkillDropdown
          onSelect={selectSkill}
          position={dropdownPosition}
          selectedIndex={selectedSkillIndex}
          skills={filteredSkills}
          textareaRef={internalRef as React.RefObject<HTMLTextAreaElement>}
        />
      )}
    </div>
  );
});

SkillsTextarea.displayName = "SkillsTextarea";
