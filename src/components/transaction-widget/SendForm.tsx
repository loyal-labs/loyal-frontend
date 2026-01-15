"use client";

import { Check, Loader2, X } from "lucide-react";
import { useState } from "react";
import type { TokenBalance } from "@/hooks/use-wallet-balances";
import { cn } from "@/lib/utils";
import { TokenCard } from "./TokenCard";

type SendFormProps = {
  token: TokenBalance;
  destinationType: "telegram" | "wallet";
  onSend: (data: {
    currency: string;
    currencyMint: string;
    currencyDecimals: number;
    amount: string;
    walletAddress: string;
    destinationType: "wallet" | "telegram";
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  status?: "pending" | "success" | "error" | null;
  result?: { signature?: string; error?: string } | null;
};

const AMOUNT_PRESETS = [
  { label: "25%", value: 0.25 },
  { label: "50%", value: 0.5 },
  { label: "75%", value: 0.75 },
  { label: "Max", value: 1 },
];

// Rough USD prices - in production these would come from a price API
const TOKEN_PRICES: Record<string, number> = {
  SOL: 145,
  USDC: 1,
  USDT: 1,
  BONK: 0.000_01,
  LOYAL: 0.1,
};

function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

function isValidTelegramUsername(username: string): boolean {
  // Remove @ prefix if present
  const clean = username.startsWith("@") ? username.slice(1) : username;
  return /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(clean);
}

export function SendForm({
  token,
  destinationType,
  onSend,
  onCancel,
  isLoading = false,
  status = null,
  result = null,
}: SendFormProps) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [activePreset, setActivePreset] = useState<number | null>(null);

  const price = TOKEN_PRICES[token.symbol] ?? 0;
  const amountNum = Number.parseFloat(amount) || 0;
  const usdValue = amountNum * price;

  // Validation
  const isRecipientValid =
    destinationType === "telegram"
      ? isValidTelegramUsername(recipient)
      : isValidSolanaAddress(recipient);
  const isAmountValid = amountNum > 0 && amountNum <= token.balance;
  const canSubmit = isRecipientValid && isAmountValid && !isLoading;

  const handlePresetClick = (preset: { label: string; value: number }) => {
    const presetAmount = token.balance * preset.value;
    // For small amounts, show more decimals
    const formatted =
      presetAmount < 1 ? presetAmount.toFixed(6) : presetAmount.toFixed(4);
    setAmount(formatted.replace(/\.?0+$/, "")); // Remove trailing zeros
    setActivePreset(preset.value);
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setActivePreset(null);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    const cleanRecipient =
      destinationType === "telegram" && recipient.startsWith("@")
        ? recipient.slice(1)
        : recipient;

    onSend({
      currency: token.symbol,
      currencyMint: token.mint,
      currencyDecimals: token.decimals,
      amount,
      walletAddress: cleanRecipient,
      destinationType,
    });
  };

  // Success state
  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
          <Check className="h-6 w-6 text-green-500" />
        </div>
        <p className="font-medium text-white">
          Sent {amount} {token.symbol}
        </p>
        {result?.signature && (
          <a
            className="text-blue-400 text-sm hover:underline"
            href={`https://solscan.io/tx/${result.signature}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            View on Solscan →
          </a>
        )}
        <button
          className="px-4 py-2 text-sm text-white/70 hover:text-white"
          onClick={onCancel}
          type="button"
        >
          Done
        </button>
      </div>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
          <X className="h-6 w-6 text-red-500" />
        </div>
        <p className="font-medium text-white">Transaction failed</p>
        <p className="text-center text-red-400 text-sm">{result?.error}</p>
        <button
          className="px-4 py-2 text-sm text-white/70 hover:text-white"
          onClick={onCancel}
          type="button"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Token card + recipient input row */}
      <div className="flex items-start gap-4">
        <TokenCard token={token} />

        <div className="flex-1">
          <input
            autoFocus
            className={cn(
              "w-full rounded-lg border bg-white/5 px-3 py-2 text-white placeholder-white/40",
              "focus:outline-none focus:ring-2 focus:ring-white/20",
              recipient && !isRecipientValid
                ? "border-red-500/50"
                : recipient && isRecipientValid
                  ? "border-green-500/50"
                  : "border-white/10"
            )}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder={
              destinationType === "telegram"
                ? "Enter @username"
                : "Paste Solana address"
            }
            type="text"
            value={recipient}
          />
          {recipient && !isRecipientValid && (
            <p className="mt-1 text-red-400 text-xs">
              {destinationType === "telegram"
                ? "Invalid username (5-32 chars, letters/numbers/_)"
                : "Invalid Solana address"}
            </p>
          )}
        </div>
      </div>

      {/* Amount presets and input */}
      <div className="flex flex-wrap items-center gap-2">
        {AMOUNT_PRESETS.map((preset) => (
          <button
            className={cn(
              "rounded-lg px-3 py-1.5 font-medium text-sm transition-colors",
              activePreset === preset.value
                ? "bg-white/20 text-white"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            )}
            key={preset.label}
            onClick={() => handlePresetClick(preset)}
            type="button"
          >
            {preset.label}
          </button>
        ))}

        <div className="ml-auto flex flex-1 items-center gap-2">
          <input
            className={cn(
              "w-24 rounded-lg border bg-white/5 px-3 py-1.5 text-right text-white tabular-nums",
              "focus:outline-none focus:ring-2 focus:ring-white/20",
              amount && !isAmountValid ? "border-red-500/50" : "border-white/10"
            )}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.00"
            type="text"
            value={amount}
          />
          <span className="text-sm text-white/70">{token.symbol}</span>
        </div>
      </div>

      {/* USD estimate */}
      {amountNum > 0 && (
        <p className="text-right text-sm text-white/50">
          ~${usdValue >= 0.01 ? usdValue.toFixed(2) : "< 0.01"}
        </p>
      )}

      {/* Amount error */}
      {amount && amountNum > token.balance && (
        <p className="text-red-400 text-xs">
          Exceeds balance ({token.balance.toFixed(4)} {token.symbol} available)
        </p>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          className="flex items-center gap-1.5 px-3 py-2 text-white/60 transition-colors hover:text-white"
          disabled={isLoading}
          onClick={onCancel}
          type="button"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>

        <button
          className={cn(
            "flex items-center gap-2 rounded-lg px-5 py-2.5 font-medium transition-all",
            canSubmit
              ? "bg-white text-black hover:bg-white/90"
              : "cursor-not-allowed bg-white/20 text-white/50"
          )}
          disabled={!canSubmit}
          onClick={handleSubmit}
          type="button"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              Send
              <span>→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
