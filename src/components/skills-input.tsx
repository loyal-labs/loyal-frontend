"use client";

import * as React from "react";
import { XIcon } from "lucide-react";

import { SkillDropdown } from "@/components/ai-elements/skill-dropdown";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AVAILABLE_SKILLS, type LoyalSkill } from "@/types/skills";

type SkillsInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
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
};

const ACTION_SKILLS = AVAILABLE_SKILLS.filter((s) => s.category === "action");
const CURRENCY_SKILLS = AVAILABLE_SKILLS.filter(
  (s) => s.category === "currency"
);
const RECIPIENT_SKILLS = AVAILABLE_SKILLS.filter(
  (s) => s.category === "recipient"
);

const SkillsInput = React.forwardRef<HTMLInputElement, SkillsInputProps>(
  (
    {
      className,
      value,
      onChange,
      onPendingTextChange,
      onSwapFlowChange,
      onSwapComplete,
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
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

    const hasSwapSkill = value.some((skill) => skill.id === "swap");

    // Expose clear method to parent while maintaining input element methods
    React.useImperativeHandle(ref, () => {
      const input = inputRef.current!;
      return new Proxy(input, {
        get(target, prop) {
          if (prop === 'clear') {
            return () => {
              setPendingInput("");
              setSwapStep(null);
              setSwapData({ fromCurrency: null, amount: null, toCurrency: null });
              setIsDropdownOpen(false);
            };
          }
          const value = target[prop as keyof HTMLInputElement];
          return typeof value === 'function' ? value.bind(target) : value;
        },
        has(target, prop) {
          if (prop === 'clear') {
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
      } else {
        // Regular skill (not part of swap flow) - add to array
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
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Handle amount input during swap
      if (swapStep === "amount") {
        if (e.key === "Enter" && pendingInput.trim()) {
          const amount = Number.parseFloat(pendingInput.trim());
          if (amount > 0) {
            e.preventDefault();
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
        } else if (e.key === "Escape") {
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

        // Handle swap data removal in reverse order
        if (swapData.toCurrency) {
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setPendingInput(newValue);

      // Don't open dropdown during amount input
      if (swapStep === "amount" || swapStep === "to_currency") {
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
      // Hide placeholder if there's any content (skills, swap data, or pending text)
      const hasContent =
        value.length > 0 ||
        swapData.fromCurrency ||
        swapData.amount ||
        swapData.toCurrency ||
        pendingInput.length > 0;

      // If there's content, only show placeholders during specific swap steps
      if (hasContent) {
        // Show placeholder only during amount input step
        if (swapStep === "amount" && !swapData.amount) {
          return "Type amount (e.g., 10) then press Enter...";
        }
        // For all other cases with content, hide placeholder
        return "";
      }

      return props.placeholder || "Ask me anything (type / for skills)...";
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

    return (
      <div style={{ position: "relative", width: "100%", flex: 1 }}>
        <div
          className={cn(
            "min-h-[60px] flex w-full flex-wrap items-center gap-2 rounded-[20px] px-7 py-5 text-base ring-offset-white transition-all",
            "bg-white/5 backdrop-blur-[40px]",
            hasSwapSkill && !isSwapComplete
              ? "shadow-[0_0_0_2px_rgba(255,255,255,0.6),0_0_20px_rgba(255,255,255,0.4),0_0_40px_rgba(255,255,255,0.2)]"
              : "",
            isSwapComplete
              ? "shadow-[0_0_0_2px_rgba(34,197,94,0.6),0_0_20px_rgba(34,197,94,0.4),0_0_40px_rgba(34,197,94,0.2)]"
              : "",
            className
          )}
          ref={containerRef}
        >
          {value.map((skill) => (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium",
                "backdrop-blur-[18px] shadow-lg",
                getSkillColor(skill)
              )}
              key={skill.id}
            >
              {skill.label}
              <Button
                className="h-3 w-3 p-0 hover:bg-white/20"
                onClick={() => removeSkill(skill)}
                onFocus={(e) => e.currentTarget.blur()} // Prevent button from stealing focus
                size="icon"
                tabIndex={-1} // Remove from tab order
                type="button" // Prevent form submission
                variant="ghost"
              >
                <XIcon className="h-2.5 w-2.5" />
              </Button>
            </span>
          ))}
          {swapData.fromCurrency && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium",
                "backdrop-blur-[18px] shadow-lg",
                "bg-white/10 border-white/25 text-white"
              )}
            >
              {swapData.fromCurrency}
              <Button
                className="h-3 w-3 p-0 hover:bg-white/20"
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
                size="icon"
                tabIndex={-1}
                type="button"
                variant="ghost"
              >
                <XIcon className="h-2.5 w-2.5" />
              </Button>
            </span>
          )}
          {swapData.amount && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium",
                "backdrop-blur-[18px] shadow-lg",
                "bg-green-400/25 border-green-400/40 text-white"
              )}
            >
              {swapData.amount}
              <Button
                className="h-3 w-3 p-0 hover:bg-white/20"
                onClick={() => {
                  setSwapData({ ...swapData, amount: null, toCurrency: null });
                  setSwapStep("amount");
                  setPendingInput("");
                }}
                onFocus={(e) => e.currentTarget.blur()}
                size="icon"
                tabIndex={-1}
                type="button"
                variant="ghost"
              >
                <XIcon className="h-2.5 w-2.5" />
              </Button>
            </span>
          )}
          {swapData.toCurrency && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium",
                "backdrop-blur-[18px] shadow-lg",
                "bg-white/10 border-white/25 text-white"
              )}
            >
              {swapData.toCurrency}
              <Button
                className="h-3 w-3 p-0 hover:bg-white/20"
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
                size="icon"
                tabIndex={-1}
                type="button"
                variant="ghost"
              >
                <XIcon className="h-2.5 w-2.5" />
              </Button>
            </span>
          )}
          <input
            {...props}
            className={cn(
              "flex-1 outline-none bg-transparent text-white placeholder:text-white/50",
              "min-w-[100px]"
            )}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            ref={inputRef}
            type={swapStep === "amount" ? "text" : "text"}
            value={pendingInput}
          />
        </div>
        {swapStep === "amount" && !swapData.amount && (
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
          </div>
        )}
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
