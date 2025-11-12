"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SkillTextSegment } from "@/lib/skills-text";
import {
  SKILL_PREFIX,
  SKILL_SUFFIX,
  SKILL_TRAILING_SPACE,
  splitSkillSegments,
} from "@/lib/skills-text";
import type { LoyalSkill } from "@/types/skills";
import { AVAILABLE_SKILLS } from "@/types/skills";

const ACTION_SKILLS = AVAILABLE_SKILLS.filter(
  (skill) => skill.category === "action"
);
const RECIPIENT_SKILLS = AVAILABLE_SKILLS.filter(
  (skill) => skill.category === "recipient"
);
const CURRENCY_SKILLS = AVAILABLE_SKILLS.filter(
  (skill) => skill.category === "currency"
);

type UseSkillInvocationProps = {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onSkillSelect?: (skill: LoyalSkill, slashIndex: number) => void;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  currentValue?: string;
};

type UseSkillInvocationReturn = {
  isDropdownOpen: boolean;
  dropdownPosition: { top: number; left: number };
  selectedSkillIndex: number;
  filteredSkills: LoyalSkill[];
  slashIndex: number | null;
  skillSegments: SkillTextSegment[];
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => boolean;
  handleInput: (e: React.FormEvent<HTMLTextAreaElement>) => void;
  selectSkill: (skill: LoyalSkill) => void;
  pendingAmountInput: boolean;
  pendingCurrencySelection: boolean;
  showDeactivatedHint: boolean;
  pendingSwapToCurrency: boolean;
  swapData: {
    amount: string | null;
    fromCurrency: string | null;
  };
};

