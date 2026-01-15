"use client";

import { Check, Loader2, X } from "lucide-react";
import { useState } from "react";
import type { TokenBalance } from "@/hooks/use-wallet-balances";
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

function getButtonBackground(isPrimary: boolean, isDisabled: boolean): string {
  if (!isPrimary) return "transparent";
  return isDisabled ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.95)";
}

function getButtonColor(isPrimary: boolean, isDisabled: boolean): string {
  if (!isPrimary) return "rgba(255, 255, 255, 0.7)";
  return isDisabled ? "rgba(255, 255, 255, 0.4)" : "#000";
}

function getInputBorderColor(hasValue: boolean, isValid: boolean): string {
  if (!hasValue) return "rgba(255, 255, 255, 0.1)";
  return isValid ? "rgba(34, 197, 94, 0.5)" : "rgba(239, 68, 68, 0.5)";
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
          Sent {amount} {token.symbol}
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
          Transaction failed
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
      {/* Token card + recipient input row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
        <TokenCard token={token} />

        <div style={{ flex: 1 }}>
          <input
            autoFocus
            onChange={(e) => setRecipient(e.target.value)}
            placeholder={
              destinationType === "telegram"
                ? "Enter @username"
                : "Paste Solana address"
            }
            style={{
              ...inputStyle,
              borderColor: getInputBorderColor(
                Boolean(recipient),
                isRecipientValid
              ),
            }}
            type="text"
            value={recipient}
          />
          {recipient && !isRecipientValid && (
            <p
              style={{
                marginTop: "8px",
                fontFamily: "var(--font-geist-sans), sans-serif",
                fontSize: "12px",
                color: "rgba(248, 113, 113, 1)",
              }}
            >
              {destinationType === "telegram"
                ? "Invalid username (5-32 chars, letters/numbers/_)"
                : "Invalid Solana address"}
            </p>
          )}
        </div>
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

      {/* USD estimate */}
      {amountNum > 0 && (
        <p
          style={{
            textAlign: "right",
            fontFamily: "var(--font-geist-sans), sans-serif",
            fontSize: "13px",
            color: "rgba(255, 255, 255, 0.5)",
          }}
        >
          ~${usdValue >= 0.01 ? usdValue.toFixed(2) : "< 0.01"}
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
