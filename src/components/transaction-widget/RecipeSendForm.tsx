"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useCallback, useState } from "react";
import type { Recipe } from "@/hooks/use-recipes";

interface RecipeSendFormProps {
  recipe: Recipe;
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
}

const TOKEN_PRICES: Record<string, number> = {
  SOL: 145,
  USDC: 1,
  USDT: 1,
  BONK: 0.000_01,
  LOYAL: 0.1,
};

export function RecipeSendForm({
  recipe,
  onSend,
  onCancel,
  isLoading = false,
  status = null,
  result = null,
}: RecipeSendFormProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const price = TOKEN_PRICES[recipe.tokenSymbol] ?? 0;
  const amountNum = Number.parseFloat(recipe.amount) || 0;
  const usdValue = amountNum * price;

  const handleSubmit = useCallback(() => {
    onSend({
      currency: recipe.tokenSymbol,
      currencyMint: recipe.tokenMint,
      currencyDecimals: recipe.tokenDecimals,
      amount: recipe.amount,
      walletAddress: recipe.recipient,
      destinationType: recipe.type,
    });
  }, [recipe, onSend]);

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
            aria-label="Success"
            fill="none"
            height="32"
            role="img"
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
            Sent {recipe.amount} {recipe.tokenSymbol}
          </p>
          <p
            style={{
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              fontSize: "14px",
              color: "rgba(255, 255, 255, 0.5)",
            }}
          >
            Recipe executed successfully
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
            aria-label="Error"
            fill="none"
            height="32"
            role="img"
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
            Recipe Failed
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

  // Confirmation view
  if (isConfirming) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              fontWeight: 600,
              fontSize: "16px",
              color: "#fff",
              marginBottom: "8px",
            }}
          >
            Confirm Transaction
          </p>
          <p
            style={{
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              fontSize: "13px",
              color: "rgba(255, 255, 255, 0.5)",
            }}
          >
            You&apos;re about to execute this recipe
          </p>
        </div>

        {/* Summary */}
        <div
          style={{
            padding: "16px",
            background: "rgba(255, 255, 255, 0.04)",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                fontSize: "12px",
                color: "rgba(255, 255, 255, 0.5)",
              }}
            >
              Recipient
            </span>
            <span
              style={{
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: "13px",
                color: "#fff",
              }}
            >
              {recipe.type === "telegram" ? `@${recipe.recipient}` : `${recipe.recipient.slice(0, 8)}...`}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                fontSize: "12px",
                color: "rgba(255, 255, 255, 0.5)",
              }}
            >
              Amount
            </span>
            <span
              style={{
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: "13px",
                color: "#fff",
              }}
            >
              {recipe.amount} {recipe.tokenSymbol}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                fontSize: "12px",
                color: "rgba(255, 255, 255, 0.5)",
              }}
            >
              Value
            </span>
            <span
              style={{
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: "13px",
                color: "rgba(255, 255, 255, 0.6)",
              }}
            >
              ≈ ${usdValue >= 0.01 ? usdValue.toFixed(2) : "< 0.01"} USD
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <button
            disabled={isLoading}
            onClick={() => setIsConfirming(false)}
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
            Back
          </button>

          <button
            disabled={isLoading}
            onClick={handleSubmit}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "10px 20px",
              background: "linear-gradient(135deg, #fff 0%, #e5e5e5 100%)",
              border: "none",
              borderRadius: "10px",
              color: "#000",
              fontSize: "14px",
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              fontWeight: 600,
              cursor: isLoading ? "wait" : "pointer",
              transition: "all 0.15s ease",
              boxShadow: "0 2px 8px rgba(255, 255, 255, 0.15)",
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
                Confirm Send
                <span style={{ fontSize: "14px" }}>→</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Default: Recipe preview
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Recipe header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          paddingBottom: "8px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {recipe.photoUrl && (
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <Image
              alt={recipe.name}
              height={40}
              src={recipe.photoUrl}
              style={{ objectFit: "cover" }}
              width={40}
            />
          </div>
        )}
        <div>
          <p
            style={{
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              fontWeight: 600,
              fontSize: "15px",
              color: "#fff",
              marginBottom: "2px",
            }}
          >
            {recipe.name}
          </p>
          <p
            style={{
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              fontSize: "11px",
              color: "rgba(255, 255, 255, 0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Recipe
          </p>
        </div>
      </div>

      {/* Recipe details */}
      <div
        style={{
          padding: "14px",
          background: "rgba(0, 0, 0, 0.2)",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.5)",
            }}
          >
            To
          </span>
          <span
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "13px",
              color: "#fff",
            }}
          >
            {recipe.type === "telegram" ? `@${recipe.recipient}` : `${recipe.recipient.slice(0, 8)}...${recipe.recipient.slice(-4)}`}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.5)",
            }}
          >
            Amount
          </span>
          <span
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "13px",
              color: "#fff",
            }}
          >
            {recipe.amount} {recipe.tokenSymbol}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.5)",
            }}
          >
            Value
          </span>
          <span
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.5)",
            }}
          >
            ≈ ${usdValue >= 0.01 ? usdValue.toFixed(2) : "< 0.01"} USD
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          paddingTop: "4px",
        }}
      >
        <button
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
          onClick={() => setIsConfirming(true)}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "10px 20px",
            background: "linear-gradient(135deg, #fff 0%, #e5e5e5 100%)",
            border: "none",
            borderRadius: "10px",
            color: "#000",
            fontSize: "14px",
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s ease",
            boxShadow: "0 2px 8px rgba(255, 255, 255, 0.15)",
          }}
          type="button"
        >
          Execute Recipe
          <span style={{ fontSize: "14px" }}>→</span>
        </button>
      </div>
    </div>
  );
}
