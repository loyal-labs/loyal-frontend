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

// Pattern to match amount+currency for Send flow (e.g., "10 SOL", "5.5 USDC")
// NOTE: For Swap flow, amount and currencies are kept separate
const AMOUNT_PATTERN = /^(\d+(?:\.\d+)?)\s+(SOL|USDC|USDT|BONK)$/;

// Pattern to match swap amount+currency (e.g., "10 SOL", "5.5 USDC")
const SWAP_AMOUNT_PATTERN = /^(\d+(?:\.\d+)?)\s+(\w+)$/;

const parseAmountSkill = (text: string): LoyalSkill | undefined => {
  // Only parse as amount skill if it's the complete pattern (e.g., "10 SOL")
  // Don't match if it's just a currency name like "SOL" or "USDC"
  const match = text.match(AMOUNT_PATTERN);
  if (match) {
    const [, amount, currency] = match;
    // Additional validation: ensure we actually have a number
    if (amount && Number.parseFloat(amount) > 0) {
      return {
        id: `amount-${amount}-${currency}`,
        label: text,
        category: "amount",
        description: `${amount} ${currency}`,
      };
    }
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
      // But skip this if it's just a number followed by a known currency
      // (for Swap flow where amount and currency are separate)
      if (!skill && skillText.match(AMOUNT_PATTERN)) {
        // Only create amount skill for Send flow (explicit amount+currency)
        // Check if this looks like an intentional amount+currency combination
        // by verifying it's not at the end of a swap sequence
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
 * New Pattern: Swap [fromCurrency] [amount] [toCurrency]
 * Example: Swap SOL 10 USDC
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

  // New order: FROM currency → amount → TO currency
  let fromCurrency: string | null = null;
  let swapAmount: string | null = null;
  let toCurrency: string | null = null;

  for (const segment of segments) {
    // Handle skill segments
    if (segment.isSkill && segment.skill) {
      // First currency after Swap is the FROM currency
      if (segment.skill.category === "currency" && !fromCurrency) {
        fromCurrency = segment.skill.label;
        continue;
      }

      // After FROM currency, look for amount in skill (e.g., "10 SOL")
      if (!swapAmount && segment.skill.category === "amount") {
        const match = segment.text.match(SWAP_AMOUNT_PATTERN);
        if (match) {
          const [, amount] = match;
          swapAmount = amount;
          continue;
        }
      }

      // After amount, next currency is the TO currency
      if (
        segment.skill.category === "currency" &&
        fromCurrency &&
        swapAmount &&
        !toCurrency
      ) {
        toCurrency = segment.skill.label;
      }
    } else if (!segment.isSkill && fromCurrency && !swapAmount) {
      // Handle plain text segments - look for amount after FROM currency
      const trimmed = segment.text.trim();
      const numMatch = trimmed.match(/^(\d+(?:\.\d+)?)$/);
      if (numMatch) {
        swapAmount = numMatch[1];
      }
    }
  }

  // Return only if we have all three components
  if (fromCurrency && swapAmount && toCurrency) {
    return {
      amount: swapAmount,
      fromCurrency,
      toCurrency,
    };
  }

  return null;
};
