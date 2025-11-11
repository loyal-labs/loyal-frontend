import type { LoyalSkill } from "@/types/skills";
import { AVAILABLE_SKILLS } from "@/types/skills";

export const SKILL_PREFIX = "\u2063"; // Invisible Separator
export const SKILL_SUFFIX = "\u2064"; // Invisible Plus
export const SKILL_TRAILING_SPACE =
  "\u2009 \u2009 \u2009 \u2009 \u2009 \u2009 "; // Extra spacing between pills

export type SkillTextSegment = {
  text: string;
  isSkill: boolean;
  skill?: LoyalSkill;
};

const findSkillByLabel = (label: string): LoyalSkill | undefined =>
  AVAILABLE_SKILLS.find(
    (skill) => skill.label.toLowerCase() === label.toLowerCase()
  );

// Pattern to match amount+currency (e.g., "10 SOL", "5.5 USD")
const AMOUNT_PATTERN = /^(\d+(?:\.\d+)?)\s+(SOL|USD|USDC|USDT|BONK)$/;

// Pattern to match swap amount+currency (e.g., "10 SOL", "5.5 USDC")
const SWAP_AMOUNT_PATTERN = /^(\d+(?:\.\d+)?)\s+(\w+)$/;

const parseAmountSkill = (text: string): LoyalSkill | undefined => {
  const match = text.match(AMOUNT_PATTERN);
  if (match) {
    const [, amount, currency] = match;
    return {
      id: `amount-${amount}-${currency}`,
      label: text,
      category: "amount",
      description: `${amount} ${currency}`,
    };
  }
  return;
};

export const splitSkillSegments = (value: string): SkillTextSegment[] => {
  if (!value) {
    return [];
  }

  const segments: SkillTextSegment[] = [];
  let buffer = "";
  let insideSkill = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if (char === SKILL_PREFIX) {
      if (insideSkill) {
        buffer += char;
        continue;
      }

      if (buffer) {
        segments.push({ text: buffer, isSkill: false });
        buffer = "";
      }

      insideSkill = true;
      continue;
    }

    if (char === SKILL_SUFFIX) {
      if (!insideSkill) {
        buffer += char;
        continue;
      }

      const skillText = buffer;
      // First try to match as a regular skill
      let skill = findSkillByLabel(skillText);

      // If no match, try to parse as an amount skill
      if (!skill) {
        skill = parseAmountSkill(skillText);
      }

      segments.push({
        text: skillText,
        isSkill: Boolean(skill),
        skill,
      });

      buffer = "";
      insideSkill = false;
      continue;
    }

    buffer += char;
  }

  if (buffer) {
    segments.push({
      text: insideSkill ? `${SKILL_PREFIX}${buffer}` : buffer,
      isSkill: false,
    });
  }

  return segments;
};

export const stripSkillMarkers = (value: string): string =>
  value
    .replaceAll(SKILL_PREFIX, "")
    .replaceAll(SKILL_SUFFIX, "")
    .replaceAll(SKILL_TRAILING_SPACE, " ");

/**
 * Detects if text contains a completed Swap skill
 * Pattern: Swap [amount fromCurrency] [toCurrency]
 * Example: Swap 10 SOL USDC
 */
export type SwapSkillData = {
  amount: string;
  fromCurrency: string;
  toCurrency: string;
};

export const detectSwapSkill = (value: string): SwapSkillData | null => {
  const segments = splitSkillSegments(value);

  // Find the Swap action skill
  const hasSwapSkill = segments.some(
    (seg) => seg.isSkill && seg.skill?.id === "swap"
  );

  if (!hasSwapSkill) {
    return null;
  }

  // Look for amount+fromCurrency segment
  let swapAmount: string | null = null;
  let fromCurrency: string | null = null;
  let toCurrency: string | null = null;

  for (const segment of segments) {
    if (!segment.isSkill || !segment.skill) {
      continue;
    }

    // Check if this is an amount skill (comes after Swap)
    if (
      segment.skill.category === "amount" ||
      SWAP_AMOUNT_PATTERN.test(segment.text)
    ) {
      const match = segment.text.match(SWAP_AMOUNT_PATTERN);
      if (match) {
        [, swapAmount, fromCurrency] = match;
      }
    }

    // Check if this is a standalone currency (the TO currency)
    if (
      segment.skill.category === "currency" &&
      swapAmount &&
      fromCurrency &&
      !toCurrency
    ) {
      toCurrency = segment.skill.label;
    }
  }

  // Return only if we have all three components
  if (swapAmount && fromCurrency && toCurrency) {
    return {
      amount: swapAmount,
      fromCurrency,
      toCurrency,
    };
  }

  return null;
};
