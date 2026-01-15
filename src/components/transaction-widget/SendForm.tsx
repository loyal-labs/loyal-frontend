"use client";

import { motion } from "motion/react";
import { useState } from "react";
import type { TokenBalance } from "@/hooks/use-wallet-balances";

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
  const clean = username.startsWith("@") ? username.slice(1) : username;
  return /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(clean);
}

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

  // Get input border color based on validation
  const getInputBorder = (hasValue: boolean, isValid: boolean): string => {
    if (!hasValue) return "rgba(255, 255, 255, 0.08)";
    return isValid ? "rgba(34, 197, 94, 0.5)" : "rgba(239, 68, 68, 0.5)";
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
            Sent {amount} {token.symbol}
          </p>
          <p
            style={{
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              fontSize: "14px",
              color: "rgba(255, 255, 255, 0.5)",
            }}
          >
            Transaction successful
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
            Transaction Failed
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
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Recipient input - main focus */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label
          style={{
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            color: "rgba(255, 255, 255, 0.5)",
            paddingLeft: "2px",
          }}
        >
          {destinationType === "telegram" ? "Recipient" : "Wallet Address"}
        </label>
        <input
          autoFocus
          onChange={(e) => setRecipient(e.target.value)}
          placeholder={
            destinationType === "telegram" ? "@username" : "Enter Solana address..."
          }
          style={{
            ...glassInputStyle,
            padding: "12px 14px",
            fontSize: "14px",
            borderColor: getInputBorder(Boolean(recipient), isRecipientValid),
            boxShadow:
              recipient && isRecipientValid
                ? "0 0 0 2px rgba(34, 197, 94, 0.15)"
                : recipient && !isRecipientValid
                  ? "0 0 0 2px rgba(239, 68, 68, 0.15)"
                  : "none",
          }}
          type="text"
          value={recipient}
        />
        {recipient && !isRecipientValid && (
          <p
            style={{
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              fontSize: "11px",
              color: "rgba(248, 113, 113, 1)",
              paddingLeft: "2px",
            }}
          >
            {destinationType === "telegram"
              ? "Invalid username format"
              : "Invalid Solana address"}
          </p>
        )}
      </div>

      {/* Amount section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <label
            style={{
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              color: "rgba(255, 255, 255, 0.5)",
              paddingLeft: "2px",
            }}
          >
            Amount
          </label>
          <span
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "11px",
              color: "rgba(255, 255, 255, 0.4)",
            }}
          >
            Balance: {token.balance.toFixed(4)} {token.symbol}
          </span>
        </div>

        {/* Amount input with token badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px",
            background: "rgba(0, 0, 0, 0.25)",
            border: amount && !isAmountValid
              ? "1px solid rgba(239, 68, 68, 0.5)"
              : "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "14px",
          }}
        >
          <input
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.00"
            style={{
              flex: 1,
              padding: "8px 10px",
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "18px",
              fontFamily: "var(--font-geist-mono), monospace",
              fontVariantNumeric: "tabular-nums",
              fontWeight: 500,
              outline: "none",
              textAlign: "left",
            }}
            type="text"
            value={amount}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 10px",
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: "10px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                color: "#fff",
              }}
            >
              {token.symbol}
            </span>
          </div>
        </div>

        {/* Presets row */}
        <div style={{ display: "flex", gap: "6px" }}>
          {AMOUNT_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePresetClick(preset)}
              style={{
                flex: 1,
                padding: "6px 0",
                background:
                  activePreset === preset.value
                    ? "rgba(255, 255, 255, 0.12)"
                    : "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                borderRadius: "8px",
                color:
                  activePreset === preset.value
                    ? "#fff"
                    : "rgba(255, 255, 255, 0.5)",
                fontSize: "12px",
                fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              type="button"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* USD estimate */}
        {amountNum > 0 && (
          <p
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.4)",
              paddingLeft: "2px",
            }}
          >
            ≈ ${usdValue >= 0.01 ? usdValue.toFixed(2) : "< 0.01"} USD
          </p>
        )}

        {/* Amount error */}
        {amount && amountNum > token.balance && (
          <p
            style={{
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              fontSize: "11px",
              color: "rgba(248, 113, 113, 1)",
              paddingLeft: "2px",
            }}
          >
            Exceeds available balance
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          paddingTop: "8px",
        }}
      >
        <button
          disabled={isLoading}
          onClick={onCancel}
          style={{
            padding: "10px 16px",
            background: "transparent",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "10px",
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: "13px",
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          type="button"
        >
          Cancel
        </button>

        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "10px 20px",
            background: canSubmit
              ? "linear-gradient(135deg, #fff 0%, #e5e5e5 100%)"
              : "rgba(255, 255, 255, 0.08)",
            border: "none",
            borderRadius: "10px",
            color: canSubmit ? "#000" : "rgba(255, 255, 255, 0.3)",
            fontSize: "14px",
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            fontWeight: 600,
            cursor: canSubmit ? "pointer" : "not-allowed",
            transition: "all 0.15s ease",
            boxShadow: canSubmit
              ? "0 2px 8px rgba(255, 255, 255, 0.15)"
              : "none",
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
              Sending...
            </>
          ) : (
            <>
              Send {token.symbol}
              <span style={{ fontSize: "14px" }}>→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
