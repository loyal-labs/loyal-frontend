"use client";

import { Repeat2, Send, XIcon } from "lucide-react";
import * as React from "react";

import { SkillDropdown } from "@/components/ai-elements/skill-dropdown";
import { useWalletBalances } from "@/hooks/use-wallet-balances";
import { cn } from "@/lib/utils";
import { AVAILABLE_SKILLS, type LoyalSkill } from "@/types/skills";

type SkillsInputProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange"
> & {
  value: LoyalSkill[];
  onChange: (skills: LoyalSkill[]) => void;
  onPendingTextChange?: (text: string) => void;
  onSwapFlowChange?: (data: {
    isActive: boolean;
    isComplete: boolean;
    swapData: {
      fromCurrency: string | null;
      amount: string | null;
      toCurrency: string | null;
    };
  }) => void;
  onSwapComplete?: (data: {
    amount: string;
    fromCurrency: string;
    fromCurrencyMint: string | null;
    fromCurrencyDecimals: number | null;
    toCurrency: string;
    toCurrencyMint: string | null;
    toCurrencyDecimals: number | null;
  }) => void;
  onSendFlowChange?: (data: {
    isActive: boolean;
    isComplete: boolean;
    sendData: {
      currency: string | null;
      currencyMint: string | null;
      currencyDecimals: number | null;
      amount: string | null;
      walletAddress: string | null;
      destinationType: "wallet" | "telegram" | null;
    };
  }) => void;
  onSendComplete?: (data: {
    currency: string;
    currencyMint: string | null;
    currencyDecimals: number | null;
    amount: string;
    walletAddress: string;
    destinationType: "wallet" | "telegram";
  }) => void;
  onNlpStateChange?: (state: {
    isActive: boolean;
    intent: "send" | "swap" | null;
    parsedData: {
      amount: string | null;
      partialAmount: boolean;
      currency: string | null;
      partialCurrency: boolean;
      currencyMint: string | null;
      currencyDecimals: number | null;
      walletAddress: string | null;
      partialRecipient: boolean;
      recipientHintType: "wallet" | "telegram" | null;
      destinationType: "wallet" | "telegram" | null;
      toCurrency: string | null;
      toCurrencyMint: string | null;
      toCurrencyDecimals: number | null;
    };
  }) => void;
};

export type SkillsInputRef = HTMLTextAreaElement & {
  addSkill: (skill: LoyalSkill) => void;
  resetAndAddSkill: (skill: LoyalSkill) => void;
  clear: () => void;
  activateNlpMode: (initialText?: string) => void;
  setText: (text: string) => void;
};

const ACTION_SKILLS = AVAILABLE_SKILLS.filter((s) => s.category === "action");
const RECIPIENT_SKILLS = AVAILABLE_SKILLS.filter(
  (s) => s.category === "recipient"
);
// Hardcoded list of common "to" tokens for swap (user may not have these in wallet)
const SWAP_TARGET_TOKENS: LoyalSkill[] = [
  {
    id: "currency-sol",
    label: "SOL",
    category: "currency",
    mint: "So11111111111111111111111111111111111111112",
    decimals: 9,
  },
  {
    id: "currency-usdc",
    label: "USDC",
    category: "currency",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
  },
  {
    id: "currency-usdt",
    label: "USDT",
    category: "currency",
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    decimals: 6,
  },
  {
    id: "currency-loyal",
    label: "LOYAL",
    category: "currency",
    mint: "LYLikzBQtpa9ZgVrJsqYGQpR3cC1WMJrBHaXGrQmeta",
    decimals: 6,
  },
];

// Solana address validation regex (base58, 32-44 characters)
const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

// Characters NOT allowed in base58 (if present, input cannot be a Solana address)
// Excluded: 0, I, O, l
const NON_BASE58_CHARS_REGEX = /[0IOl]/;

// Partial base58 pattern - could be start of a Solana address
const PARTIAL_BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]+$/;

// Telegram username validation regex (5-32 chars, alphanumeric + underscore, must start with letter)
// REQUIRES @ prefix to distinguish from token tickers like "USDT"
const TELEGRAM_USERNAME_REGEX = /^@[a-zA-Z][a-zA-Z0-9_]{4,31}$/;

// Partial telegram username regex - starts with @ but not yet valid
// Matches: "@" alone, "@a", "@ab", "@abc", "@abcd" (less than 5 chars after @)
const PARTIAL_TELEGRAM_REGEX = /^@([a-zA-Z][a-zA-Z0-9_]{0,3})?$/;

// Strict numeric format regex - allows integers and decimals like 123, 123.45
const NUMERIC_FORMAT_REGEX = /^\d+(\.\d+)?$/;

// Pattern to detect partial amount input (e.g., "0" or "0." without complete decimal)
const PARTIAL_AMOUNT_REGEX = /\b\d+\.?$/;

// Maximum allowed amount (using a reasonable business limit)
const MAX_AMOUNT = Number.MAX_SAFE_INTEGER;

/**
 * Validates numeric input for amount fields
 * @param input - The raw input string
 * @returns Object with isValid boolean and error message if invalid, or parsed number if valid
 */
const validateAmountInput = (
  input: string
): { isValid: true; value: number } | { isValid: false; error: string } => {
  const trimmedInput = input.trim();

  // Check for empty input
  if (!trimmedInput) {
    return { isValid: false, error: "Amount cannot be empty" };
  }

  // Check strict numeric format
  if (!NUMERIC_FORMAT_REGEX.test(trimmedInput)) {
    return {
      isValid: false,
      error: "Amount must be a valid number (e.g., 10 or 10.5)",
    };
  }

  // Parse the number
  const parsedAmount = Number.parseFloat(trimmedInput);

  // Check for NaN
  if (Number.isNaN(parsedAmount)) {
    return { isValid: false, error: "Amount must be a valid number" };
  }

  // Check for non-positive values
  if (parsedAmount <= 0) {
    return { isValid: false, error: "Amount must be greater than 0" };
  }

  // Check for excessive values
  if (parsedAmount > MAX_AMOUNT) {
    return {
      isValid: false,
      error: `Amount cannot exceed ${MAX_AMOUNT.toExponential(2)}`,
    };
  }

  return { isValid: true, value: parsedAmount };
};

