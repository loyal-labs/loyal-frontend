"use client";

import { AnimatePresence, motion } from "motion/react";
import type { DragEvent, ReactNode } from "react";
import { useState } from "react";
import type { TokenBalance } from "@/hooks/use-wallet-balances";

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
    description: "Send to address",
  },
  swap: {
    icon: "🔄",
    label: "Swap",
    description: "Exchange tokens",
  },
};

function getZoneBackground(isExpanded: boolean, isDragOver: boolean): string {
  if (isExpanded) return "rgba(38, 38, 38, 0.5)";
  if (isDragOver) return "rgba(255, 255, 255, 0.12)";
  return "rgba(38, 38, 38, 0.4)";
}

function getZoneBorder(isExpanded: boolean, isDragOver: boolean): string {
  if (isExpanded) return "1px solid rgba(255, 255, 255, 0.12)";
  if (isDragOver) return "2px dashed rgba(255, 255, 255, 0.4)";
  return "2px dashed rgba(255, 255, 255, 0.15)";
}

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
      layout
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        overflow: "hidden",
        borderRadius: isExpanded ? "24px" : "16px",
        background: getZoneBackground(isExpanded, isDragOver),
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: getZoneBorder(isExpanded, isDragOver),
        boxShadow: isDragOver
          ? "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)"
          : "0px 4px 8px rgba(0, 0, 0, 0.04), 0px 2px 4px rgba(0, 0, 0, 0.02)",
        transition:
          "background 0.2s ease, border 0.2s ease, box-shadow 0.2s ease, border-radius 0.3s ease",
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <AnimatePresence mode="wait">
        {isExpanded ? (
          // Expanded state - form content
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: 10 }}
            key="expanded"
            style={{
              padding: "20px",
            }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "20px",
                paddingBottom: "16px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <span style={{ fontSize: "24px" }}>{config.icon}</span>
              <span
                style={{
                  fontFamily: "var(--font-geist-sans), sans-serif",
                  fontWeight: 600,
                  fontSize: "16px",
                  color: "#fff",
                  letterSpacing: "0.01em",
                }}
              >
                {type === "swap" ? "Swap" : "Send"} {droppedToken?.symbol}
                {type === "telegram" && " via Telegram"}
                {type === "wallet" && " to Wallet"}
              </span>
            </div>

            {/* Form content (passed as children) */}
            {children}
          </motion.div>
        ) : (
          // Collapsed state - just the drop target
          <motion.div
            animate={{
              opacity: 1,
              scale: isDragOver ? 1.02 : 1,
            }}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            key="collapsed"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "16px 20px",
              minWidth: "90px",
            }}
            transition={{ duration: 0.15 }}
          >
            <span style={{ fontSize: "24px" }}>{config.icon}</span>
            <span
              style={{
                fontFamily: "var(--font-geist-sans), sans-serif",
                fontWeight: 500,
                fontSize: "13px",
                color: isDragOver ? "#fff" : "rgba(255, 255, 255, 0.7)",
                transition: "color 0.2s ease",
              }}
            >
              {config.label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
