"use client";

import { motion } from "motion/react";
import type { DragEvent } from "react";
import type { TokenBalance } from "@/hooks/use-wallet-balances";

// Token visual configs with gradients
const TOKEN_CONFIGS: Record<
  string,
  { gradient: string; textGradient: string; glow: string }
> = {
  SOL: {
    gradient: "linear-gradient(135deg, #9945FF 0%, #14F195 100%)",
    textGradient: "linear-gradient(135deg, #9945FF 0%, #14F195 100%)",
    glow: "rgba(153, 69, 255, 0.4)",
  },
  USDC: {
    gradient: "linear-gradient(135deg, #2775CA 0%, #4BA3FF 100%)",
    textGradient: "linear-gradient(135deg, #2775CA 0%, #4BA3FF 100%)",
    glow: "rgba(39, 117, 202, 0.4)",
  },
  USDT: {
    gradient: "linear-gradient(135deg, #26A17B 0%, #50D9A8 100%)",
    textGradient: "linear-gradient(135deg, #26A17B 0%, #50D9A8 100%)",
    glow: "rgba(38, 161, 123, 0.4)",
  },
  BONK: {
    gradient: "linear-gradient(135deg, #F7931A 0%, #FFB74D 100%)",
    textGradient: "linear-gradient(135deg, #F7931A 0%, #FFB74D 100%)",
    glow: "rgba(247, 147, 26, 0.4)",
  },
  LOYAL: {
    gradient: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
    textGradient: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
    glow: "rgba(239, 68, 68, 0.4)",
  },
};

const DEFAULT_CONFIG = {
  gradient: "linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)",
  textGradient: "linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)",
  glow: "rgba(107, 114, 128, 0.4)",
};

type TokenCardProps = {
  token: TokenBalance;
  isDragging?: boolean;
  isOtherDragging?: boolean;
  onDragStart?: (e: DragEvent<HTMLDivElement>, token: TokenBalance) => void;
  onDragEnd?: (e: DragEvent<HTMLDivElement>) => void;
};

function formatBalance(balance: number): string {
  if (balance >= 1_000_000) {
    return `${(balance / 1_000_000).toFixed(2)}M`;
  }
  if (balance >= 1000) {
    return `${(balance / 1000).toFixed(2)}K`;
  }
  if (balance < 0.0001) {
    return balance.toExponential(1);
  }
  return balance.toFixed(balance < 1 ? 4 : 2);
}

function formatUsdValue(balance: number, symbol: string): string {
  const prices: Record<string, number> = {
    SOL: 145,
    USDC: 1,
    USDT: 1,
    BONK: 0.000_01,
    LOYAL: 0.1,
  };
  const price = prices[symbol] ?? 0;
  const value = balance * price;

  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  if (value < 0.01) {
    return "$0.00";
  }
  return `$${value.toFixed(2)}`;
}

export function TokenCard({
  token,
  isDragging = false,
  isOtherDragging = false,
  onDragStart,
  onDragEnd,
}: TokenCardProps) {
  const config = TOKEN_CONFIGS[token.symbol] ?? DEFAULT_CONFIG;

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("application/json", JSON.stringify(token));
    e.dataTransfer.effectAllowed = "move";
    onDragStart?.(e, token);
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    onDragEnd?.(e);
  };

  return (
    <div
      className="shrink-0"
      draggable={Boolean(onDragStart)}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
    >
      <motion.div
        animate={{
          scale: isDragging ? 1.08 : 1,
          opacity: isOtherDragging ? 0.35 : 1,
          y: isDragging ? -8 : 0,
        }}
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          padding: "16px 20px",
          minWidth: "100px",
          background: isDragging
            ? "rgba(255, 255, 255, 0.08)"
            : "rgba(26, 26, 26, 0.4)",
          backdropFilter: "blur(24px) saturate(150%)",
          WebkitBackdropFilter: "blur(24px) saturate(150%)",
          borderRadius: "20px",
          border: isDragging
            ? "1px solid rgba(255, 255, 255, 0.2)"
            : "1px solid rgba(255, 255, 255, 0.06)",
          boxShadow: isDragging
            ? `0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px ${config.glow}`
            : "0 4px 16px rgba(0, 0, 0, 0.2)",
          cursor: onDragStart ? "grab" : "default",
          userSelect: "none",
          overflow: "hidden",
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        whileHover={
          isOtherDragging
            ? {}
            : {
                scale: 1.04,
                y: -4,
                boxShadow: `0 12px 32px rgba(0, 0, 0, 0.3), 0 0 20px ${config.glow}`,
              }
        }
      >
        {/* Glow effect */}
        <motion.div
          animate={{
            opacity: isDragging ? 0.6 : 0,
          }}
          style={{
            position: "absolute",
            top: "0",
            left: "50%",
            transform: "translateX(-50%)",
            width: "80%",
            height: "40px",
            background: config.gradient,
            filter: "blur(30px)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Token icon */}
        <div
          style={{
            position: "relative",
            width: "44px",
            height: "44px",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: config.gradient,
            boxShadow: `0 4px 12px ${config.glow}`,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              fontSize: "18px",
              fontWeight: 700,
              color: "#fff",
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
            }}
          >
            {token.symbol.charAt(0)}
          </span>
        </div>

        {/* Token symbol */}
        <span
          style={{
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            fontWeight: 600,
            fontSize: "15px",
            color: "#fff",
            letterSpacing: "0.02em",
          }}
        >
          {token.symbol}
        </span>

        {/* Balance */}
        <span
          style={{
            fontFamily: "var(--font-geist-mono), monospace",
            fontWeight: 500,
            fontSize: "14px",
            color: "rgba(255, 255, 255, 0.9)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatBalance(token.balance)}
        </span>

        {/* USD value */}
        <span
          style={{
            fontFamily: "var(--font-geist-mono), monospace",
            fontWeight: 400,
            fontSize: "12px",
            color: "rgba(255, 255, 255, 0.5)",
          }}
        >
          {formatUsdValue(token.balance, token.symbol)}
        </span>
      </motion.div>
    </div>
  );
}
