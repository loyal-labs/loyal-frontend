"use client";

import { ArrowRight, Check, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { TokenBalance } from "@/hooks/use-wallet-balances";
import { cn } from "@/lib/utils";
import { TokenCard } from "./TokenCard";

// Available swap targets
const SWAP_TARGETS = [
  {
    symbol: "SOL",
    mint: "So11111111111111111111111111111111111111112",
    decimals: 9,
  },
  {
    symbol: "USDC",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
  },
  {
    symbol: "USDT",
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    decimals: 6,
  },
  {
    symbol: "BONK",
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    decimals: 5,
  },
  {
    symbol: "LOYAL",
    mint: "LYLikzBQtpa9ZgVrJsqYGQpR3cC1WMJrBHaXGrQmeta",
    decimals: 6,
  },
];

type SwapFormProps = {
  token: TokenBalance;
  onSwap: (data: {
    fromCurrency: string;
    fromCurrencyMint: string;
    fromCurrencyDecimals: number;
    amount: string;
    toCurrency: string;
    toCurrencyMint: string;
    toCurrencyDecimals: number;
  }) => void;
  onCancel: () => void;
  onGetQuote: (
    fromToken: string,
    toToken: string,
    amount: string,
    fromMint?: string,
    fromDecimals?: number,
    toDecimals?: number
  ) => Promise<{ outputAmount: string; priceImpact?: string } | null>;
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

export function SwapForm({
  token,
  onSwap,
  onCancel,
  onGetQuote,
  isLoading = false,
  status = null,
  result = null,
}: SwapFormProps) {
  const [toToken, setToToken] = useState<(typeof SWAP_TARGETS)[number] | null>(
    null
  );
  const [amount, setAmount] = useState("");
  const [activePreset, setActivePreset] = useState<number | null>(null);
  const [quote, setQuote] = useState<{
    outputAmount: string;
    priceImpact?: string;
  } | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const amountNum = Number.parseFloat(amount) || 0;
  const isAmountValid = amountNum > 0 && amountNum <= token.balance;
  const canSubmit = toToken && isAmountValid && quote && !isLoading;

  // Available targets (excluding the from token)
  const availableTargets = SWAP_TARGETS.filter(
    (t) => t.symbol !== token.symbol
  );

  // Fetch quote when amount or toToken changes
  useEffect(() => {
    if (!(toToken && isAmountValid)) {
      setQuote(null);
      return;
    }

    const fetchQuote = async () => {
      setQuoteLoading(true);
      try {
        const result = await onGetQuote(
          token.symbol,
          toToken.symbol,
          amount,
          token.mint,
          token.decimals,
          toToken.decimals
        );
        setQuote(result);
      } catch {
        setQuote(null);
      } finally {
        setQuoteLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchQuote, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [toToken, amount, isAmountValid, token, onGetQuote]);

  const handlePresetClick = (preset: { label: string; value: number }) => {
    const presetAmount = token.balance * preset.value;
    const formatted =
      presetAmount < 1 ? presetAmount.toFixed(6) : presetAmount.toFixed(4);
    setAmount(formatted.replace(/\.?0+$/, ""));
    setActivePreset(preset.value);
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setActivePreset(null);
  };

  const handleSubmit = () => {
    if (!(canSubmit && toToken)) return;

    onSwap({
      fromCurrency: token.symbol,
      fromCurrencyMint: token.mint,
      fromCurrencyDecimals: token.decimals,
      amount,
      toCurrency: toToken.symbol,
      toCurrencyMint: toToken.mint,
      toCurrencyDecimals: toToken.decimals,
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
          Swapped {amount} {token.symbol} → {toToken?.symbol}
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
        <p className="font-medium text-white">Swap failed</p>
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
      {/* Token cards row: from → to */}
      <div className="flex items-center gap-3">
        <TokenCard token={token} />

        <ArrowRight className="h-5 w-5 shrink-0 text-white/50" />

        {/* To token selector */}
        <div
          className={cn(
            "flex min-w-[80px] flex-col items-center gap-1 rounded-xl p-3",
            "border border-dashed bg-white/5 backdrop-blur-md",
            toToken ? "border-white/20" : "border-white/30"
          )}
        >
          {toToken ? (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-500 to-gray-700 text-sm text-white">
                ?
              </div>
              <span className="font-medium text-sm text-white">
                {toToken.symbol}
              </span>
              {quoteLoading ? (
                <Loader2 className="h-3 w-3 animate-spin text-white/50" />
              ) : quote ? (
                <span className="text-white/80 text-xs tabular-nums">
                  ≈ {Number.parseFloat(quote.outputAmount).toFixed(4)}
                </span>
              ) : (
                <span className="text-white/50 text-xs">-</span>
              )}
            </>
          ) : (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm text-white/50">
                ?
              </div>
              <span className="font-medium text-sm text-white/50">Select</span>
            </>
          )}
        </div>
      </div>

      {/* Target token chips */}
      <div className="flex flex-wrap gap-2">
        {availableTargets.map((target) => (
          <button
            className={cn(
              "rounded-lg px-3 py-1.5 font-medium text-sm transition-colors",
              toToken?.symbol === target.symbol
                ? "bg-white/20 text-white"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            )}
            key={target.symbol}
            onClick={() => setToToken(target)}
            type="button"
          >
            {target.symbol}
          </button>
        ))}
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

      {/* Quote display */}
      {quote && toToken && (
        <div className="text-right text-sm text-white/50">
          ≈ {Number.parseFloat(quote.outputAmount).toFixed(4)} {toToken.symbol}
          {quote.priceImpact && (
            <span className="ml-2 text-xs">
              ({Number.parseFloat(quote.priceImpact).toFixed(2)}% impact)
            </span>
          )}
        </div>
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
              Swapping...
            </>
          ) : (
            <>
              Swap
              <span>⇄</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
