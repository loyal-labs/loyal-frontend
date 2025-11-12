"use client";

import { XIcon } from "lucide-react";
import * as React from "react";

import { SkillDropdown } from "@/components/ai-elements/skill-dropdown";
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
    toCurrency: string;
  }) => void;
  onSendFlowChange?: (data: {
    isActive: boolean;
    isComplete: boolean;
    sendData: {
      currency: string | null;
      amount: string | null;
      walletAddress: string | null;
    };
  }) => void;
  onSendComplete?: (data: {
    currency: string;
    amount: string;
    walletAddress: string;
  }) => void;
};

const ACTION_SKILLS = AVAILABLE_SKILLS.filter((s) => s.category === "action");
const CURRENCY_SKILLS = AVAILABLE_SKILLS.filter(
  (s) => s.category === "currency"
);
const RECIPIENT_SKILLS = AVAILABLE_SKILLS.filter(
  (s) => s.category === "recipient"
);

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
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLTextAreaElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [selectedSkillIndex, setSelectedSkillIndex] = React.useState(0);
    const [filteredSkills, setFilteredSkills] =
      React.useState<LoyalSkill[]>(ACTION_SKILLS);
    const [pendingInput, setPendingInput] = React.useState("");
    const [dropdownPosition, setDropdownPosition] = React.useState({
      top: 0,
      left: 0,
    });

    // Swap flow state
    const [swapStep, setSwapStep] = React.useState<
      null | "from_currency" | "amount" | "to_currency"
    >(null);
    const [swapData, setSwapData] = React.useState<{
      fromCurrency: string | null;
      amount: string | null;
      toCurrency: string | null;
    }>({
      fromCurrency: null,
      amount: null,
      toCurrency: null,
    });

    // Send flow state
    const [sendStep, setSendStep] = React.useState<
      null | "currency" | "amount" | "wallet_address"
    >(null);
    const [sendData, setSendData] = React.useState<{
      currency: string | null;
      amount: string | null;
      walletAddress: string | null;
    }>({
      currency: null,
      amount: null,
      walletAddress: null,
    });

    const hasSwapSkill = value.some((skill) => skill.id === "swap");
    const hasSendSkill = value.some((skill) => skill.id === "send");

    // Auto-resize textarea on mount and when pendingInput changes
    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
      }
    }, [pendingInput]);

    // Expose clear method to parent while maintaining textarea element methods
    React.useImperativeHandle(ref, () => {
      const textarea = inputRef.current!;
      return new Proxy(textarea, {
        get(target, prop) {
          if (prop === "clear") {
            return () => {
              setPendingInput("");
              setSwapStep(null);
              setSwapData({
                fromCurrency: null,
                amount: null,
                toCurrency: null,
              });
              setSendStep(null);
              setSendData({
                currency: null,
                amount: null,
                walletAddress: null,
              });
              setIsDropdownOpen(false);
            };
          }
          const value = target[prop as keyof HTMLTextAreaElement];
          return typeof value === "function" ? value.bind(target) : value;
        },
        has(target, prop) {
          if (prop === "clear") {
            return true;
          }
          return prop in target;
        },
      });
    });

    const calculateDropdownPosition = () => {
      if (containerRef.current && inputRef.current) {
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

    const addSkill = (skill: LoyalSkill) => {
      // Handle swap flow
      if (skill.id === "swap") {
        // Add Swap skill to the skills array
        const newSkills = [...value, skill];
        onChange(newSkills);
        setSwapStep("from_currency");
        setFilteredSkills(CURRENCY_SKILLS);
        setIsDropdownOpen(true);
        setSelectedSkillIndex(0);
        calculateDropdownPosition();
      } else if (
        swapStep === "from_currency" &&
        skill.category === "currency"
      ) {
        // Store currency in swapData, DON'T add to skills array
        setSwapData({ ...swapData, fromCurrency: skill.label });
        setSwapStep("amount");
        setIsDropdownOpen(false);
        setPendingInput("");
      } else if (swapStep === "to_currency" && skill.category === "currency") {
        // Store currency in swapData, DON'T add to skills array
        const completedSwap = {
          fromCurrency: swapData.fromCurrency!,
          amount: swapData.amount!,
          toCurrency: skill.label,
        };
        setSwapData({
          fromCurrency: swapData.fromCurrency,
          amount: swapData.amount,
          toCurrency: skill.label,
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
        setIsDropdownOpen(true);
        setSelectedSkillIndex(0);
        calculateDropdownPosition();
      } else if (sendStep === "currency" && skill.category === "currency") {
        // Store currency in sendData, DON'T add to skills array
        setSendData({ ...sendData, currency: skill.label });
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
        setSwapData({ fromCurrency: null, amount: null, toCurrency: null });
        setIsDropdownOpen(false);
      }

      // Reset send flow if Send skill is removed
      if (skillToRemove.id === "send") {
        setSendStep(null);
        setSendData({ currency: null, amount: null, walletAddress: null });
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Allow Shift+Enter to create new lines
      if (e.key === "Enter" && e.shiftKey) {
        return; // Let default behavior create new line
      }

      // Handle amount input during swap
      if (swapStep === "amount") {
        // Prevent default Enter behavior (new line) for swap amount entry
        if (e.key === "Enter") {
          e.preventDefault();
        }
        if (e.key === "Enter" && pendingInput.trim()) {
          const amount = Number.parseFloat(pendingInput.trim());
          if (amount > 0) {
            setSwapData({ ...swapData, amount: pendingInput.trim() });
            setSwapStep("to_currency");
            setPendingInput("");
            // Filter out FROM currency from TO options
            const availableToCurrencies = CURRENCY_SKILLS.filter(
              (curr) => curr.label !== swapData.fromCurrency
            );
            setFilteredSkills(availableToCurrencies);
            setIsDropdownOpen(true);
            setSelectedSkillIndex(0);
            calculateDropdownPosition();
          }
        } else if (e.key === "Backspace" && pendingInput.length === 0) {
          // If input is empty and user presses backspace, go back to FROM currency
          e.preventDefault();
          setSwapData({ fromCurrency: null, amount: null, toCurrency: null });
          setSwapStep("from_currency");
          setFilteredSkills(CURRENCY_SKILLS);
          setIsDropdownOpen(true);
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
          const amount = Number.parseFloat(pendingInput.trim());
          if (amount > 0) {
            setSendData({ ...sendData, amount: pendingInput.trim() });
            setSendStep("wallet_address");
            setPendingInput("");
          }
        } else if (e.key === "Backspace" && pendingInput.length === 0) {
          // If input is empty and user presses backspace, go back to currency selection
          e.preventDefault();
          setSendData({ currency: null, amount: null, walletAddress: null });
          setSendStep("currency");
          setFilteredSkills(CURRENCY_SKILLS);
          setIsDropdownOpen(true);
          setSelectedSkillIndex(0);
          calculateDropdownPosition();
        }
        return;
      }

      // Handle wallet address input during send
      if (sendStep === "wallet_address") {
        // Prevent default Enter behavior (new line) for wallet address entry
        if (e.key === "Enter") {
          e.preventDefault();
        }
        if (e.key === "Enter" && pendingInput.trim()) {
          // Basic validation: wallet address should be non-empty
          const walletAddress = pendingInput.trim();
          if (walletAddress.length > 0) {
            const completedSend = {
              currency: sendData.currency!,
              amount: sendData.amount!,
              walletAddress,
            };
            setSendData({
              ...sendData,
              walletAddress,
            });
            setSendStep(null);
            setPendingInput("");
            // Notify parent that Send is complete
            onSendComplete?.(completedSend);
            // Submit the form immediately after Send is complete
            const form = e.currentTarget.closest("form");
            if (form) {
              // Use setTimeout to allow state updates to complete first
              setTimeout(() => {
                form.requestSubmit();
              }, 0);
            }
          }
        } else if (e.key === "Backspace" && pendingInput.length === 0) {
          // If input is empty and user presses backspace, go back to amount
          e.preventDefault();
          setSendData({ ...sendData, amount: null, walletAddress: null });
          setSendStep("amount");
          setPendingInput("");
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
              inputRef.current?.focus();
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
          // Remove wallet address
          setSendData({ ...sendData, walletAddress: null });
          setSendStep("wallet_address");
          setPendingInput("");
        } else if (sendData.amount) {
          // Remove amount
          setSendData({ ...sendData, amount: null, walletAddress: null });
          setSendStep("amount");
          setPendingInput("");
        } else if (sendData.currency) {
          // Remove currency
          setSendData({ currency: null, amount: null, walletAddress: null });
          setSendStep("currency");
          setFilteredSkills(CURRENCY_SKILLS);
          setIsDropdownOpen(true);
          setSelectedSkillIndex(0);
          calculateDropdownPosition();
        } else if (swapData.toCurrency) {
          // Handle swap data removal in reverse order
          // Remove TO currency
          setSwapData({ ...swapData, toCurrency: null });
          setSwapStep("to_currency");
          const availableToCurrencies = CURRENCY_SKILLS.filter(
            (curr) => curr.label !== swapData.fromCurrency
          );
          setFilteredSkills(availableToCurrencies);
          setIsDropdownOpen(true);
          setSelectedSkillIndex(0);
          calculateDropdownPosition();
        } else if (swapData.amount) {
          // Remove amount
          setSwapData({ ...swapData, amount: null, toCurrency: null });
          setSwapStep("amount");
          setPendingInput("");
        } else if (swapData.fromCurrency) {
          // Remove FROM currency
          setSwapData({ fromCurrency: null, amount: null, toCurrency: null });
          setSwapStep("from_currency");
          setFilteredSkills(CURRENCY_SKILLS);
          setIsDropdownOpen(true);
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

      // Auto-resize textarea based on content
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
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
      // Show swap-specific placeholders during swap flow
      if (swapStep === "from_currency") {
        return "Select FROM currency (SOL, USDC, etc.)...";
      }
      if (swapStep === "amount" && !swapData.amount) {
        return "Type amount (e.g., 10) then press Enter...";
      }
      if (swapStep === "to_currency") {
        return "Select TO currency...";
      }

      // Show send-specific placeholders during send flow
      if (sendStep === "currency") {
        return "Select currency (SOL, USDC, etc.)...";
      }
      if (sendStep === "amount" && !sendData.amount) {
        return "Type amount (e.g., 10) then press Enter...";
      }
      if (sendStep === "wallet_address") {
        return "Type wallet address then press Enter...";
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
      <div style={{ position: "relative", width: "100%", flex: 1 }}>
        <div
          className={cn(
            "flex min-h-[60px] w-full flex-wrap items-center gap-2 rounded-[20px] px-7 py-5 text-base ring-offset-white transition-all",
            "bg-white/5 backdrop-blur-[40px]",
            (hasSwapSkill && !isSwapComplete) ||
              (hasSendSkill && !isSendComplete)
              ? "shadow-[0_0_0_2px_rgba(255,255,255,0.6),0_0_20px_rgba(255,255,255,0.4),0_0_40px_rgba(255,255,255,0.2)]"
              : "",
            isSwapComplete || isSendComplete
              ? "shadow-[0_0_0_2px_rgba(34,197,94,0.6),0_0_20px_rgba(34,197,94,0.4),0_0_40px_rgba(34,197,94,0.2)]"
              : "",
            className
          )}
          ref={containerRef}
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
                    amount: null,
                    toCurrency: null,
                  });
                  setSwapStep("from_currency");
                  setFilteredSkills(CURRENCY_SKILLS);
                  setIsDropdownOpen(true);
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
                  setSwapData({ ...swapData, amount: null, toCurrency: null });
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
                  setSwapData({ ...swapData, toCurrency: null });
                  setSwapStep("to_currency");
                  const availableToCurrencies = CURRENCY_SKILLS.filter(
                    (curr) => curr.label !== swapData.fromCurrency
                  );
                  setFilteredSkills(availableToCurrencies);
                  setIsDropdownOpen(true);
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
                    amount: null,
                    recipient: null,
                  });
                  setSendStep("currency");
                  setFilteredSkills(CURRENCY_SKILLS);
                  setIsDropdownOpen(true);
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
                  setSendData({ ...sendData, amount: null, recipient: null });
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
                "border-blue-400/40 bg-blue-400/25 text-white"
              )}
              title={sendData.walletAddress}
            >
              {sendData.walletAddress.length > 12
                ? `${sendData.walletAddress.slice(0, 6)}...${sendData.walletAddress.slice(-4)}`
                : sendData.walletAddress}
              <button
                className="ml-1 h-3 w-3 cursor-pointer border-0 bg-transparent p-0 transition-transform duration-200 hover:scale-125"
                onClick={() => {
                  setSendData({ ...sendData, walletAddress: null });
                  setSendStep("wallet_address");
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
          <textarea
            {...props}
            className={cn(
              "resize-none overflow-hidden bg-transparent text-white outline-none placeholder:text-white/50",
              getPlaceholder()
                ? "w-full md:w-auto md:min-w-[100px] md:flex-1"
                : "min-w-[100px] flex-1"
            )}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            ref={inputRef}
            rows={1}
            value={pendingInput}
          />
        </div>
        {isDropdownOpen && (
          <SkillDropdown
            onSelect={addSkill}
            position={dropdownPosition}
            selectedIndex={selectedSkillIndex}
            skills={filteredSkills}
            textareaRef={
              containerRef as unknown as React.RefObject<HTMLTextAreaElement>
            }
          />
        )}
      </div>
    );
  }
);

SkillsInput.displayName = "SkillsInput";

export { SkillsInput };
