"use client";

import { ArrowRight, Check, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { TokenBalance } from "@/hooks/use-wallet-balances";
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

// Shared styles
const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  background: "rgba(0, 0, 0, 0.3)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "16px",
  color: "#fff",
  fontSize: "14px",
  fontFamily: "var(--font-geist-sans), sans-serif",
  lineHeight: "20px",
  outline: "none",
  transition: "border 0.2s ease, box-shadow 0.2s ease",
};

const presetButtonStyle = (isActive: boolean) => ({
  padding: "8px 14px",
  background: isActive ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.2)",
  border: isActive
    ? "1px solid rgba(255, 255, 255, 0.25)"
    : "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "12px",
  color: isActive ? "#fff" : "rgba(255, 255, 255, 0.7)",
  fontSize: "13px",
  fontFamily: "var(--font-geist-sans), sans-serif",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s ease",
});

const tokenChipStyle = (isSelected: boolean) => ({
  padding: "8px 14px",
  background: isSelected ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.2)",
  border: isSelected
    ? "1px solid rgba(255, 255, 255, 0.25)"
    : "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "12px",
  color: isSelected ? "#fff" : "rgba(255, 255, 255, 0.7)",
  fontSize: "13px",
  fontFamily: "var(--font-geist-sans), sans-serif",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease",
});

function getButtonBackground(isPrimary: boolean, isDisabled: boolean): string {
  if (!isPrimary) return "transparent";
  return isDisabled ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.95)";
}

function getButtonColor(isPrimary: boolean, isDisabled: boolean): string {
  if (!isPrimary) return "rgba(255, 255, 255, 0.7)";
  return isDisabled ? "rgba(255, 255, 255, 0.4)" : "#000";
}

