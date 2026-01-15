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
  { icon: string; label: string; gradient: string; glow: string }
> = {
  telegram: {
    icon: "✈",
    label: "Telegram",
    gradient: "linear-gradient(135deg, #0088cc 0%, #00a0dc 100%)",
    glow: "rgba(0, 136, 204, 0.4)",
  },
  wallet: {
    icon: "↗",
    label: "Wallet",
    gradient: "linear-gradient(135deg, #9945FF 0%, #14F195 100%)",
    glow: "rgba(153, 69, 255, 0.4)",
  },
  swap: {
    icon: "⇄",
    label: "Swap",
    gradient: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
    glow: "rgba(239, 68, 68, 0.4)",
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

  // Compute background based on state
  const getBackground = () => {
    if (isExpanded) return "rgba(26, 26, 26, 0.5)";
    if (isDragOver) return "rgba(255, 255, 255, 0.08)";
    return "rgba(26, 26, 26, 0.3)";
  };

  // Compute border based on state
  const getBorder = () => {
    if (isExpanded) return "1px solid rgba(255, 255, 255, 0.1)";
    if (isDragOver) return `2px solid ${config.glow}`;
    return "1px solid rgba(255, 255, 255, 0.06)";
  };

  // Compute shadow based on state
  const getShadow = () => {
    if (isDragOver) {
      return `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px ${config.glow}, inset 0 1px 0 0 rgba(255, 255, 255, 0.05)`;
    }
    if (isExpanded) {
      return "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.03)";
    }
    return "0 4px 16px rgba(0, 0, 0, 0.15)";
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
        position: "relative",
        overflow: "hidden",
        borderRadius: isExpanded ? "24px" : "20px",
        background: getBackground(),
        backdropFilter: "blur(24px) saturate(150%)",
        WebkitBackdropFilter: "blur(24px) saturate(150%)",
        border: getBorder(),
        boxShadow: getShadow(),
        transition:
          "background 0.3s ease, border 0.3s ease, box-shadow 0.3s ease, border-radius 0.3s ease",
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {/* Glow effect when dragging over */}
      <motion.div
        animate={{
          opacity: isDragOver ? 0.5 : 0,
        }}
        style={{
          position: "absolute",
          top: "-20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          height: "60px",
          background: config.gradient,
          filter: "blur(40px)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
        }}
        transition={{ duration: 0.3 }}
      />

      <AnimatePresence mode="wait">
        {isExpanded ? (
          // Expanded state - form content
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: 10 }}
            key="expanded"
            style={{
              position: "relative",
              zIndex: 1,
              padding: "24px",
            }}
            transition={{ duration: 0.25 }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
                paddingBottom: "16px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              {/* Icon container */}
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: config.gradient,
                  boxShadow: `0 4px 12px ${config.glow}`,
                  fontSize: "18px",
                }}
              >
                {config.icon}
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "2px" }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                    fontWeight: 600,
                    fontSize: "16px",
                    color: "#fff",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {type === "swap" ? "Swap" : "Send"} {droppedToken?.symbol}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                    fontSize: "13px",
                    color: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  {type === "telegram" && "via Telegram"}
                  {type === "wallet" && "to Wallet Address"}
                  {type === "swap" && "for another token"}
                </span>
              </div>
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
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "16px 20px",
              minWidth: "110px",
              minHeight: "120px",
            }}
            transition={{ duration: 0.2 }}
          >
            {/* Icon */}
            <motion.div
              animate={{
                scale: isDragOver ? 1.1 : 1,
                rotate: isDragOver ? 10 : 0,
              }}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isDragOver
                  ? config.gradient
                  : "rgba(255, 255, 255, 0.06)",
                boxShadow: isDragOver
                  ? `0 4px 16px ${config.glow}`
                  : "0 2px 8px rgba(0, 0, 0, 0.1)",
                fontSize: "18px",
                transition: "background 0.3s ease, box-shadow 0.3s ease",
              }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              {config.icon}
            </motion.div>

            {/* Label */}
            <span
              style={{
                fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                color: isDragOver ? "#fff" : "rgba(255, 255, 255, 0.6)",
                transition: "color 0.2s ease",
              }}
            >
              {config.label}
            </span>

            {/* Drag hint */}
            <motion.span
              animate={{
                opacity: isDragOver ? 1 : 0,
                y: isDragOver ? 0 : 5,
              }}
              style={{
                fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                fontSize: "11px",
                color: "rgba(255, 255, 255, 0.4)",
              }}
              transition={{ duration: 0.2 }}
            >
              Drop here
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
