"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { TokenBalance } from "@/hooks/use-wallet-balances";
import { TokenCard } from "./TokenCard";

// Available swap targets
const SWAP_TARGETS = [
  {
    symbol: "SOL",
    mint: "So11111111111111111111111111111111111111112",
    decimals: 9,
    gradient: "linear-gradient(135deg, #9945FF 0%, #14F195 100%)",
    glow: "rgba(153, 69, 255, 0.4)",
  },
  {
    symbol: "USDC",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
    gradient: "linear-gradient(135deg, #2775CA 0%, #4BA3FF 100%)",
    glow: "rgba(39, 117, 202, 0.4)",
  },
  {
    symbol: "USDT",
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    decimals: 6,
    gradient: "linear-gradient(135deg, #26A17B 0%, #50D9A8 100%)",
    glow: "rgba(38, 161, 123, 0.4)",
  },
  {
    symbol: "BONK",
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    decimals: 5,
    gradient: "linear-gradient(135deg, #F7931A 0%, #FFB74D 100%)",
    glow: "rgba(247, 147, 26, 0.4)",
  },
  {
    symbol: "LOYAL",
    mint: "LYLikzBQtpa9ZgVrJsqYGQpR3cC1WMJrBHaXGrQmeta",
    decimals: 6,
    gradient: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
    glow: "rgba(239, 68, 68, 0.4)",
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

// Shared glass input style
const glassInputStyle = {
  width: "100%",
  padding: "14px 18px",
  background: "rgba(0, 0, 0, 0.25)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "14px",
  color: "#fff",
  fontSize: "15px",
  fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  lineHeight: "22px",
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

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
        const quoteResult = await onGetQuote(
          token.symbol,
          toToken.symbol,
          amount,
          token.mint,
          token.decimals,
          toToken.decimals
        );
        setQuote(quoteResult);
      } catch {
        setQuote(null);
      } finally {
        setQuoteLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchQuote, 500);
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
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        initial={{ opacity: 0, scale: 0.95 }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          padding: "32px 0",
        }}
      >
        <motion.div
          animate={{ scale: [0, 1.2, 1] }}
          style={{
            width: "64px",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
            boxShadow: "0 8px 24px rgba(34, 197, 94, 0.4)",
          }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <svg
            fill="none"
            height="32"
            stroke="#fff"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            viewBox="0 0 24 24"
            width="32"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              fontWeight: 600,
              fontSize: "18px",
              color: "#fff",
              marginBottom: "4px",
            }}
          >
            Swapped {amount} {token.symbol}
          </p>
          <p
            style={{
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              fontSize: "14px",
              color: "rgba(255, 255, 255, 0.5)",
            }}
          >
            → {toToken?.symbol}
          </p>
        </div>
        {result?.signature && (
          <a
            href={`https://solscan.io/tx/${result.signature}`}
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "10px",
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              fontSize: "13px",
              color: "rgba(96, 165, 250, 1)",
              textDecoration: "none",
              transition: "background 0.2s ease",
            }}
            target="_blank"
          >
            View on Solscan
            <span style={{ fontSize: "12px" }}>↗</span>
          </a>
        )}
        <button
          onClick={onCancel}
          style={{
            padding: "12px 24px",
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            color: "#fff",
            fontSize: "14px",
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            fontWeight: 500,
            cursor: "pointer",
            transition: "background 0.2s ease",
          }}
          type="button"
        >
          Done
        </button>
      </motion.div>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        initial={{ opacity: 0, scale: 0.95 }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          padding: "32px 0",
        }}
      >
        <motion.div
          animate={{ scale: [0, 1.2, 1] }}
          style={{
            width: "64px",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            boxShadow: "0 8px 24px rgba(239, 68, 68, 0.4)",
          }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <svg
            fill="none"
            height="32"
            stroke="#fff"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            viewBox="0 0 24 24"
            width="32"
          >
            <line x1="18" x2="6" y1="6" y2="18" />
            <line x1="6" x2="18" y1="6" y2="18" />
          </svg>
        </motion.div>
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              fontWeight: 600,
              fontSize: "18px",
              color: "#fff",
              marginBottom: "8px",
            }}
          >
            Swap Failed
          </p>
          <p
            style={{
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              fontSize: "14px",
              color: "rgba(248, 113, 113, 1)",
              maxWidth: "280px",
            }}
          >
            {result?.error}
          </p>
        </div>
        <button
          onClick={onCancel}
          style={{
            padding: "12px 24px",
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            color: "#fff",
            fontSize: "14px",
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            fontWeight: 500,
            cursor: "pointer",
            transition: "background 0.2s ease",
          }}
          type="button"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Token cards row: from → to */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <TokenCard token={token} />

        {/* Arrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "rgba(255, 255, 255, 0.06)",
            flexShrink: 0,
          }}
        >
          <span style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "16px" }}>
            →
          </span>
        </div>

        {/* To token display */}
        <motion.div
          animate={{
            borderColor: toToken
              ? "rgba(255, 255, 255, 0.15)"
              : "rgba(255, 255, 255, 0.1)",
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            minWidth: "100px",
            padding: "16px 20px",
            background: "rgba(26, 26, 26, 0.4)",
            backdropFilter: "blur(24px) saturate(150%)",
            WebkitBackdropFilter: "blur(24px) saturate(150%)",
            borderRadius: "20px",
            border: toToken
              ? `1px solid ${toToken.glow}`
              : "2px dashed rgba(255, 255, 255, 0.15)",
            boxShadow: toToken
              ? `0 4px 16px rgba(0, 0, 0, 0.2), 0 0 20px ${toToken.glow}`
              : "0 4px 16px rgba(0, 0, 0, 0.2)",
          }}
        >
          {toToken ? (
            <>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: toToken.gradient,
                  boxShadow: `0 4px 12px ${toToken.glow}`,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {toToken.symbol.charAt(0)}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                  fontWeight: 600,
                  fontSize: "15px",
                  color: "#fff",
                }}
              >
                {toToken.symbol}
              </span>
              {quoteLoading ? (
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  style={{
                    fontFamily: "var(--font-geist-mono), monospace",
                    fontSize: "13px",
                    color: "rgba(255, 255, 255, 0.5)",
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                >
                  Loading...
                </motion.span>
              ) : quote ? (
                <span
                  style={{
                    fontFamily: "var(--font-geist-mono), monospace",
                    fontSize: "14px",
                    color: "rgba(255, 255, 255, 0.9)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  ≈ {Number.parseFloat(quote.outputAmount).toFixed(4)}
                </span>
              ) : (
                <span
                  style={{
                    fontFamily: "var(--font-geist-mono), monospace",
                    fontSize: "13px",
                    color: "rgba(255, 255, 255, 0.4)",
                  }}
                >
                  —
                </span>
              )}
            </>
          ) : (
            <>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255, 255, 255, 0.08)",
                }}
              >
                <span
                  style={{
                    fontSize: "20px",
                    color: "rgba(255, 255, 255, 0.4)",
                  }}
                >
                  ?
                </span>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                  fontWeight: 500,
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.5)",
                }}
              >
                Select token
              </span>
            </>
          )}
        </motion.div>
      </div>

      {/* Target token chips */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        {availableTargets.map((target) => {
          const isSelected = toToken?.symbol === target.symbol;
          return (
            <button
              key={target.symbol}
              onClick={() => setToToken(target)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                background: isSelected
                  ? "rgba(255, 255, 255, 0.12)"
                  : "rgba(255, 255, 255, 0.04)",
                border: isSelected
                  ? `1px solid ${target.glow}`
                  : "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "12px",
                color: isSelected ? "#fff" : "rgba(255, 255, 255, 0.7)",
                fontSize: "14px",
                fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: isSelected ? `0 0 12px ${target.glow}` : "none",
              }}
              type="button"
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "6px",
                  background: target.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{ fontSize: "10px", color: "#fff", fontWeight: 700 }}
                >
                  {target.symbol.charAt(0)}
                </span>
              </div>
              {target.symbol}
            </button>
          );
        })}
      </div>

      {/* Amount presets with pill container */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px",
          background: "rgba(255, 255, 255, 0.04)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: "16px",
        }}
      >
        {AMOUNT_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handlePresetClick(preset)}
            style={{
              flex: 1,
              padding: "10px 0",
              background:
                activePreset === preset.value
                  ? "rgba(255, 255, 255, 0.12)"
                  : "transparent",
              border: "none",
              borderRadius: "12px",
              color:
                activePreset === preset.value
                  ? "#fff"
                  : "rgba(255, 255, 255, 0.6)",
              fontSize: "13px",
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            type="button"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Amount input row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div style={{ flex: 1 }}>
          <input
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.00"
            style={{
              ...glassInputStyle,
              textAlign: "right",
              fontFamily: "var(--font-geist-mono), monospace",
              fontVariantNumeric: "tabular-nums",
              fontSize: "20px",
              fontWeight: 500,
              borderColor:
                amount && !isAmountValid
                  ? "rgba(239, 68, 68, 0.5)"
                  : "rgba(255, 255, 255, 0.08)",
              boxShadow:
                amount && !isAmountValid
                  ? "0 0 0 3px rgba(239, 68, 68, 0.15)"
                  : "none",
            }}
            type="text"
            value={amount}
          />
        </div>
        <span
          style={{
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            fontSize: "16px",
            color: "rgba(255, 255, 255, 0.6)",
            fontWeight: 500,
            minWidth: "50px",
          }}
        >
          {token.symbol}
        </span>
      </div>

      {/* Quote display */}
      {quote && toToken && (
        <p
          style={{
            textAlign: "right",
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: "14px",
            color: "rgba(255, 255, 255, 0.5)",
            marginTop: "-16px",
            paddingRight: "70px",
          }}
        >
          ≈ {Number.parseFloat(quote.outputAmount).toFixed(4)} {toToken.symbol}
          {quote.priceImpact && (
            <span
              style={{ marginLeft: "8px", color: "rgba(255, 255, 255, 0.3)" }}
            >
              ({Number.parseFloat(quote.priceImpact).toFixed(2)}% impact)
            </span>
          )}
        </p>
      )}

      {/* Amount error */}
      {amount && amountNum > token.balance && (
        <p
          style={{
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            fontSize: "13px",
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
          paddingTop: "16px",
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <button
          disabled={isLoading}
          onClick={onCancel}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 20px",
            background: "transparent",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "14px",
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          type="button"
        >
          Cancel
        </button>

        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "14px 28px",
            background: canSubmit
              ? "linear-gradient(135deg, #ef4444 0%, #f97316 100%)"
              : "rgba(255, 255, 255, 0.1)",
            border: "none",
            borderRadius: "12px",
            color: canSubmit ? "#fff" : "rgba(255, 255, 255, 0.4)",
            fontSize: "15px",
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            fontWeight: 600,
            cursor: canSubmit ? "pointer" : "not-allowed",
            transition: "all 0.2s ease",
            boxShadow: canSubmit ? "0 4px 16px rgba(239, 68, 68, 0.4)" : "none",
          }}
          type="button"
        >
          {isLoading ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                style={{ display: "inline-flex" }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                ◌
              </motion.span>
              Swapping...
            </>
          ) : (
            <>
              Swap
              <span style={{ fontSize: "16px" }}>⇄</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