const SkillsInput = React.forwardRef<HTMLTextAreaElement, SkillsInputProps>(
  (
    {
      className,
      value,
      onChange,
      onPendingTextChange,
      onSwapFlowChange,
      onSwapComplete,
      onSendFlowChange,
      onSendComplete,
      onNlpStateChange,
      ...props
    },
    ref
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [selectedSkillIndex, setSelectedSkillIndex] = React.useState(0);
    const [filteredSkills, setFilteredSkills] =
      React.useState<LoyalSkill[]>(ACTION_SKILLS);
    const [pendingInput, setPendingInput] = React.useState("");
    const [shouldSubmitForm, setShouldSubmitForm] = React.useState(false);
    const [dropdownPosition, setDropdownPosition] = React.useState({
      top: 0,
      left: 0,
    });

    // Fetch wallet balances to show only available currencies
    const { balances } = useWalletBalances();

    // Create currency skills from actual wallet balances
    const CURRENCY_SKILLS = React.useMemo(
      () =>
        balances.map((balance) => ({
          id: `currency-${balance.symbol.toLowerCase()}`,
          label: balance.symbol,
          category: "currency" as const,
          mint: balance.mint,
          decimals: balance.decimals,
        })),
      [balances]
    );

    // Swap flow state
    const [swapStep, setSwapStep] = React.useState<
      null | "from_currency" | "amount" | "to_currency"
    >(null);
    const [swapData, setSwapData] = React.useState<{
      fromCurrency: string | null;
      fromCurrencyMint: string | null;
      fromCurrencyDecimals: number | null;
      amount: string | null;
      toCurrency: string | null;
      toCurrencyMint: string | null;
      toCurrencyDecimals: number | null;
    }>({
      fromCurrency: null,
      fromCurrencyMint: null,
      fromCurrencyDecimals: null,
      amount: null,
      toCurrency: null,
      toCurrencyMint: null,
      toCurrencyDecimals: null,
    });

    // Send flow state
    const [sendStep, setSendStep] = React.useState<
      null | "currency" | "amount" | "wallet_address"
    >(null);
    const [sendData, setSendData] = React.useState<{
      currency: string | null;
      currencyMint: string | null;
      currencyDecimals: number | null;
      amount: string | null;
      walletAddress: string | null;
      destinationType: "wallet" | "telegram" | null;
    }>({
      currency: null,
      currencyMint: null,
      currencyDecimals: null,
      amount: null,
      walletAddress: null,
      destinationType: null,
    });
    const [walletAddressError, setWalletAddressError] = React.useState<
      string | null
    >(null);
    const [amountError, setAmountError] = React.useState<string | null>(null);

    // NLP Mode State
    const [isNlpMode, setIsNlpMode] = React.useState(false);
    const [nlpParsedData, setNlpParsedData] = React.useState<{
      amount: string | null;
      partialAmount: boolean;
      currency: string | null;
      partialCurrency: boolean;
      currencyMint: string | null;
      currencyDecimals: number | null;
      walletAddress: string | null;
      partialRecipient: boolean;
      recipientHintType: "wallet" | "telegram" | null;
      destinationType: "wallet" | "telegram" | null;
      toCurrency: string | null;
      toCurrencyMint: string | null;
      toCurrencyDecimals: number | null;
    }>({
      amount: null,
      partialAmount: false,
      currency: null,
      partialCurrency: false,
      currencyMint: null,
      currencyDecimals: null,
      walletAddress: null,
      partialRecipient: false,
      recipientHintType: null,
      destinationType: null,
      toCurrency: null,
      toCurrencyMint: null,
      toCurrencyDecimals: null,
    });
    const [nlpIntent, setNlpIntent] = React.useState<"send" | "swap" | null>(
      null
    );

    const hasSwapSkill = value.some((skill) => skill.id === "swap");
    const hasSendSkill = value.some((skill) => skill.id === "send");

    // Solana address validator
    const isValidSolanaAddress = (address: string): boolean =>
      SOLANA_ADDRESS_REGEX.test(address);

    // Telegram username validator (strips optional @ prefix)
    const isValidTelegramUsername = (input: string): boolean =>
      TELEGRAM_USERNAME_REGEX.test(input);

    // Normalize telegram username (remove @ prefix if present)
    const normalizeTelegramUsername = (input: string): string =>
      input.startsWith("@") ? input.slice(1) : input;

    // Auto-resize textarea on mount and when pendingInput or placeholder changes
    React.useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [pendingInput, sendStep, swapStep]);

    // Submit surrounding form once send flow completes
    React.useEffect(() => {
      if (!shouldSubmitForm) {
        return;
      }
      const form = textareaRef.current?.closest("form");
      if (form) {
        form.requestSubmit();
      }
      setShouldSubmitForm(false);
    }, [shouldSubmitForm]);

    // Expose clear and addSkill methods to parent while maintaining textarea element methods
    React.useImperativeHandle(ref, () => {
      const textarea = textareaRef.current!;
      return new Proxy(textarea, {
        get(target, prop) {
          if (prop === "clear") {
            return () => {
              setPendingInput("");
              setSwapStep(null);
              setSwapData({
                fromCurrency: null,
                fromCurrencyMint: null,
                fromCurrencyDecimals: null,
                amount: null,
                toCurrency: null,
                toCurrencyMint: null,
                toCurrencyDecimals: null,
              });
              setSendStep(null);
              setSendData({
                currency: null,
                currencyMint: null,
                currencyDecimals: null,
                amount: null,
                walletAddress: null,
                destinationType: null,
              });
              setIsDropdownOpen(false);

              // Clear error states
              setWalletAddressError(null);
              setAmountError(null);

              // Reset NLP state
              setIsNlpMode(false);
              setNlpParsedData({
                amount: null,
                partialAmount: false,
                currency: null,
                partialCurrency: false,
                currencyMint: null,
                currencyDecimals: null,
                walletAddress: null,
                partialRecipient: false,
                recipientHintType: null,
                destinationType: null,
                toCurrency: null,
                toCurrencyMint: null,
                toCurrencyDecimals: null,
              });
              onNlpStateChange?.({
                isActive: false,
                intent: null,
                parsedData: {
                  amount: null,
                  partialAmount: false,
                  currency: null,
                  partialCurrency: false,
                  currencyMint: null,
                  currencyDecimals: null,
                  walletAddress: null,
                  partialRecipient: false,
                  recipientHintType: null,
                  destinationType: null,
                  toCurrency: null,
                  toCurrencyMint: null,
                  toCurrencyDecimals: null,
                },
              });
            };
          }
          if (prop === "addSkill") {
            return (skill: LoyalSkill) => {
              addSkill(skill);
            };
          }
          if (prop === "resetAndAddSkill") {
            return (skill: LoyalSkill) => {
              // Clear all state
              setPendingInput("");
              setSwapStep(null);
              setSwapData({
                fromCurrency: null,
                fromCurrencyMint: null,
                fromCurrencyDecimals: null,
                amount: null,
                toCurrency: null,
                toCurrencyMint: null,
                toCurrencyDecimals: null,
              });
              setSendStep(null);
              setSendData({
                currency: null,
                currencyMint: null,
                currencyDecimals: null,
                amount: null,
                walletAddress: null,
                destinationType: null,
              });
              setIsDropdownOpen(false);
              setAmountError(null);
              setWalletAddressError(null);

              // Reset NLP state
              setIsNlpMode(false);
              setNlpParsedData({
                amount: null,
                partialAmount: false,
                currency: null,
                partialCurrency: false,
                currencyMint: null,
                currencyDecimals: null,
                walletAddress: null,
                partialRecipient: false,
                recipientHintType: null,
                destinationType: null,
                toCurrency: null,
                toCurrencyMint: null,
                toCurrencyDecimals: null,
              });
              onNlpStateChange?.({
                isActive: false,
                intent: null,
                parsedData: {
                  amount: null,
                  partialAmount: false,
                  currency: null,
                  partialCurrency: false,
                  currencyMint: null,
                  currencyDecimals: null,
                  walletAddress: null,
                  partialRecipient: false,
                  recipientHintType: null,
                  destinationType: null,
                  toCurrency: null,
                  toCurrencyMint: null,
                  toCurrencyDecimals: null,
                },
              });

              // Add the new skill and set flow state
              if (skill.id === "swap") {
                onChange([skill]);
                setSwapStep("from_currency");
                setFilteredSkills(CURRENCY_SKILLS);
                setIsDropdownOpen(CURRENCY_SKILLS.length > 0);
                setSelectedSkillIndex(0);
                calculateDropdownPosition();
              } else if (skill.id === "send") {
                onChange([skill]);
                setSendStep("currency");
                setFilteredSkills(CURRENCY_SKILLS);
                setIsDropdownOpen(CURRENCY_SKILLS.length > 0);
                setSelectedSkillIndex(0);
                calculateDropdownPosition();
              } else {
                onChange([skill]);
              }
            };
          }
          if (prop === "activateNlpMode") {
            return (initialText = "send ") => {
              setPendingInput(initialText);
              setIsNlpMode(true);

              // Immediately notify parent
              onNlpStateChange?.({
                isActive: true,
                intent: initialText.trim().toLowerCase().startsWith("swap")
                  ? "swap"
                  : "send",
                parsedData: {
                  amount: null,
                  partialAmount: false,
                  currency: null,
                  partialCurrency: false,
                  currencyMint: null,
                  currencyDecimals: null,
                  walletAddress: null,
                  partialRecipient: false,
                  recipientHintType: null,
                  destinationType: null,
                  toCurrency: null,
                  toCurrencyMint: null,
                  toCurrencyDecimals: null,
                },
              });

              // Focus the textarea
              setTimeout(() => {
                textarea.focus();
                // Move cursor to end
                textarea.setSelectionRange(
                  initialText.length,
                  initialText.length
                );
              }, 0);
            };
          }
          if (prop === "setText") {
            return (text: string) => {
              setPendingInput(text);
              // Focus and move cursor to end
              setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(text.length, text.length);
              }, 0);
            };
          }
          const value = target[prop as keyof HTMLTextAreaElement];
          return typeof value === "function" ? value.bind(target) : value;
        },
        has(target, prop) {
          if (
            prop === "clear" ||
            prop === "addSkill" ||
            prop === "resetAndAddSkill" ||
            prop === "activateNlpMode" ||
            prop === "setText"
          ) {
            return true;
          }
          return prop in target;
        },
      });
    });

    const calculateDropdownPosition = () => {
      if (containerRef.current && textareaRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        // Position is RELATIVE to the input element
        // We want dropdown below the container, so use container height as top
        setDropdownPosition({
          top: containerRect.height,
          left: 0,
        });
      }
    };

    // Fix dropdown positioning after render
    React.useLayoutEffect(() => {
      if (isDropdownOpen) {
        calculateDropdownPosition();
      }
    }, [isDropdownOpen]);

    // Notify parent of pending text changes
    React.useEffect(() => {
      onPendingTextChange?.(pendingInput);
    }, [pendingInput, onPendingTextChange]);

    // Notify parent of swap flow state changes
    React.useEffect(() => {
      const isActive = swapStep !== null;
      const isComplete =
        hasSwapSkill &&
        swapData.fromCurrency !== null &&
        swapData.amount !== null &&
        swapData.toCurrency !== null;

      onSwapFlowChange?.({
        isActive,
        isComplete,
        swapData,
      });
    }, [swapStep, swapData, hasSwapSkill, onSwapFlowChange]);

    // Notify parent of send flow state changes
    React.useEffect(() => {
      const isActive = sendStep !== null;
      const isComplete =
        hasSendSkill &&
        sendData.currency !== null &&
        sendData.amount !== null &&
        sendData.walletAddress !== null;

      onSendFlowChange?.({
        isActive,
        isComplete,
        sendData,
      });
    }, [sendStep, sendData, hasSendSkill, onSendFlowChange]);

    // NLP Parsing Effect
    React.useEffect(() => {
      if (!isNlpMode) return;

      const lowerInput = pendingInput.toLowerCase();
      const isSwap = lowerInput.startsWith("swap");

      // Remove prefix from BOTH lower and original input
      // We need original input for wallet addresses (case sensitive)
      const textLower = lowerInput.replace(/^(send|swap)\s*/i, "");
      const textOriginal = pendingInput.replace(/^(send|swap)\s*/i, "");

      let amount: string | null = null;
      let partialAmount = false;
      let currency: string | null = null;
      let currencyMint: string | null = null;
      let currencyDecimals: number | null = null;
      let walletAddress: string | null = null;
      let destinationType: "wallet" | "telegram" | null = null;
      let toCurrency: string | null = null;
      let toCurrencyMint: string | null = null;
      let toCurrencyDecimals: number | null = null;

      // 1. Find Amount (look for standalone numbers)
      const amountMatch = textLower.match(/\b\d+(\.\d+)?\b/);
      if (amountMatch) {
        const val = validateAmountInput(amountMatch[0]);
        if (val.isValid) {
          amount = amountMatch[0];
        }
      }

      // Detect partial amount (number without complete decimal, e.g., "0" or "0.")
      // Only show hint when no complete amount found yet
      if (!amount && PARTIAL_AMOUNT_REGEX.test(textLower)) {
        partialAmount = true;
      }

      // 2. Find Currency (From Token) - from wallet tokens
      // We look for known currency symbols in the text
      // For swap, we need to be careful not to match the "to" token as the "from" token
      // A simple heuristic: the first token found is likely the "from" token
      const foundTokens: { skill: LoyalSkill; index: number }[] = [];
      let partialCurrency = false;

      for (const skill of CURRENCY_SKILLS) {
        const match = new RegExp(`\\b${skill.label}\\b`, "i").exec(textLower);
        if (match) {
          foundTokens.push({ skill, index: match.index });
        }
      }

      // Sort by position in text
      foundTokens.sort((a, b) => a.index - b.index);

      // Check for partial currency match (word that could become a token ticker)
      if (foundTokens.length === 0) {
        const words = textLower.split(/\s+/).filter((w) => w.length > 0);
        for (const word of words) {
          // Skip if it's a number (amount)
          if (/^\d+\.?\d*$/.test(word)) continue;
          // Skip if it starts with @ (telegram handle)
          if (word.startsWith("@")) continue;

          // Check if this word is a partial match for any known token
          const isPartialTokenMatch = CURRENCY_SKILLS.some((skill) =>
            skill.label.toLowerCase().startsWith(word.toLowerCase())
          );

          if (isPartialTokenMatch) {
            // If word contains non-base58 chars (O, I, 0, l), it's definitely a currency hint
            // If word is pure base58, it could be either currency or address
            const hasNonBase58 = NON_BASE58_CHARS_REGEX.test(word);
            if (hasNonBase58 || word.length < 3) {
              // Definitely currency (contains O/I/0/l or too short for address)
              partialCurrency = true;
            } else {
              // Could be either - show currency hint
              partialCurrency = true;
            }
          }
        }
      }

      if (foundTokens.length > 0) {
        const fromToken = foundTokens[0].skill;
        currency = fromToken.label;
        currencyMint = fromToken.mint || null;
        currencyDecimals = fromToken.decimals || null;

        // If swap, look for second token or "to [token]" pattern
        // Check both wallet tokens (CURRENCY_SKILLS) and hardcoded swap targets (SWAP_TARGET_TOKENS)
        if (isSwap) {
          // Combine wallet tokens and swap target tokens for "to" token matching
          const allToTokens = [...CURRENCY_SKILLS, ...SWAP_TARGET_TOKENS];

          // Check for "to [token]" pattern first
          const toMatch = textLower.match(/\bto\s+([a-z0-9]+)\b/i);
          if (toMatch) {
            const potentialToToken = toMatch[1];
            // Ensure it's not the same as fromToken
            if (
              potentialToToken.toLowerCase() !== fromToken.label.toLowerCase()
            ) {
              const matchedSkill = allToTokens.find(
                (s) => s.label.toLowerCase() === potentialToToken.toLowerCase()
              );
              if (matchedSkill) {
                toCurrency = matchedSkill.label;
                toCurrencyMint = matchedSkill.mint || null;
                toCurrencyDecimals = matchedSkill.decimals || null;
              }
            }
          }

          // If not found via "to", look for any swap target token in the text
          if (!toCurrency) {
            // First check swap target tokens (they might not be in wallet)
            for (const skill of SWAP_TARGET_TOKENS) {
              if (skill.label.toLowerCase() === fromToken.label.toLowerCase()) {
                continue; // Skip if it's the same as from token
              }
              const match = new RegExp(`\\b${skill.label}\\b`, "i").exec(
                textLower
              );
              if (match && match.index > (foundTokens[0]?.index ?? 0)) {
                // Only match if it appears after the from token
                toCurrency = skill.label;
                toCurrencyMint = skill.mint || null;
                toCurrencyDecimals = skill.decimals || null;
                break;
              }
            }
          }

          // If still not found, check wallet tokens as fallback
          if (!toCurrency && foundTokens.length > 1) {
            // Find the first token that is NOT the fromToken
            const toTokenEntry = foundTokens.find(
              (t) =>
                t.skill.label.toLowerCase() !== fromToken.label.toLowerCase()
            );
            if (toTokenEntry) {
              const toToken = toTokenEntry.skill;
              toCurrency = toToken.label;
              toCurrencyMint = toToken.mint || null;
              toCurrencyDecimals = toToken.decimals || null;
            }
          }
        }
      }

      // 3. Find Wallet Address or Telegram Username (only for send)
      let partialRecipient = false;
      let recipientHintType: "wallet" | "telegram" | null = null;
      if (!isSwap) {
        const words = textOriginal.split(/\s+/);
        for (const word of words) {
          // Check for wallet address first
          if (isValidSolanaAddress(word)) {
            walletAddress = word;
            destinationType = "wallet";
            break;
          }
          // Check for telegram username (with or without @)
          if (isValidTelegramUsername(word)) {
            walletAddress = normalizeTelegramUsername(word);
            destinationType = "telegram";
            break;
          }
          // Check for partial telegram handle (@ followed by some chars but not yet valid)
          if (!walletAddress && PARTIAL_TELEGRAM_REGEX.test(word)) {
            partialRecipient = true;
            recipientHintType = "telegram";
          }
          // Check for partial wallet address (base58 chars, could become an address)
          // Show hint if word is pure base58 (no O/I/0/l) and at least 2 chars
          if (
            !(walletAddress || partialRecipient) &&
            word.length >= 2 &&
            PARTIAL_BASE58_REGEX.test(word) &&
            !NON_BASE58_CHARS_REGEX.test(word)
          ) {
            // This could be a partial wallet address
            partialRecipient = true;
            recipientHintType = "wallet";
          }
        }
      }

      const newData = {
        amount,
        partialAmount,
        currency,
        partialCurrency,
        currencyMint,
        currencyDecimals,
        walletAddress,
        partialRecipient,
        recipientHintType,
        destinationType,
        toCurrency,
        toCurrencyMint,
        toCurrencyDecimals,
      };

      // Only update if data changed to avoid infinite loops
      if (JSON.stringify(newData) !== JSON.stringify(nlpParsedData)) {
        setNlpParsedData(newData);
        onNlpStateChange?.({
          isActive: true,
          intent: isSwap ? "swap" : "send",
          parsedData: newData,
        });
      }
    }, [
      pendingInput,
      isNlpMode,
      CURRENCY_SKILLS,
      onNlpStateChange,
      nlpParsedData,
    ]);

    const addSkill = (skill: LoyalSkill) => {
      // Handle swap flow
      if (skill.id === "swap") {
        // Add Swap skill to the skills array
        const newSkills = [...value, skill];
        onChange(newSkills);
        setSwapStep("from_currency");
        setFilteredSkills(CURRENCY_SKILLS);
        // Only open dropdown if there are currencies available
        setIsDropdownOpen(CURRENCY_SKILLS.length > 0);
        setSelectedSkillIndex(0);
        calculateDropdownPosition();
      } else if (
        swapStep === "from_currency" &&
        skill.category === "currency"
      ) {
        // Store currency in swapData, DON'T add to skills array
        setSwapData({
          fromCurrency: skill.label,
          fromCurrencyMint: skill.mint ?? null,
          fromCurrencyDecimals: skill.decimals ?? null,
          amount: null,
          toCurrency: null,
          toCurrencyMint: null,
          toCurrencyDecimals: null,
        });
        setSwapStep("amount");
        setIsDropdownOpen(false);
        setPendingInput("");
      } else if (swapStep === "to_currency" && skill.category === "currency") {
        // Store currency in swapData, DON'T add to skills array
        const completedSwap = {
          fromCurrency: swapData.fromCurrency!,
          fromCurrencyMint: swapData.fromCurrencyMint,
          fromCurrencyDecimals: swapData.fromCurrencyDecimals,
          amount: swapData.amount!,
          toCurrency: skill.label,
          toCurrencyMint: skill.mint ?? null,
          toCurrencyDecimals: skill.decimals ?? null,
        };
        setSwapData({
          fromCurrency: swapData.fromCurrency,
          fromCurrencyMint: swapData.fromCurrencyMint,
          fromCurrencyDecimals: swapData.fromCurrencyDecimals,
          amount: swapData.amount,
          toCurrency: skill.label,
          toCurrencyMint: skill.mint ?? null,
          toCurrencyDecimals: skill.decimals ?? null,
        });
        setSwapStep(null);
        setIsDropdownOpen(false);
        setPendingInput("");
        onSwapComplete?.(completedSwap);
      } else if (skill.id === "send") {
        // Handle send flow - Add Send skill to the skills array
        const newSkills = [...value, skill];
        onChange(newSkills);
        setSendStep("currency");
        setFilteredSkills(CURRENCY_SKILLS);
        // Only open dropdown if there are currencies available
        setIsDropdownOpen(CURRENCY_SKILLS.length > 0);
        setSelectedSkillIndex(0);
        calculateDropdownPosition();
      } else if (sendStep === "currency" && skill.category === "currency") {
        // Store currency in sendData, DON'T add to skills array
        setSendData({
          ...sendData,
          currency: skill.label,
          currencyMint: skill.mint ?? null,
          currencyDecimals: skill.decimals ?? null,
        });
        setSendStep("amount");
        setIsDropdownOpen(false);
        setPendingInput("");
      }
      // DISABLED: Recipient dropdown selection
      // else if (sendStep === "recipient" && skill.category === "recipient") {
      //   setSendData({
      //     currency: sendData.currency,
      //     amount: sendData.amount,
      //     walletAddress: skill.label,
      //   });
      //   setSendStep(null);
      //   setIsDropdownOpen(false);
      //   setPendingInput("");
      // }
      else {
        // Regular skill (not part of swap or send flow) - add to array
        const newSkills = [...value, skill];
        onChange(newSkills);
        setIsDropdownOpen(false);
        setPendingInput("");
      }
    };

    const removeSkill = (skillToRemove: LoyalSkill) => {
      const newSkills = value.filter((s) => s.id !== skillToRemove.id);
      onChange(newSkills);

      // Reset swap flow if Swap skill is removed
      if (skillToRemove.id === "swap") {
        setSwapStep(null);
        setSwapData({
          fromCurrency: null,
          fromCurrencyMint: null,
          fromCurrencyDecimals: null,
          amount: null,
          toCurrency: null,
          toCurrencyMint: null,
          toCurrencyDecimals: null,
        });
        setIsDropdownOpen(false);
      }

      // Reset send flow if Send skill is removed
      if (skillToRemove.id === "send") {
        setSendStep(null);
        setSendData({
          currency: null,
          currencyMint: null,
          currencyDecimals: null,
          amount: null,
          walletAddress: null,
          destinationType: null,
        });
        setWalletAddressError(null);
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Allow Shift+Enter to create new lines
      if (e.key === "Enter" && e.shiftKey) {
        return; // Let default behavior create new line
      }

      // Handle NLP Mode Enter
      if (isNlpMode && e.key === "Enter") {
        e.preventDefault();

        // Handle Send
        if (
          nlpParsedData.amount &&
          nlpParsedData.currency &&
          nlpParsedData.walletAddress &&
          nlpParsedData.destinationType
        ) {
          // Validate SOL-only for telegram
          if (
            nlpParsedData.destinationType === "telegram" &&
            nlpParsedData.currency.toUpperCase() !== "SOL"
          ) {
            setWalletAddressError(
              "Only SOL can be sent to Telegram usernames."
            );
            return;
          }

          const completedSend = {
            currency: nlpParsedData.currency,
            currencyMint: nlpParsedData.currencyMint,
            currencyDecimals: nlpParsedData.currencyDecimals,
            amount: nlpParsedData.amount,
            walletAddress: nlpParsedData.walletAddress,
            destinationType: nlpParsedData.destinationType,
          };
          onSendComplete?.(completedSend);
          setShouldSubmitForm(true);
          // State reset will happen via parent calling clear() after submission
          return;
        }

        // Handle Swap
        if (
          nlpParsedData.amount &&
          nlpParsedData.currency &&
          nlpParsedData.toCurrency
        ) {
          const completedSwap = {
            fromCurrency: nlpParsedData.currency,
            fromCurrencyMint: nlpParsedData.currencyMint,
            fromCurrencyDecimals: nlpParsedData.currencyDecimals,
            amount: nlpParsedData.amount,
            toCurrency: nlpParsedData.toCurrency,
            toCurrencyMint: nlpParsedData.toCurrencyMint,
            toCurrencyDecimals: nlpParsedData.toCurrencyDecimals,
          };
          // We need an onSwapComplete prop or similar, but for now we can just rely on pendingSwapDataRef
          // which is updated via onSwapChange if we had one, but here we don't have a direct callback for completion
          // equivalent to onSendComplete.
          // However, page.tsx reads from nlpState directly in handleSubmit, so we just need to trigger submit.

          // We should ensure the parent knows about the swap data.
          // The parent reads nlpState, which is already up to date.

          setShouldSubmitForm(true);
          // State reset will happen via parent calling clear() after submission
          return;
        }

        return;
      }

      // Handle amount input during swap
      if (swapStep === "amount") {
        // Prevent default Enter behavior (new line) for swap amount entry
        if (e.key === "Enter") {
          e.preventDefault();
        }
        if (e.key === "Enter" && pendingInput.trim()) {
          const validation = validateAmountInput(pendingInput);

          if (!validation.isValid) {
            // Show error and prevent submission
            setAmountError(validation.error);
            return;
          }

          // Clear any previous error
          setAmountError(null);

          // Proceed with valid amount
          setSwapData({ ...swapData, amount: pendingInput.trim() });
          setSwapStep("to_currency");
          setPendingInput("");
          // Allow swapping TO Bonk or Loyal tokens
          setFilteredSkills(SWAP_TARGET_TOKENS);
          setIsDropdownOpen(SWAP_TARGET_TOKENS.length > 0);
          setSelectedSkillIndex(0);
          calculateDropdownPosition();
        } else if (e.key === "Backspace" && pendingInput.length === 0) {
          // If input is empty and user presses backspace, go back to FROM currency
          e.preventDefault();
          setSwapData({
            fromCurrency: null,
            fromCurrencyMint: null,
            fromCurrencyDecimals: null,
            amount: null,
            toCurrency: null,
            toCurrencyMint: null,
            toCurrencyDecimals: null,
          });
          setSwapStep("from_currency");
          setFilteredSkills(CURRENCY_SKILLS);
          setIsDropdownOpen(CURRENCY_SKILLS.length > 0);
          setSelectedSkillIndex(0);
          calculateDropdownPosition();
        }
        return;
      }

      // Handle amount input during send
      if (sendStep === "amount") {
        // Prevent default Enter behavior (new line) for send amount entry
        if (e.key === "Enter") {
          e.preventDefault();
        }
        if (e.key === "Enter" && pendingInput.trim()) {
          const validation = validateAmountInput(pendingInput);

          if (!validation.isValid) {
            // Show error and prevent submission
            setAmountError(validation.error);
            return;
          }

          // Clear any previous error
          setAmountError(null);

          // Proceed with valid amount
          setSendData({ ...sendData, amount: pendingInput.trim() });
          setSendStep("wallet_address");
          setPendingInput("");
        } else if (e.key === "Backspace" && pendingInput.length === 0) {
          // If input is empty and user presses backspace, go back to currency selection
          e.preventDefault();
          setSendData({
            currency: null,
            currencyMint: null,
            currencyDecimals: null,
            amount: null,
            walletAddress: null,
            destinationType: null,
          });
          setSendStep("currency");
          setWalletAddressError(null);
          setFilteredSkills(CURRENCY_SKILLS);
          setIsDropdownOpen(CURRENCY_SKILLS.length > 0);
          setSelectedSkillIndex(0);
          calculateDropdownPosition();
        }
        return;
      }

      // Handle wallet address or telegram username input during send
      if (sendStep === "wallet_address") {
        // Prevent default Enter behavior (new line) for wallet address entry
        if (e.key === "Enter") {
          e.preventDefault();
        }
        if (e.key === "Enter" && pendingInput.trim()) {
          const input = pendingInput.trim();

          // Determine destination type
          let recipient: string;
          let destType: "wallet" | "telegram";

          if (isValidSolanaAddress(input)) {
            recipient = input;
            destType = "wallet";
          } else if (isValidTelegramUsername(input)) {
            recipient = normalizeTelegramUsername(input);
            destType = "telegram";

            // Validate SOL-only for telegram
            if (sendData.currency?.toUpperCase() !== "SOL") {
              setWalletAddressError(
                "Only SOL can be sent to Telegram usernames."
              );
              return;
            }
          } else {
            setWalletAddressError(
              "Invalid recipient. Enter a Solana address (32-44 chars) or @username for Telegram."
            );
            return;
          }

          // Clear any previous error
          setWalletAddressError(null);

          const completedSend = {
            currency: sendData.currency!,
            currencyMint: sendData.currencyMint,
            currencyDecimals: sendData.currencyDecimals,
            amount: sendData.amount!,
            walletAddress: recipient,
            destinationType: destType,
          };
          setSendData({
            ...sendData,
            walletAddress: recipient,
            destinationType: destType,
          });
          setSendStep(null);
          setPendingInput("");
          // Notify parent that Send is complete
          onSendComplete?.(completedSend);
          setShouldSubmitForm(true);
        } else if (e.key === "Backspace" && pendingInput.length === 0) {
          // If input is empty and user presses backspace, go back to amount
          e.preventDefault();
          setSendData({
            ...sendData,
            amount: null,
            walletAddress: null,
            destinationType: null,
          });
          setSendStep("amount");
          setPendingInput("");
          setWalletAddressError(null);
        }
        return;
      }

      // Handle dropdown navigation
      if (isDropdownOpen) {
        if (e.key === "Tab" || e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          if (filteredSkills.length > 0) {
            addSkill(filteredSkills[selectedSkillIndex]);
            // Refocus input after selection
            setTimeout(() => {
              textareaRef.current?.focus();
            }, 0);
          }
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setIsDropdownOpen(false);
          setPendingInput("");
        } else if (e.key === "Backspace" && pendingInput.length === 0) {
          // Close dropdown and trigger pill removal
          e.preventDefault();
          setIsDropdownOpen(false);
          // Don't return - fall through to pill removal logic below
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedSkillIndex((prev) =>
            prev < filteredSkills.length - 1 ? prev + 1 : prev
          );
          return;
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedSkillIndex((prev) => (prev > 0 ? prev - 1 : prev));
          return;
        } else {
          return;
        }
      }

      // Handle regular Enter press to submit form (let default form submit happen)
      if (e.key === "Enter") {
        e.preventDefault();
        // Let the form handle submission by finding and submitting parent form
        const form = e.currentTarget.closest("form");
        if (form) {
          form.requestSubmit();
        }
        return;
      }

      // Handle slash to open skill dropdown
      if (e.key === "/" && !pendingInput) {
        e.preventDefault();
        setFilteredSkills(ACTION_SKILLS);
        setIsDropdownOpen(true);
        setSelectedSkillIndex(0);
        calculateDropdownPosition();
      } else if (e.key === "@" && !pendingInput) {
        e.preventDefault();
        setFilteredSkills(RECIPIENT_SKILLS);
        setIsDropdownOpen(true);
        setSelectedSkillIndex(0);
        calculateDropdownPosition();
        setPendingInput("@");
      } else if (e.key === "Backspace" && pendingInput.length === 0) {
        e.preventDefault();

        // Handle send data removal in reverse order
        if (sendData.walletAddress) {
          // Remove wallet address and destination type
          setSendData({
            ...sendData,
            walletAddress: null,
            destinationType: null,
          });
          setSendStep("wallet_address");
          setPendingInput("");
        } else if (sendData.amount) {
          // Remove amount
          setSendData({
            ...sendData,
            amount: null,
            walletAddress: null,
            destinationType: null,
          });
          setSendStep("amount");
          setPendingInput("");
        } else if (sendData.currency) {
          // Remove currency
          setSendData({
            currency: null,
            currencyMint: null,
            currencyDecimals: null,
            amount: null,
            walletAddress: null,
            destinationType: null,
          });
          setSendStep("currency");
          setFilteredSkills(CURRENCY_SKILLS);
          setIsDropdownOpen(CURRENCY_SKILLS.length > 0);
          setSelectedSkillIndex(0);
          calculateDropdownPosition();
        } else if (swapData.toCurrency) {
          // Handle swap data removal in reverse order
          // Remove TO currency
          setSwapData({
            ...swapData,
            toCurrency: null,
            toCurrencyMint: null,
            toCurrencyDecimals: null,
          });
          setSwapStep("to_currency");
          setFilteredSkills(SWAP_TARGET_TOKENS);
          setIsDropdownOpen(SWAP_TARGET_TOKENS.length > 0);
          setSelectedSkillIndex(0);
          calculateDropdownPosition();
        } else if (swapData.amount) {
          // Remove amount
          setSwapData({
            ...swapData,
            amount: null,
            toCurrency: null,
            toCurrencyMint: null,
            toCurrencyDecimals: null,
          });
          setSwapStep("amount");
          setPendingInput("");
        } else if (swapData.fromCurrency) {
          // Remove FROM currency
          setSwapData({
            fromCurrency: null,
            fromCurrencyMint: null,
            fromCurrencyDecimals: null,
            amount: null,
            toCurrency: null,
            toCurrencyMint: null,
            toCurrencyDecimals: null,
          });
          setSwapStep("from_currency");
          setFilteredSkills(CURRENCY_SKILLS);
          setIsDropdownOpen(CURRENCY_SKILLS.length > 0);
          setSelectedSkillIndex(0);
          calculateDropdownPosition();
        } else if (value.length > 0) {
          // Remove last skill from array
          const lastSkill = value[value.length - 1];
          removeSkill(lastSkill);
        }
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setPendingInput(newValue);

      // Check for NLP mode activation
      const lowerValue = newValue.toLowerCase();
      const isSendStart = lowerValue.startsWith("send ");
      const isSwapStart = lowerValue.startsWith("swap ");

      if (isSendStart || isSwapStart) {
        if (isNlpMode) {
          // Update intent if already in NLP mode but intent changed
          onNlpStateChange?.({
            isActive: true,
            intent: isSendStart ? "send" : "swap",
            parsedData: nlpParsedData,
          });
        } else {
          setIsNlpMode(true);
          // Clear other flows if active
          setSendStep(null);
          setSwapStep(null);
          setIsDropdownOpen(false);

          // Immediately notify parent of activation with empty data but correct intent
          onNlpStateChange?.({
            isActive: true,
            intent: isSendStart ? "send" : "swap",
            parsedData: {
              amount: null,
              partialAmount: false,
              currency: null,
              partialCurrency: false,
              currencyMint: null,
              currencyDecimals: null,
              walletAddress: null,
              partialRecipient: false,
              recipientHintType: null,
              destinationType: null,
              toCurrency: null,
              toCurrencyMint: null,
              toCurrencyDecimals: null,
            },
          });
        }
      } else if (
        isNlpMode &&
        !lowerValue.startsWith("send") &&
        !lowerValue.startsWith("swap")
      ) {
        // Exit NLP mode if user deletes prefix
        setIsNlpMode(false);
        setNlpParsedData({
          amount: null,
          partialAmount: false,
          currency: null,
          partialCurrency: false,
          currencyMint: null,
          currencyDecimals: null,
          walletAddress: null,
          partialRecipient: false,
          recipientHintType: null,
          destinationType: null,
          toCurrency: null,
          toCurrencyMint: null,
          toCurrencyDecimals: null,
        });
        onNlpStateChange?.({
          isActive: false,
          intent: null,
          parsedData: {
            amount: null,
            partialAmount: false,
            currency: null,
            partialCurrency: false,
            currencyMint: null,
            currencyDecimals: null,
            walletAddress: null,
            partialRecipient: false,
            recipientHintType: null,
            destinationType: null,
            toCurrency: null,
            toCurrencyMint: null,
            toCurrencyDecimals: null,
          },
        });
      } else if (isDropdownOpen) {
        // Filter skills based on input
        const filtered = (
          sendStep === "currency" || swapStep === "from_currency"
            ? CURRENCY_SKILLS
            : swapStep === "to_currency"
              ? SWAP_TARGET_TOKENS
              : ACTION_SKILLS
        ).filter((skill) =>
          skill.label.toLowerCase().includes(newValue.toLowerCase())
        );
        setFilteredSkills(filtered);
        setSelectedSkillIndex(0);
      }

      // Auto-resize textarea based on content
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }

      // Clear wallet address error when user starts typing
      if (sendStep === "wallet_address" && walletAddressError) {
        setWalletAddressError(null);
      }

      // Clear amount error when user starts typing
      if ((swapStep === "amount" || sendStep === "amount") && amountError) {
        setAmountError(null);
      }

      // Don't open dropdown during amount input for swap or send, or during wallet address input
      if (
        swapStep === "amount" ||
        swapStep === "to_currency" ||
        sendStep === "amount" ||
        sendStep === "wallet_address"
      ) {
        return;
      }

      // Filter recipient skills if @ is being typed
      if (newValue.startsWith("@")) {
        const query = newValue.slice(1).toLowerCase();
        const filtered = query
          ? RECIPIENT_SKILLS.filter((skill) =>
              skill.label.toLowerCase().includes(query)
            )
          : RECIPIENT_SKILLS;
        setFilteredSkills(filtered);
        setIsDropdownOpen(true);
        setSelectedSkillIndex(0);
        calculateDropdownPosition();
      }
    };

    const getPlaceholder = (): string => {
      if (isNlpMode) {
        return ""; // Placeholder handled by status bar or not needed as user is typing command
      }
      // Show swap-specific placeholders during swap flow
      if (swapStep === "from_currency") {
        return CURRENCY_SKILLS.length === 0
          ? "No tokens available in wallet. Please add funds."
          : "Select FROM currency (SOL, Loyal, etc.)...";
      }
      if (swapStep === "amount" && !swapData.amount) {
        return "Type amount (e.g., 10) then press Enter...";
      }
      if (swapStep === "to_currency") {
        return "Select TO currency...";
      }

      // Show send-specific placeholders during send flow
      if (sendStep === "currency") {
        return CURRENCY_SKILLS.length === 0
          ? "No tokens available in wallet. Please add funds."
          : "Select currency (SOL, USDC, etc.)...";
      }
      if (sendStep === "amount" && !sendData.amount) {
        return "Type amount (e.g., 10) then press Enter...";
      }
      if (sendStep === "wallet_address") {
        return sendData.currency?.toUpperCase() === "SOL"
          ? "Type wallet address or @username then press Enter..."
          : "Type wallet address then press Enter...";
      }

      // Hide placeholder if there's any content (skills, swap data, send data, or pending text)
      const hasContent =
        value.length > 0 ||
        swapData.fromCurrency ||
        swapData.amount ||
        swapData.toCurrency ||
        sendData.currency ||
        sendData.amount ||
        sendData.walletAddress ||
        pendingInput.length > 0;

      if (hasContent) {
        return "";
      }

      return props.placeholder !== undefined
        ? props.placeholder
        : "Ask me anything (type / for skills)...";
    };

    // Get skill color based on category
    const getSkillColor = (skill: LoyalSkill): string => {
      switch (skill.category) {
        case "action":
          return "bg-gradient-to-br from-red-400/25 to-red-500/50 border-red-400/40 text-white";
        case "currency":
          return "bg-white/10 border-white/25 text-white";
        case "recipient":
          return "bg-blue-400/25 border-blue-400/40 text-white";
        case "amount":
          return "bg-green-400/25 border-green-400/40 text-white";
        default:
          return "bg-white/10 border-white/25 text-white";
      }
    };

    // Get skill icon based on id
    const getSkillIcon = (skill: LoyalSkill): React.ReactNode => {
      switch (skill.id) {
        case "send":
          return <Send size={14} />;
        case "swap":
          return <Repeat2 size={14} />;
        default:
          return null;
      }
    };

    // Check if swap is complete
    const isSwapComplete =
      hasSwapSkill &&
      swapData.fromCurrency &&
      swapData.amount &&
      swapData.toCurrency;

    // Check if send is complete
    const isSendComplete =
      hasSendSkill &&
      sendData.currency &&
      sendData.amount &&
      sendData.walletAddress;

    return (
      <div
        className={cn("flex w-full flex-wrap items-center gap-2", className)}
        ref={containerRef}
        style={{ position: "relative" }}
      >
        {value.map((skill) => (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 font-medium text-sm",
              "shadow-lg backdrop-blur-[18px]",
              getSkillColor(skill)
            )}
            key={skill.id}
          >
            {getSkillIcon(skill)}
            {skill.label}
            <button
              className="ml-1 h-3 w-3 cursor-pointer border-0 bg-transparent p-0 transition-transform duration-200 hover:scale-125"
              onClick={() => removeSkill(skill)}
              onFocus={(e) => e.currentTarget.blur()} // Prevent button from stealing focus
              tabIndex={-1} // Remove from tab order
              type="button" // Prevent form submission
            >
              <XIcon className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
        {swapData.fromCurrency && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 font-medium text-sm",
              "shadow-lg backdrop-blur-[18px]",
              "border-white/25 bg-white/10 text-white"
            )}
          >
            {swapData.fromCurrency}
            <button
              className="ml-1 h-3 w-3 cursor-pointer border-0 bg-transparent p-0 transition-transform duration-200 hover:scale-125"
              onClick={() => {
                setSwapData({
                  fromCurrency: null,
                  fromCurrencyMint: null,
                  fromCurrencyDecimals: null,
                  amount: null,
                  toCurrency: null,
                  toCurrencyMint: null,
                  toCurrencyDecimals: null,
                });
                setSwapStep("from_currency");
                setFilteredSkills(CURRENCY_SKILLS);
                setIsDropdownOpen(CURRENCY_SKILLS.length > 0);
                setSelectedSkillIndex(0);
                calculateDropdownPosition();
              }}
              onFocus={(e) => e.currentTarget.blur()}
              tabIndex={-1}
              type="button"
            >
              <XIcon className="h-2.5 w-2.5" />
            </button>
          </span>
        )}
        {swapData.amount && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 font-medium text-sm",
              "shadow-lg backdrop-blur-[18px]",
              "border-green-400/40 bg-green-400/25 text-white"
            )}
          >
            {swapData.amount}
            <button
              className="ml-1 h-3 w-3 cursor-pointer border-0 bg-transparent p-0 transition-transform duration-200 hover:scale-125"
              onClick={() => {
                setSwapData({
                  ...swapData,
                  amount: null,
                  toCurrency: null,
                  toCurrencyMint: null,
                  toCurrencyDecimals: null,
                });
                setSwapStep("amount");
                setPendingInput("");
              }}
              onFocus={(e) => e.currentTarget.blur()}
              tabIndex={-1}
              type="button"
            >
              <XIcon className="h-2.5 w-2.5" />
            </button>
          </span>
        )}
        {swapData.toCurrency && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 font-medium text-sm",
              "shadow-lg backdrop-blur-[18px]",
              "border-white/25 bg-white/10 text-white"
            )}
          >
            {swapData.toCurrency}
            <button
              className="ml-1 h-3 w-3 cursor-pointer border-0 bg-transparent p-0 transition-transform duration-200 hover:scale-125"
              onClick={() => {
                setSwapData({
                  ...swapData,
                  toCurrency: null,
                  toCurrencyMint: null,
                  toCurrencyDecimals: null,
                });
                setSwapStep("to_currency");
                // Allow swapping TO Bonk or Loyal tokens
                setFilteredSkills(SWAP_TARGET_TOKENS);
                setIsDropdownOpen(SWAP_TARGET_TOKENS.length > 0);
                setSelectedSkillIndex(0);
                calculateDropdownPosition();
              }}
              onFocus={(e) => e.currentTarget.blur()}
              tabIndex={-1}
              type="button"
            >
              <XIcon className="h-2.5 w-2.5" />
            </button>
          </span>
        )}
        {sendData.currency && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 font-medium text-sm",
              "shadow-lg backdrop-blur-[18px]",
              "border-white/25 bg-white/10 text-white"
            )}
          >
            {sendData.currency}
            <button
              className="ml-1 h-3 w-3 cursor-pointer border-0 bg-transparent p-0 transition-transform duration-200 hover:scale-125"
              onClick={() => {
                setSendData({
                  currency: null,
                  currencyMint: null,
                  currencyDecimals: null,
                  amount: null,
                  walletAddress: null,
                  destinationType: null,
                });
                setSendStep("currency");
                setFilteredSkills(CURRENCY_SKILLS);
                setIsDropdownOpen(CURRENCY_SKILLS.length > 0);
                setSelectedSkillIndex(0);
                calculateDropdownPosition();
              }}
              onFocus={(e) => e.currentTarget.blur()}
              tabIndex={-1}
              type="button"
            >
              <XIcon className="h-2.5 w-2.5" />
            </button>
          </span>
        )}
        {sendData.amount && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 font-medium text-sm",
              "shadow-lg backdrop-blur-[18px]",
              "border-green-400/40 bg-green-400/25 text-white"
            )}
          >
            {sendData.amount}
            <button
              className="ml-1 h-3 w-3 cursor-pointer border-0 bg-transparent p-0 transition-transform duration-200 hover:scale-125"
              onClick={() => {
                setSendData({
                  ...sendData,
                  amount: null,
                  walletAddress: null,
                  destinationType: null,
                });
                setSendStep("amount");
                setPendingInput("");
              }}
              onFocus={(e) => e.currentTarget.blur()}
              tabIndex={-1}
              type="button"
            >
              <XIcon className="h-2.5 w-2.5" />
            </button>
          </span>
        )}
        {sendData.walletAddress && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 font-medium text-sm",
              "shadow-lg backdrop-blur-[18px]",
              sendData.destinationType === "telegram"
                ? "border-purple-400/40 bg-purple-400/25 text-white"
                : "border-blue-400/40 bg-blue-400/25 text-white"
            )}
            title={
              sendData.destinationType === "telegram"
                ? `@${sendData.walletAddress}`
                : sendData.walletAddress
            }
          >
            {sendData.destinationType === "telegram"
              ? `@${sendData.walletAddress}`
              : sendData.walletAddress.length > 12
                ? `${sendData.walletAddress.slice(
                    0,
                    6
                  )}...${sendData.walletAddress.slice(-4)}`
                : sendData.walletAddress}
            <button
              className="ml-1 h-3 w-3 cursor-pointer border-0 bg-transparent p-0 transition-transform duration-200 hover:scale-125"
              onClick={() => {
                setSendData({
                  ...sendData,
                  walletAddress: null,
                  destinationType: null,
                });
                setSendStep("wallet_address");
                setPendingInput("");
                setWalletAddressError(null);
              }}
              onFocus={(e) => e.currentTarget.blur()}
              tabIndex={-1}
              type="button"
            >
              <XIcon className="h-2.5 w-2.5" />
            </button>
          </span>
        )}
        <textarea
          {...props}
          className={cn(
            "resize-none overflow-hidden bg-transparent text-white outline-none placeholder:text-white/60",
            isSendComplete || isSwapComplete
              ? "h-0 w-0 min-w-0"
              : getPlaceholder()
                ? "w-full md:w-auto md:min-w-[100px] md:flex-1"
                : "min-w-[100px] flex-1"
          )}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          ref={textareaRef}
          rows={1}
          style={{
            padding: "2px 0",
            border: "none",
            fontSize: "16px",
            fontFamily: "var(--font-geist-sans), sans-serif",
            lineHeight: "24px",
          }}
          value={pendingInput}
        />
        {(walletAddressError || amountError) && (
          <div className="mt-2 w-full rounded-md bg-red-500/20 px-3 py-2 text-sm text-white">
            {walletAddressError || amountError}
          </div>
        )}
        {isDropdownOpen && (
          <SkillDropdown
            onSelect={addSkill}
            position={dropdownPosition}
            selectedIndex={selectedSkillIndex}
            skills={filteredSkills}
            textareaRef={textareaRef}
          />
        )}
      </div>
    );
  }
);

SkillsInput.displayName = "SkillsInput";

export { SkillsInput };