export const useSkillInvocation = ({
  textareaRef,
  onSkillSelect,
  onChange,
  currentValue,
}: UseSkillInvocationProps): UseSkillInvocationReturn => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [selectedSkillIndex, setSelectedSkillIndex] = useState(0);
  const [filteredSkills, setFilteredSkills] =
    useState<LoyalSkill[]>(ACTION_SKILLS);
  const [pendingRecipientSelection, setPendingRecipientSelection] =
    useState(false);
  const [recipientTriggerIndex, setRecipientTriggerIndex] = useState<
    number | null
  >(null);
  const [pendingAmountInput, setPendingAmountInput] = useState(false);
  const [amountValue, setAmountValue] = useState("");
  const [pendingCurrencySelection, setPendingCurrencySelection] =
    useState(false);
  const [amountTriggerIndex, setAmountTriggerIndex] = useState<number | null>(
    null
  );
  const [slashIndex, setSlashIndex] = useState<number | null>(null);
  const [skillSegments, setSkillSegments] = useState<SkillTextSegment[]>([]);
  const [showDeactivatedHint, setShowDeactivatedHint] = useState(false);
  const prevHadActionSkillRef = useRef(false);

  // Swap-specific state
  const [_pendingSwapFromCurrency, setPendingSwapFromCurrency] =
    useState(false);
  const [pendingSwapToCurrency, setPendingSwapToCurrency] = useState(false);
  const [swapFromCurrency, setSwapFromCurrency] = useState<string | null>(null);
  const [swapAmount, setSwapAmount] = useState<string | null>(null);

  // Send-specific state
  const [sendCurrency, setSendCurrency] = useState<string | null>(null);

  const calculateDropdownPosition = useCallback((textBeforeCursor: string) => {
    const lines = textBeforeCursor.split("\n");
    const currentLine = lines.length;
    const lineHeight = 24;
    const charWidth = 8;
    const lastLineLength = lines.at(-1)?.length ?? 0;

    return {
      top: currentLine * lineHeight,
      left: lastLineLength * charWidth,
    };
  }, []);

  const applyTextMutation = useCallback(
    (newValue: string, caretPosition: number) => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      textarea.value = newValue;
      textarea.selectionStart = caretPosition;
      textarea.selectionEnd = caretPosition;

      if (onChange) {
        const event = {
          target: textarea,
          currentTarget: textarea,
        } as React.ChangeEvent<HTMLTextAreaElement>;
        onChange(event);
      }

      setSkillSegments(splitSkillSegments(newValue));
    },
    [onChange, textareaRef]
  );

  const getSkillRangeAtIndex = useCallback(
    (text: string, index: number): { start: number; end: number } | null => {
      if (index < 0 || index > text.length) {
        return null;
      }

      const prefixIndex = text.lastIndexOf(SKILL_PREFIX, index);
      if (prefixIndex === -1) {
        return null;
      }

      const suffixIndex = text.indexOf(SKILL_SUFFIX, prefixIndex + 1);
      if (suffixIndex === -1 || index < prefixIndex) {
        return null;
      }

      let trailingLength = 0;
      for (let offset = 0; offset < SKILL_TRAILING_SPACE.length; offset += 1) {
        const trailingChar = text[suffixIndex + 1 + offset];
        if (trailingChar === SKILL_TRAILING_SPACE[offset]) {
          trailingLength += 1;
        } else {
          break;
        }
      }

      const tokenEnd = suffixIndex + 1 + trailingLength;

      if (index <= tokenEnd) {
        return { start: prefixIndex, end: tokenEnd };
      }

      return null;
    },
    []
  );

  const removeSkillAtIndex = useCallback(
    (index: number): boolean => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return false;
      }

      const { value } = textarea;
      const range = getSkillRangeAtIndex(value, index);
      if (!range) {
        return false;
      }

      // Check if we're removing an action skill
      const removedText = value.slice(range.start, range.end);
      const segments = splitSkillSegments(removedText);
      const isRemovingActionSkill = segments.some(
        (seg) => seg.isSkill && seg.skill?.category === "action"
      );

      const newValue = value.slice(0, range.start) + value.slice(range.end);
      applyTextMutation(newValue, range.start);

      // If removing action skill, clean up all pending states
      if (isRemovingActionSkill) {
        setPendingAmountInput(false);
        setPendingCurrencySelection(false);
        setPendingRecipientSelection(false);
        setPendingSwapFromCurrency(false);
        setPendingSwapToCurrency(false);
        setIsDropdownOpen(false);
        setAmountValue("");
        setAmountTriggerIndex(null);
        setRecipientTriggerIndex(null);
        setSwapAmount(null);
        setSwapFromCurrency(null);
        setSendCurrency(null);
      }

      return true;
    },
    [applyTextMutation, getSkillRangeAtIndex, textareaRef]
  );

  const syncSegments = useCallback(() => {
    const text = currentValue ?? textareaRef.current?.value ?? "";
    setSkillSegments(splitSkillSegments(text));
  }, [currentValue, textareaRef]);

  useEffect(() => {
    syncSegments();
  }, [syncSegments]);

  const detectSlash = useCallback(() => {
    if (pendingRecipientSelection) {
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const text = textarea.value;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = text.slice(0, cursorPos);
    const lastSlashIndex = textBeforeCursor.lastIndexOf("/");

    if (lastSlashIndex !== -1) {
      const textAfterSlash = textBeforeCursor.slice(lastSlashIndex + 1);

      if (!textAfterSlash.includes(" ")) {
        const filtered = ACTION_SKILLS.filter((skill) =>
          skill.label.toLowerCase().startsWith(textAfterSlash.toLowerCase())
        );

        if (filtered.length > 0) {
          const position = calculateDropdownPosition(textBeforeCursor);

          setSlashIndex(lastSlashIndex);
          setFilteredSkills(filtered);
          setDropdownPosition(position);
          setIsDropdownOpen(true);
          setSelectedSkillIndex(0);
        } else {
          setIsDropdownOpen(false);
        }
        return;
      }
    }

    setIsDropdownOpen(false);
  }, [textareaRef, calculateDropdownPosition, pendingRecipientSelection]);

  const updateRecipientSuggestions = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const text = textarea.value;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = text.slice(0, cursorPos);

    if (pendingRecipientSelection) {
      const triggerIndex = recipientTriggerIndex ?? cursorPos;
      if (recipientTriggerIndex === null) {
        setRecipientTriggerIndex(cursorPos);
      }

      const rawQuery = text.slice(triggerIndex, cursorPos);
      if (rawQuery.includes(" ") || rawQuery.includes("\n")) {
        setPendingRecipientSelection(false);
        setRecipientTriggerIndex(null);
        setFilteredSkills(ACTION_SKILLS);
        setIsDropdownOpen(false);
        return;
      }

      const normalizedQuery = rawQuery.replace(/^@/, "").toLowerCase();
      const filtered = normalizedQuery
        ? RECIPIENT_SKILLS.filter((recipient) =>
            recipient.label
              .toLowerCase()
              .replace("@", "")
              .startsWith(normalizedQuery)
          )
        : RECIPIENT_SKILLS;

      setFilteredSkills(filtered.length ? filtered : RECIPIENT_SKILLS);
      setSelectedSkillIndex(0);
      setIsDropdownOpen(true);
      setDropdownPosition(
        calculateDropdownPosition(text.slice(0, triggerIndex))
      );
      return;
    }

    const lastAt = textBeforeCursor.lastIndexOf("@");
    if (lastAt !== -1) {
      const fragment = textBeforeCursor.slice(lastAt + 1);
      if (!(fragment.includes(" ") || fragment.includes("\n"))) {
        const normalizedQuery = fragment.toLowerCase();
        const filtered = normalizedQuery
          ? RECIPIENT_SKILLS.filter((recipient) =>
              recipient.label
                .toLowerCase()
                .replace("@", "")
                .startsWith(normalizedQuery)
            )
          : RECIPIENT_SKILLS;

        setPendingRecipientSelection(true);
        setRecipientTriggerIndex(lastAt);
        setFilteredSkills(filtered.length ? filtered : RECIPIENT_SKILLS);
        setSelectedSkillIndex(0);
        setDropdownPosition(calculateDropdownPosition(text.slice(0, lastAt)));
        setIsDropdownOpen(true);
        return;
      }
    }

    setPendingRecipientSelection(false);
    setRecipientTriggerIndex(null);
  }, [
    calculateDropdownPosition,
    pendingRecipientSelection,
    recipientTriggerIndex,
    textareaRef,
  ]);

  const selectSkill = useCallback(
    (skill: LoyalSkill) => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      const text = textarea.value;
      const cursorPos = textarea.selectionStart;

      // Check if skill already exists (prevent duplicates)
      const currentSegments = splitSkillSegments(text);
      const skillAlreadyExists = currentSegments.some(
        (segment) => segment.isSkill && segment.skill?.id === skill.id
      );

      if (skillAlreadyExists && skill.category !== "recipient") {
        // Don't add duplicate action skills
        setIsDropdownOpen(false);
        setSlashIndex(null);
        return;
      }

      if (pendingRecipientSelection) {
        const token = `${SKILL_PREFIX}${skill.label}${SKILL_SUFFIX}${SKILL_TRAILING_SPACE}`;
        const startPos = recipientTriggerIndex ?? cursorPos;
        // Remove the typed text between trigger position and cursor
        const newText = text.slice(0, startPos) + token + text.slice(cursorPos);

        setIsDropdownOpen(false);
        setPendingRecipientSelection(false);
        setRecipientTriggerIndex(null);
        setSlashIndex(null);
        setFilteredSkills(ACTION_SKILLS);
        applyTextMutation(newText, startPos + token.length);
        return;
      }

      if (slashIndex === null) {
        return;
      }

      const before = text.slice(0, slashIndex);
      const after = text.slice(cursorPos);

      // Handle currency selection (from amount flow)
      if (skill.category === "currency") {
        // Check if we're in a swap flow by looking for Swap skill in existing text
        const hasSwapSkill = skillSegments.some(
          (seg) => seg.isSkill && seg.skill?.id === "swap"
        );

        // Swap: Second currency selection (TO) - CHECK THIS FIRST
        if (hasSwapSkill && pendingSwapToCurrency) {
          const currencyToken = `${SKILL_PREFIX}${skill.label}${SKILL_SUFFIX}${SKILL_TRAILING_SPACE}`;
          const newText = before + currencyToken + after;
          const newCursorPos = slashIndex + currencyToken.length;

          onSkillSelect?.(skill, slashIndex);
          applyTextMutation(newText, newCursorPos);

          // Swap flow complete - widget should be shown now
          setPendingSwapToCurrency(false);
          setPendingCurrencySelection(false);
          setSwapFromCurrency(null);
          setSwapAmount(null);
          setAmountValue("");
          setAmountTriggerIndex(null);
          setIsDropdownOpen(false);
          setSlashIndex(null);
          setFilteredSkills(ACTION_SKILLS);
          return;
        }

        // Swap: First currency selection (FROM) - happens right after Swap skill
        if (
          hasSwapSkill &&
          !swapFromCurrency &&
          pendingCurrencySelection &&
          !pendingSwapToCurrency
        ) {
          // First currency selection in swap - this is the FROM currency
          const currencyToken = `${SKILL_PREFIX}${skill.label}${SKILL_SUFFIX}${SKILL_TRAILING_SPACE}`;
          const newText = before + currencyToken + after;
          const newCursorPos = slashIndex + currencyToken.length;

          onSkillSelect?.(skill, slashIndex);
          applyTextMutation(newText, newCursorPos);

          // Store FROM currency, then prompt for amount
          setSwapFromCurrency(skill.label);
          setPendingCurrencySelection(false);
          setPendingAmountInput(true);
          setAmountTriggerIndex(newCursorPos);
          setIsDropdownOpen(false);
          setSlashIndex(null);
          return;
        }

        // Swap: Second currency selection (TO) - happens after amount entry
        if (
          hasSwapSkill &&
          swapFromCurrency &&
          amountValue &&
          pendingSwapToCurrency &&
          pendingCurrencySelection
        ) {
          // Second currency selection in swap - this is the TO currency
          const currencyToken = `${SKILL_PREFIX}${skill.label}${SKILL_SUFFIX}${SKILL_TRAILING_SPACE}`;
          const newText = before + currencyToken + after;
          const newCursorPos = slashIndex + currencyToken.length;

          onSkillSelect?.(skill, slashIndex);
          applyTextMutation(newText, newCursorPos);

          // All swap data collected
          setSwapAmount(amountValue);
          setAmountValue("");
          setAmountTriggerIndex(null);
          setPendingCurrencySelection(false);
          setPendingSwapToCurrency(false);
          setIsDropdownOpen(false);
          setSlashIndex(null);
          return;
        }

        // Send flow - currency selection (first step after /send)
        if (!(hasSwapSkill || sendCurrency) && pendingCurrencySelection) {
          // First currency selection in Send - store it and prompt for amount
          const currencyToken = `${SKILL_PREFIX}${skill.label}${SKILL_SUFFIX}${SKILL_TRAILING_SPACE}`;
          const newText = before + currencyToken + after;
          const newCursorPos = slashIndex + currencyToken.length;

          onSkillSelect?.(skill, slashIndex);
          applyTextMutation(newText, newCursorPos);

          // Store currency, then prompt for amount
          setSendCurrency(skill.label);
          setPendingCurrencySelection(false);
          setPendingAmountInput(true);
          setAmountTriggerIndex(newCursorPos);
          setIsDropdownOpen(false);
          setSlashIndex(null);
          return;
        }
      }

      const baseToken = `${SKILL_PREFIX}${skill.label}${SKILL_SUFFIX}${SKILL_TRAILING_SPACE}`;
      const combinedToken = baseToken;
      const newText = before + combinedToken + after;

      onSkillSelect?.(skill, slashIndex);

      const newCursorPos = slashIndex + combinedToken.length;
      applyTextMutation(newText, newCursorPos);

      if (skill.id === "send") {
        // After Send, show currency dropdown
        setPendingCurrencySelection(true);
        setFilteredSkills(CURRENCY_SKILLS);
        setIsDropdownOpen(true);
        setSelectedSkillIndex(0);
        const textBeforeCursor = newText.slice(0, newCursorPos);
        const position = calculateDropdownPosition(textBeforeCursor);
        setDropdownPosition(position);
        setSlashIndex(newCursorPos); // Keep slashIndex so we know where to insert currency
      } else if (skill.id === "swap") {
        // After Swap, show currency dropdown for FROM currency
        setPendingCurrencySelection(true);
        setFilteredSkills(CURRENCY_SKILLS);
        setIsDropdownOpen(true);
        setSelectedSkillIndex(0);
        const textBeforeCursor = newText.slice(0, newCursorPos);
        const position = calculateDropdownPosition(textBeforeCursor);
        setDropdownPosition(position);
        setSlashIndex(newCursorPos); // Keep slashIndex so we know where to insert currency
      } else {
        setIsDropdownOpen(false);
        setSlashIndex(null);
        setFilteredSkills(ACTION_SKILLS);
        setPendingRecipientSelection(false);
        setRecipientTriggerIndex(null);
      }
    },
    [
      textareaRef,
      slashIndex,
      onSkillSelect,
      applyTextMutation,
      pendingRecipientSelection,
      calculateDropdownPosition,
      pendingCurrencySelection,
      amountValue,
      recipientTriggerIndex,
      skillSegments,
      swapFromCurrency,
      pendingSwapToCurrency,
      sendCurrency,
    ]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>): boolean => {
      // Handle amount input completion
      if (
        pendingAmountInput &&
        (e.key === "Enter" || e.key === " ") &&
        amountValue &&
        Number.parseFloat(amountValue) > 0
      ) {
        e.preventDefault();
        const textarea = textareaRef.current;
        if (textarea) {
          const cursorPos = textarea.selectionStart;
          const segments = splitSkillSegments(textarea.value);
          const hasSwapSkill = segments.some(
            (seg) => seg.isSkill && seg.skill?.id === "swap"
          );
          const hasSendSkill = segments.some(
            (seg) => seg.isSkill && seg.skill?.id === "send"
          );
          const hasCurrency = segments.some(
            (seg) => seg.isSkill && seg.skill?.category === "currency"
          );

          // Remove the user-typed amount and insert cleaned version
          // User typed amount is between amountTriggerIndex and current cursor
          const insertPos = amountTriggerIndex || 0;
          const before = textarea.value.slice(0, insertPos);
          // Skip the typed amount - it's between insertPos and cursorPos
          const after = textarea.value.slice(cursorPos);
          const amountText = ` ${amountValue} `;
          const newText = before + amountText + after;
          const newCursorPos = insertPos + amountText.length;

          applyTextMutation(newText, newCursorPos);

          setPendingAmountInput(false);

          // For Send flow with currency already selected, show recipient dropdown
          if (hasSendSkill && hasCurrency && !hasSwapSkill) {
            setAmountValue("");
            setAmountTriggerIndex(null);
            setPendingRecipientSelection(true);
            setRecipientTriggerIndex(newCursorPos);
            setFilteredSkills(RECIPIENT_SKILLS);
            setSelectedSkillIndex(0);
            setIsDropdownOpen(true);
            setDropdownPosition(
              calculateDropdownPosition(newText.slice(0, newCursorPos))
            );
            return true;
          }

          // Show currency dropdown - set slashIndex to where currency should be inserted
          setPendingCurrencySelection(true);
          setSlashIndex(newCursorPos); // Currency will be inserted right after the amount

          // For swap, filter out the FROM currency from TO options
          if (hasSwapSkill && swapFromCurrency) {
            const availableToCurrencies = CURRENCY_SKILLS.filter(
              (curr) => curr.label !== swapFromCurrency
            );
            setFilteredSkills(availableToCurrencies);
            setPendingSwapToCurrency(true);
          } else {
            setFilteredSkills(CURRENCY_SKILLS);
          }

          setSelectedSkillIndex(0);
          setIsDropdownOpen(true);
          setDropdownPosition(
            calculateDropdownPosition(newText.slice(0, newCursorPos))
          );
        }
        return true;
      }

      if (isDropdownOpen) {
        switch (e.key) {
          case "Tab":
          case "Enter": {
            e.preventDefault();
            if (filteredSkills.length > 0) {
              selectSkill(filteredSkills[selectedSkillIndex]);
            }
            return true;
          }
          case "Escape": {
            e.preventDefault();
            setIsDropdownOpen(false);
            setSlashIndex(null);
            setPendingRecipientSelection(false);
            setPendingCurrencySelection(false);
            setPendingAmountInput(false);
            setFilteredSkills(ACTION_SKILLS);
            return true;
          }
          case "ArrowDown": {
            e.preventDefault();
            setSelectedSkillIndex((prev) =>
              prev < filteredSkills.length - 1 ? prev + 1 : prev
            );
            return true;
          }
          case "ArrowUp": {
            e.preventDefault();
            setSelectedSkillIndex((prev) => (prev > 0 ? prev - 1 : prev));
            return true;
          }
          default: {
            break;
          }
        }
      }

      if (e.key === "Backspace" || e.key === "Delete") {
        const textarea = textareaRef.current;
        if (textarea && textarea.selectionStart === textarea.selectionEnd) {
          const targetIndex =
            e.key === "Backspace"
              ? textarea.selectionStart - 1
              : textarea.selectionStart;

          const handled = removeSkillAtIndex(targetIndex);
          if (handled) {
            e.preventDefault();
            return true;
          }
        }
      }

      return false;
    },
    [
      isDropdownOpen,
      filteredSkills,
      selectedSkillIndex,
      selectSkill,
      textareaRef,
      removeSkillAtIndex,
      pendingAmountInput,
      amountValue,
      amountTriggerIndex,
      calculateDropdownPosition,
      swapFromCurrency,
      applyTextMutation,
    ]
  );

  const handleInput = useCallback(
    (event: React.FormEvent<HTMLTextAreaElement>) => {
      const textarea = textareaRef.current;
      if (textarea) {
        const cursorPos = textarea.selectionStart;
        const currentSegments = splitSkillSegments(textarea.value);

        // Check if we have any action skills
        const hasActionSkill = currentSegments.some(
          (segment) => segment.isSkill && segment.skill?.category === "action"
        );

        // If in skill mode, restrict input
        if (hasActionSkill && event.nativeEvent instanceof InputEvent) {
          const inputEvent = event.nativeEvent as InputEvent;

          // Allow deletions
          if (inputEvent.inputType.startsWith("delete")) {
            const newSegments = splitSkillSegments(textarea.value);
            setSkillSegments(newSegments);
            detectSlash();
            updateRecipientSuggestions();
            return;
          }

          // Allow typing when dropdown is open (for filtering)
          if (isDropdownOpen) {
            const newSegments = splitSkillSegments(textarea.value);
            setSkillSegments(newSegments);
            detectSlash();
            updateRecipientSuggestions();
            return;
          }

          // Handle amount input
          if (pendingAmountInput) {
            // Only allow numbers and decimal point
            const char = inputEvent.data;
            if (char && /[0-9.]/.test(char)) {
              const currentText = textarea.value.slice(
                amountTriggerIndex || 0,
                cursorPos
              );
              setAmountValue(currentText);
              setSkillSegments(splitSkillSegments(textarea.value));
            } else {
              // Block non-numeric input
              event.preventDefault();
              const prevValue = currentSegments.map((s) => s.text).join("");
              textarea.value = prevValue;
              textarea.selectionStart = cursorPos - 1;
              textarea.selectionEnd = cursorPos - 1;
            }
            return;
          }

          // Check if cursor is inside a skill token
          const range = getSkillRangeAtIndex(textarea.value, cursorPos);

          // If inside a skill token, prevent typing entirely
          if (range) {
            event.preventDefault();
            // Revert the input
            const prevValue = currentSegments.map((s) => s.text).join("");
            textarea.value = prevValue;
            textarea.selectionStart = cursorPos - 1;
            textarea.selectionEnd = cursorPos - 1;
            return;
          }

          // Block any other text input in skill mode (outside skills, outside dropdown)
          event.preventDefault();
          const prevValue = currentSegments.map((s) => s.text).join("");
          textarea.value = prevValue;
          textarea.selectionStart = cursorPos - 1;
          textarea.selectionEnd = cursorPos - 1;
          return;
        }

        const newSegments = splitSkillSegments(textarea.value);
        setSkillSegments(newSegments);
      }
      detectSlash();
      updateRecipientSuggestions();
    },
    [
      detectSlash,
      updateRecipientSuggestions,
      textareaRef,
      getSkillRangeAtIndex,
      isDropdownOpen,
      pendingAmountInput,
      amountTriggerIndex,
    ]
  );

  useEffect(() => {
    detectSlash();
    updateRecipientSuggestions();
  }, [detectSlash, updateRecipientSuggestions]);

  // Auto-hide deactivation hint after 2 seconds
  useEffect(() => {
    if (showDeactivatedHint) {
      const timer = setTimeout(() => {
        setShowDeactivatedHint(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showDeactivatedHint]);

  // Track when skill mode is deactivated
  useEffect(() => {
    const hasActionSkill = skillSegments.some(
      (segment) => segment.isSkill && segment.skill?.category === "action"
    );

    // Show hint when transitioning from having action skill to not having one
    if (prevHadActionSkillRef.current && !hasActionSkill) {
      // Clean up all pending states
      setPendingAmountInput(false);
      setPendingCurrencySelection(false);
      setPendingRecipientSelection(false);
      setIsDropdownOpen(false);
      setAmountValue("");
      setAmountTriggerIndex(null);
      setRecipientTriggerIndex(null);

      // Show deactivation hint
      setShowDeactivatedHint(true);
      prevHadActionSkillRef.current = false;
    } else {
      // Update tracking ref
      prevHadActionSkillRef.current = hasActionSkill;
    }
  }, [skillSegments]);

  // Auto-open recipient dropdown if Send skill exists but no recipient (and amount is already entered)
  useEffect(() => {
    const _hasActionSkill = skillSegments.some(
      (segment) => segment.isSkill && segment.skill?.category === "action"
    );
    const hasSendSkill = skillSegments.some(
      (segment) => segment.isSkill && segment.skill?.id === "send"
    );
    const hasSwapSkill = skillSegments.some(
      (segment) => segment.isSkill && segment.skill?.id === "swap"
    );
    const hasRecipientSkill = skillSegments.some(
      (segment) => segment.isSkill && segment.skill?.category === "recipient"
    );
    const hasAmountSkill = skillSegments.some(
      (segment) => segment.isSkill && segment.skill?.category === "amount"
    );

    // If recipient dropdown is open but amount is gone, close it
    if (pendingRecipientSelection && !hasAmountSkill) {
      setIsDropdownOpen(false);
      setPendingRecipientSelection(false);
      setRecipientTriggerIndex(null);
      return;
    }

    // Don't interfere with other pending states
    if (
      isDropdownOpen ||
      pendingRecipientSelection ||
      pendingAmountInput ||
      pendingCurrencySelection
    ) {
      return;
    }

    // Only auto-open recipient for SEND skill (not Swap)
    if (hasSendSkill && !hasSwapSkill && hasAmountSkill && !hasRecipientSkill) {
      const textarea = textareaRef.current;
      if (textarea) {
        const cursorPos = textarea.selectionStart;
        setPendingRecipientSelection(true);
        setRecipientTriggerIndex(cursorPos);
        setFilteredSkills(RECIPIENT_SKILLS);
        setSelectedSkillIndex(0);
        setIsDropdownOpen(true);
        setDropdownPosition(
          calculateDropdownPosition(textarea.value.slice(0, cursorPos))
        );
      }
    }
  }, [
    skillSegments,
    isDropdownOpen,
    pendingRecipientSelection,
    pendingAmountInput,
    pendingCurrencySelection,
    textareaRef,
    calculateDropdownPosition,
  ]);

  return {
    isDropdownOpen,
    dropdownPosition,
    selectedSkillIndex,
    filteredSkills,
    slashIndex,
    skillSegments,
    handleKeyDown,
    handleInput,
    selectSkill,
    pendingAmountInput,
    pendingCurrencySelection,
    showDeactivatedHint,
    pendingSwapToCurrency,
    swapData: {
      amount: swapAmount,
      fromCurrency: swapFromCurrency,
    },
  };
};
