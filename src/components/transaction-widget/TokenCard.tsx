"use client";

import { motion } from "motion/react";
import type { DragEvent } from "react";
import type { TokenBalance } from "@/hooks/use-wallet-balances";
import { cn } from "@/lib/utils";

// Token icon mapping - simple colored circles with symbols
const TOKEN_ICONS: Record<string, { bg: string; symbol: string }> = {
  SOL: { bg: "bg-gradient-to-br from-purple-500 to-purple-700", symbol: "◉" },
  USDC: { bg: "bg-gradient-to-br from-blue-400 to-blue-600", symbol: "◎" },
  USDT: { bg: "bg-gradient-to-br from-green-500 to-green-700", symbol: "₮" },
  BONK: { bg: "bg-gradient-to-br from-orange-400 to-orange-600", symbol: "🐕" },
  LOYAL: { bg: "bg-gradient-to-br from-red-500 to-red-700", symbol: "♦" },
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
    bg: "bg-gradient-to-br from-gray-500 to-gray-700",
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
      draggable
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
          "flex min-w-[80px] flex-col items-center gap-1 rounded-xl p-3",
          "border border-white/10 bg-white/5 backdrop-blur-md",
          "cursor-grab active:cursor-grabbing",
          "select-none transition-colors",
          isDragging && "border-white/20 shadow-lg shadow-white/10",
          !(isDragging || isOtherDragging) &&
            "hover:border-white/15 hover:bg-white/10"
        )}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        whileHover={{ scale: isOtherDragging ? 1 : 1.02 }}
      >
        {/* Token icon */}
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full text-sm text-white",
            iconConfig.bg
          )}
        >
          {iconConfig.symbol}
        </div>

        {/* Token symbol */}
        <span className="font-medium text-sm text-white">{token.symbol}</span>

        {/* Balance */}
        <span className="text-white/80 text-xs tabular-nums">
          {formatBalance(token.balance)}
        </span>

        {/* USD value */}
        <span className="text-white/50 text-xs">
          {formatUsdValue(token.balance, token.symbol)}
        </span>
      </motion.div>
    </div>
  );
}
