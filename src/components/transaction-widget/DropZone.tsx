"use client";

import { AnimatePresence, motion } from "motion/react";
import type { DragEvent, ReactNode } from "react";
import { useState } from "react";
import type { TokenBalance } from "@/hooks/use-wallet-balances";
import { cn } from "@/lib/utils";

export type DropZoneType = "telegram" | "wallet" | "swap";

interface DropZoneProps {
  type: DropZoneType;
  isExpanded: boolean;
  isDragOver: boolean;
  droppedToken: TokenBalance | null;
  children?: ReactNode;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
}

const ZONE_CONFIG: Record<
  DropZoneType,
  { icon: string; label: string; description: string }
> = {
  telegram: {
    icon: "📱",
    label: "Telegram",
    description: "Send to Telegram user",
  },
  wallet: {
    icon: "👛",
    label: "Wallet",
    description: "Send to Solana address",
  },
  swap: {
    icon: "🔄",
    label: "Swap",
    description: "Exchange for another token",
  },
};

export function DropZone({
  type,
  isExpanded,
  isDragOver,
  droppedToken,
  children,
  onDragOver,
  onDragLeave,
  onDrop,
}: DropZoneProps) {
  const config = ZONE_CONFIG[type];
  const [, setDragCounter] = useState(0);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragCounter((c) => c + 1);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragCounter((c) => {
      const newCount = c - 1;
      if (newCount === 0) {
        onDragLeave(e);
      }
      return newCount;
    });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    onDragOver(e);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragCounter(0);
    onDrop(e);
  };

  return (
    <motion.div
      animate={{
        flex: isExpanded ? 1 : "none",
      }}
      className={cn(
        "overflow-hidden rounded-xl transition-colors",
        !isExpanded && "border-2 border-dashed",
        !isExpanded && isDragOver
          ? "border-white/40 bg-white/10"
          : !isExpanded &&
              "border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/8"
      )}
      layout
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <AnimatePresence mode="wait">
        {isExpanded ? (
          // Expanded state - form content
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="border border-white/10 bg-white/5 p-4 backdrop-blur-md"
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: 10 }}
            key="expanded"
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xl">{config.icon}</span>
              <span className="font-medium text-white">
                {type === "swap" ? "Swap" : "Send"} {droppedToken?.symbol}
                {type === "telegram" && " to Telegram"}
                {type === "wallet" && " to Wallet"}
              </span>
            </div>

            {/* Form content (passed as children) */}
            {children}

            {/* Cancel button is in the form */}
          </motion.div>
        ) : (
          // Collapsed state - just the drop target
          <motion.div
            animate={{ opacity: 1 }}
            className={cn(
              "flex min-w-[100px] flex-col items-center justify-center gap-1 p-4",
              isDragOver && "scale-105"
            )}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            key="collapsed"
            transition={{ duration: 0.15 }}
          >
            <span className="text-2xl">{config.icon}</span>
            <span className="font-medium text-sm text-white/80">
              {config.label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