const actionButtonStyle = (isPrimary: boolean, isDisabled: boolean) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: isPrimary ? "12px 24px" : "12px 16px",
  background: getButtonBackground(isPrimary, isDisabled),
  border: isPrimary ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "14px",
  color: getButtonColor(isPrimary, isDisabled),
  fontSize: "14px",
  fontFamily: "var(--font-geist-sans), sans-serif",
  fontWeight: 600,
  cursor: isDisabled ? "not-allowed" : "pointer",
  transition: "all 0.2s ease",
  boxShadow:
    isPrimary && !isDisabled ? "0 4px 12px rgba(255, 255, 255, 0.15)" : "none",
});

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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          padding: "24px 0",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: "rgba(34, 197, 94, 0.15)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
          }}
        >
          <Check style={{ width: "28px", height: "28px", color: "#22c55e" }} />
        </div>
        <p
          style={{
            fontFamily: "var(--font-geist-sans), sans-serif",
            fontWeight: 600,
            fontSize: "16px",
            color: "#fff",
          }}
        >
          Swapped {amount} {token.symbol} → {toToken?.symbol}
        </p>
        {result?.signature && (
          <a
            href={`https://solscan.io/tx/${result.signature}`}
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-geist-sans), sans-serif",
              fontSize: "14px",
              color: "rgba(96, 165, 250, 1)",
              textDecoration: "none",
              transition: "opacity 0.2s ease",
            }}
            target="_blank"
          >
            View on Solscan →
          </a>
        )}
        <button
          onClick={onCancel}
          style={{
            ...actionButtonStyle(false, false),
            marginTop: "8px",
          }}
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          padding: "24px 0",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
          }}
        >
          <X style={{ width: "28px", height: "28px", color: "#ef4444" }} />
        </div>
        <p
          style={{
            fontFamily: "var(--font-geist-sans), sans-serif",
            fontWeight: 600,
            fontSize: "16px",
            color: "#fff",
          }}
        >
          Swap failed
        </p>
        <p
          style={{
            fontFamily: "var(--font-geist-sans), sans-serif",
            fontSize: "14px",
            color: "rgba(248, 113, 113, 1)",
            textAlign: "center",
          }}
        >
          {result?.error}
        </p>
        <button
          onClick={onCancel}
          style={{
            ...actionButtonStyle(false, false),
            marginTop: "8px",
          }}
          type="button"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Token cards row: from → to */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <TokenCard token={token} />

        <ArrowRight
          style={{
            width: "20px",
            height: "20px",
            flexShrink: 0,
            color: "rgba(255, 255, 255, 0.4)",
          }}
        />

        {/* To token selector */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
            minWidth: "90px",
            padding: "16px",
            background: "rgba(0, 0, 0, 0.2)",
            backdropFilter: "blur(10px)",
            borderRadius: "20px",
            border: toToken
              ? "1px solid rgba(255, 255, 255, 0.15)"
              : "2px dashed rgba(255, 255, 255, 0.2)",
          }}
        >
          {toToken ? (
            <>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #6B7280 0%, #4B5563 100%)",
                  fontSize: "16px",
                  color: "#fff",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                }}
              >
                {toToken.symbol.charAt(0)}
              </div>
              <span
                style={{
                  fontFamily: "var(--font-geist-sans), sans-serif",
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#fff",
                }}
              >
                {toToken.symbol}
              </span>
              {quoteLoading ? (
                <Loader2
                  style={{
                    width: "14px",
                    height: "14px",
                    color: "rgba(255, 255, 255, 0.5)",
                    animation: "spin 1s linear infinite",
                  }}
                />
              ) : quote ? (
                <span
                  style={{
                    fontFamily: "var(--font-geist-sans), sans-serif",
                    fontSize: "13px",
                    color: "rgba(255, 255, 255, 0.85)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  ≈ {Number.parseFloat(quote.outputAmount).toFixed(4)}
                </span>
              ) : (
                <span
                  style={{
                    fontFamily: "var(--font-geist-sans), sans-serif",
                    fontSize: "12px",
                    color: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  -
                </span>
              )}
            </>
          ) : (
            <>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.1)",
                  fontSize: "16px",
                  color: "rgba(255, 255, 255, 0.5)",
                }}
              >
                ?
              </div>
              <span
                style={{
                  fontFamily: "var(--font-geist-sans), sans-serif",
                  fontWeight: 500,
                  fontSize: "13px",
                  color: "rgba(255, 255, 255, 0.5)",
                }}
              >
                Select
              </span>
            </>
          )}
        </div>
      </div>

      {/* Target token chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {availableTargets.map((target) => (
          <button
            key={target.symbol}
            onClick={() => setToToken(target)}
            style={tokenChipStyle(toToken?.symbol === target.symbol)}
            type="button"
          >
            {target.symbol}
          </button>
        ))}
      </div>

      {/* Amount presets and input */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {AMOUNT_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handlePresetClick(preset)}
            style={presetButtonStyle(activePreset === preset.value)}
            type="button"
          >
            {preset.label}
          </button>
        ))}

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            flex: 1,
            alignItems: "center",
            gap: "10px",
            justifyContent: "flex-end",
          }}
        >
          <input
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.00"
            style={{
              ...inputStyle,
              width: "100px",
              textAlign: "right",
              fontVariantNumeric: "tabular-nums",
              borderColor:
                amount && !isAmountValid
                  ? "rgba(239, 68, 68, 0.5)"
                  : "rgba(255, 255, 255, 0.1)",
            }}
            type="text"
            value={amount}
          />
          <span
            style={{
              fontFamily: "var(--font-geist-sans), sans-serif",
              fontSize: "14px",
              color: "rgba(255, 255, 255, 0.6)",
              fontWeight: 500,
            }}
          >
            {token.symbol}
          </span>
        </div>
      </div>

      {/* Quote display */}
      {quote && toToken && (
        <p
          style={{
            textAlign: "right",
            fontFamily: "var(--font-geist-sans), sans-serif",
            fontSize: "13px",
            color: "rgba(255, 255, 255, 0.5)",
          }}
        >
          ≈ {Number.parseFloat(quote.outputAmount).toFixed(4)} {toToken.symbol}
          {quote.priceImpact && (
            <span style={{ marginLeft: "8px", fontSize: "12px" }}>
              ({Number.parseFloat(quote.priceImpact).toFixed(2)}% impact)
            </span>
          )}
        </p>
      )}

      {/* Amount error */}
      {amount && amountNum > token.balance && (
        <p
          style={{
            fontFamily: "var(--font-geist-sans), sans-serif",
            fontSize: "12px",
            color: "rgba(248, 113, 113, 1)",
          }}
        >
          Exceeds balance ({token.balance.toFixed(4)} {token.symbol} available)
        </p>
      )}

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "8px",
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <button
          disabled={isLoading}
          onClick={onCancel}
          style={actionButtonStyle(false, false)}
          type="button"
        >
          <X style={{ width: "16px", height: "16px" }} />
          Cancel
        </button>

        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          style={actionButtonStyle(true, !canSubmit)}
          type="button"
        >
          {isLoading ? (
            <>
              <Loader2
                style={{
                  width: "16px",
                  height: "16px",
                  animation: "spin 1s linear infinite",
                }}
              />
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
