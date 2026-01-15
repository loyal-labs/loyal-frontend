"use client";

import { motion } from "motion/react";
import type { DragEvent } from "react";
import type { TokenBalance } from "@/hooks/use-wallet-balances";
import { cn } from "@/lib/utils";

// Token icon mapping - gradient backgrounds with symbols
const TOKEN_ICONS: Record<string, { gradient: string; symbol: string }> = {
  SOL: {
    gradient: "linear-gradient(135deg, #9945FF 0%, #7B3FE4 100%)",
    symbol: "◉",
  },
  USDC: {
    gradient: "linear-gradient(135deg, #2775CA 0%, #1D5FA8 100%)",
    symbol: "$",
  },
  USDT: {
    gradient: "linear-gradient(135deg, #26A17B 0%, #1E8A68 100%)",
    symbol: "₮",
  },
  BONK: {
    gradient: "linear-gradient(135deg, #F7931A 0%, #E07D0A 100%)",
    symbol: "🐕",
  },
  LOYAL: {
    gradient: "linear-gradient(135deg, #FF4B4B 0%, #D93636 100%)",
    symbol: "♦",
  },
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
    return `${(balance / 1_000_000).toFixed(1)}M`;
  }
  if (balance >= 1000) {
    return `${(balance / 1000).toFixed(1)}K`;
  }
  if (balance < 0.001) {
    return balance.toExponential(2);
  }
  return balance.toFixed(balance < 1 ? 4 : 3);
}

function formatUsdValue(balance: number, symbol: string): string {
  // Rough USD estimates - in production these would come from a price API
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
    return `~$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `~$${(value / 1000).toFixed(1)}K`;
  }
  if (value < 0.01) {
    return "~$0";
  }
  return `~$${value.toFixed(0)}`;
}

export function TokenCard({
  token,
  isDragging = false,
  isOtherDragging = false,
  onDragStart,
  onDragEnd,
}: TokenCardProps) {
  const iconConfig = TOKEN_ICONS[token.symbol] ?? {
    gradient: "linear-gradient(135deg, #6B7280 0%, #4B5563 100%)",
    symbol: "●",
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    // Set drag data
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
          scale: isDragging ? 1.05 : 1,
          opacity: isOtherDragging ? 0.3 : 1,
          y: isDragging ? -4 : 0,
        }}
        className={cn(
          "flex min-w-[90px] flex-col items-center gap-1.5 p-4",
          "select-none",
          onDragStart && "cursor-grab active:cursor-grabbing"
        )}
        style={{
          background: isDragging
            ? "rgba(255, 255, 255, 0.12)"
            : "rgba(38, 38, 38, 0.5)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          borderRadius: "20px",
          border: isDragging
            ? "1px solid rgba(255, 255, 255, 0.25)"
            : "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: isDragging
            ? "0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.15)"
            : "0px 4px 8px rgba(0, 0, 0, 0.08), 0px 2px 4px rgba(0, 0, 0, 0.04)",
          transition: "border 0.2s ease, box-shadow 0.2s ease",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        whileHover={
          isOtherDragging
            ? {}
            : {
                scale: 1.03,
                y: -2,
              }
        }
      >
        {/* Token icon */}
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: iconConfig.gradient,
            fontSize: "16px",
            color: "#fff",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          {iconConfig.symbol}
        </div>

        {/* Token symbol */}
        <span
          style={{
            fontFamily: "var(--font-geist-sans), sans-serif",
            fontWeight: 600,
            fontSize: "14px",
            color: "#fff",
            letterSpacing: "0.01em",
          }}
        >
          {token.symbol}
        </span>

        {/* Balance */}
        <span
          style={{
            fontFamily: "var(--font-geist-sans), sans-serif",
            fontWeight: 500,
            fontSize: "13px",
            color: "rgba(255, 255, 255, 0.85)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatBalance(token.balance)}
        </span>

        {/* USD value */}
        <span
          style={{
            fontFamily: "var(--font-geist-sans), sans-serif",
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
