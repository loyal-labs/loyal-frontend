"use client";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  Send,
  XCircle,
} from "lucide-react";
import { useState } from "react";

const BUTTON_DISABLED_OPACITY = 0.5;
const BUTTON_LOADING_OPACITY = 0.6;

export type SendTransactionData = {
  currency: string;
  amount: string;
  walletAddress: string;
};

type SendTransactionWidgetProps = {
  sendData: SendTransactionData;
  onApprove: () => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  status?: "pending" | "success" | "error" | null;
  result?: {
    signature?: string;
    error?: string;
  } | null;
};

export function SendTransactionWidget({
  sendData,
  onApprove,
  onCancel,
  loading = false,
  status = null,
  result = null,
}: SendTransactionWidgetProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleApprove = async () => {
    setIsExecuting(true);
    try {
      await onApprove();
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(sendData.walletAddress);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  // Truncate wallet address for display
  const truncatedAddress =
    sendData.walletAddress.length > 20
      ? `${sendData.walletAddress.slice(0, 8)}...${sendData.walletAddress.slice(-6)}`
      : sendData.walletAddress;

  return (
    <div
      style={{
        background: "rgba(15, 15, 15, 0.85)",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor:
          status === "success"
            ? "rgba(134, 239, 172, 0.5)"
            : status === "error"
              ? "rgba(248, 113, 113, 0.5)"
              : status === "pending"
                ? "rgba(251, 191, 36, 0.5)"
                : "rgba(255, 255, 255, 0.12)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        boxShadow:
          status === "success"
            ? "0 8px 32px rgba(134, 239, 172, 0.3), 0 2px 8px rgba(134, 239, 172, 0.2), inset 0 1px 0 rgba(134, 239, 172, 0.1)"
            : status === "error"
              ? "0 8px 32px rgba(248, 113, 113, 0.3), 0 2px 8px rgba(248, 113, 113, 0.2), inset 0 1px 0 rgba(248, 113, 113, 0.1)"
              : status === "pending"
                ? "0 8px 32px rgba(251, 191, 36, 0.3), 0 2px 8px rgba(251, 191, 36, 0.2), inset 0 1px 0 rgba(251, 191, 36, 0.1)"
                : "0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
        borderRadius: "20px",
        padding: "1.75rem",
        maxWidth: "420px",
        width: "100%",
        color: "rgba(255, 255, 255, 0.9)",
        animation:
          status === "success" || status === "error"
            ? "borderBlink 0.6s ease-in-out 1"
            : status === "pending"
              ? "borderPulse 1.5s ease-in-out infinite"
              : "none",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.875rem",
          marginBottom: "1.5rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            minWidth: "44px",
            minHeight: "44px",
            borderRadius: "14px",
            background:
              status === "success"
                ? "linear-gradient(135deg, rgba(134, 239, 172, 0.15) 0%, rgba(34, 197, 94, 0.15) 100%)"
                : status === "error"
                  ? "linear-gradient(135deg, rgba(248, 113, 113, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%)"
                  : status === "pending"
                    ? "linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)"
                    : "linear-gradient(135deg, rgba(134, 239, 172, 0.15) 0%, rgba(34, 197, 94, 0.15) 100%)",
            border:
              status === "success"
                ? "1px solid rgba(134, 239, 172, 0.25)"
                : status === "error"
                  ? "1px solid rgba(248, 113, 113, 0.25)"
                  : status === "pending"
                    ? "1px solid rgba(251, 191, 36, 0.25)"
                    : "1px solid rgba(134, 239, 172, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow:
              status === "success"
                ? "0 2px 8px rgba(134, 239, 172, 0.15)"
                : status === "error"
                  ? "0 2px 8px rgba(248, 113, 113, 0.15)"
                  : status === "pending"
                    ? "0 2px 8px rgba(251, 191, 36, 0.15)"
                    : "0 2px 8px rgba(134, 239, 172, 0.15)",
          }}
        >
          {status === "success" ? (
            <CheckCircle2
              size={24}
              style={{ color: "rgba(134, 239, 172, 0.9)" }}
            />
          ) : status === "error" ? (
            <XCircle size={24} style={{ color: "rgba(248, 113, 113, 0.9)" }} />
          ) : status === "pending" ? (
            <Loader2
              size={24}
              style={{
                color: "rgba(251, 191, 36, 0.9)",
                animation: "spin 0.8s linear infinite",
              }}
            />
          ) : (
            <Send size={24} style={{ color: "rgba(134, 239, 172, 0.9)" }} />
          )}
        </div>
        <div>
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              margin: 0,
              color: "rgba(255, 255, 255, 0.95)",
              letterSpacing: "-0.01em",
            }}
          >
            {status === "success"
              ? "Send Successful!"
              : status === "error"
                ? "Transaction Failed"
                : status === "pending"
                  ? "Processing Send..."
                  : "Send Preview"}
          </h3>
          <p
            style={{
              fontSize: "0.8125rem",
              color: "rgba(255, 255, 255, 0.5)",
              margin: 0,
              marginTop: "0.125rem",
              wordBreak: "break-word",
            }}
          >
            {status === "success"
              ? "Transaction confirmed"
              : status === "error"
                ? result?.error || "Transaction failed"
                : status === "pending"
                  ? "Confirming transaction on blockchain..."
                  : "Review transaction details"}
          </p>
        </div>
      </div>

      {/* Transaction Details */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.04)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          padding: "1.25rem",
          marginBottom: "1rem",
          boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Amount */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <span
            style={{
              fontSize: "0.8125rem",
              color: "rgba(255, 255, 255, 0.5)",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            You send
          </span>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.95)",
                letterSpacing: "-0.01em",
              }}
            >
              {sendData.amount} {sendData.currency}
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "0.75rem 0",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background:
                "linear-gradient(135deg, rgba(134, 239, 172, 0.12) 0%, rgba(34, 197, 94, 0.12) 100%)",
              border: "1px solid rgba(134, 239, 172, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowRight
              size={20}
              style={{ color: "rgba(134, 239, 172, 0.9)" }}
            />
          </div>
        </div>

        {/* Recipient */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <span
            style={{
              fontSize: "0.8125rem",
              color: "rgba(255, 255, 255, 0.5)",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            To address
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <div
              style={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "rgba(134, 239, 172, 1)",
                letterSpacing: "-0.01em",
                fontFamily: "monospace",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                flex: 1,
              }}
              title={sendData.walletAddress}
            >
              {truncatedAddress}
            </div>
            <button
              onClick={handleCopyAddress}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(134, 239, 172, 0.15)";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(134, 239, 172, 0.08)";
                e.currentTarget.style.transform = "scale(1)";
              }}
              style={{
                padding: "0.375rem",
                background: "rgba(134, 239, 172, 0.08)",
                border: "1px solid rgba(134, 239, 172, 0.2)",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
              title="Copy full address"
              type="button"
            >
              {isCopied ? (
                <Check
                  size={16}
                  style={{ color: "rgba(134, 239, 172, 1)" }}
                />
              ) : (
                <Copy
                  size={16}
                  style={{ color: "rgba(134, 239, 172, 0.9)" }}
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Network Fee Info */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: "12px",
          padding: "0.875rem 1rem",
          marginBottom: "1.25rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.8125rem",
          }}
        >
          <span
            style={{
              color: "rgba(255, 255, 255, 0.45)",
              fontWeight: 500,
            }}
          >
            Network Fee
          </span>
          <span
            style={{
              color: "rgba(255, 255, 255, 0.85)",
              fontWeight: 600,
            }}
          >
            ~0.000005 SOL
          </span>
        </div>
      </div>

      {/* Transaction Signature (Success) */}
      {status === "success" && result?.signature && (
        <div
          style={{
            background: "rgba(134, 239, 172, 0.08)",
            border: "1px solid rgba(134, 239, 172, 0.2)",
            borderRadius: "12px",
            padding: "0.875rem 1rem",
            marginBottom: "1.25rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              fontSize: "0.8125rem",
            }}
          >
            <span
              style={{
                color: "rgba(134, 239, 172, 0.9)",
                fontWeight: 600,
              }}
            >
              Transaction Signature
            </span>
            <a
              href={`https://solscan.io/tx/${result.signature}`}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "rgba(134, 239, 172, 1)";
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(147, 197, 253, 0.9)";
                e.currentTarget.style.textDecoration = "none";
              }}
              style={{
                color: "rgba(147, 197, 253, 0.9)",
                fontFamily: "monospace",
                fontSize: "0.75rem",
                wordBreak: "break-all",
                textDecoration: "none",
                transition: "all 0.2s ease",
                cursor: "pointer",
              }}
            >
              {result.signature}
            </a>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!status || status === "pending" ? (
        status === "pending" ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              padding: "1.25rem",
              background: "rgba(251, 191, 36, 0.08)",
              border: "1px solid rgba(251, 191, 36, 0.2)",
              borderRadius: "14px",
              color: "rgba(251, 191, 36, 0.9)",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            <Loader2
              size={18}
              style={{
                animation: "spin 0.8s linear infinite",
              }}
            />
            <span>Transaction in progress...</span>
          </div>
        ) : (
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            disabled={isExecuting}
            onClick={onCancel}
            onMouseEnter={(e) => {
              if (!isExecuting) {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0, 0, 0, 0.15)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
            }}
            style={{
              flex: 1,
              padding: "0.875rem 1.5rem",
              borderRadius: "14px",
              fontSize: "0.875rem",
              fontWeight: 600,
              border: "1px solid rgba(255, 255, 255, 0.12)",
              background: "rgba(255, 255, 255, 0.04)",
              color: "rgba(255, 255, 255, 0.75)",
              cursor: isExecuting ? "not-allowed" : "pointer",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              opacity: isExecuting ? BUTTON_DISABLED_OPACITY : 1,
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              letterSpacing: "0.01em",
            }}
            type="button"
          >
            Cancel
          </button>
          <button
            disabled={isExecuting || loading}
            onClick={handleApprove}
            onMouseEnter={(e) => {
              if (!(isExecuting || loading)) {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, rgba(134, 239, 172, 0.28) 0%, rgba(34, 197, 94, 0.28) 100%)";
                e.currentTarget.style.borderColor = "rgba(134, 239, 172, 0.5)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(134, 239, 172, 0.25), 0 4px 8px rgba(0, 0, 0, 0.15)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, rgba(134, 239, 172, 0.18) 0%, rgba(34, 197, 94, 0.18) 100%)";
              e.currentTarget.style.borderColor = "rgba(134, 239, 172, 0.35)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(134, 239, 172, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)";
            }}
            style={{
              flex: 1,
              padding: "0.875rem 1.5rem",
              borderRadius: "14px",
              fontSize: "0.875rem",
              fontWeight: 600,
              border: "1px solid rgba(134, 239, 172, 0.35)",
              background:
                "linear-gradient(135deg, rgba(134, 239, 172, 0.18) 0%, rgba(34, 197, 94, 0.18) 100%)",
              color: "rgba(134, 239, 172, 1)",
              cursor: isExecuting || loading ? "not-allowed" : "pointer",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              opacity: isExecuting || loading ? BUTTON_LOADING_OPACITY : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              boxShadow:
                "0 4px 12px rgba(134, 239, 172, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)",
              letterSpacing: "0.01em",
              whiteSpace: "nowrap",
            }}
            type="button"
          >
            {isExecuting || loading ? (
              <>
                <Loader2
                  size={16}
                  style={{
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Approve</span>
                <Check size={16} />
              </>
            )}
          </button>
        </div>
        )
      ) : null}

      {/* Loading Spinner Animation */}
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes borderBlink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
        @keyframes borderPulse {
          0%, 100% {
            border-color: rgba(251, 191, 36, 0.5);
            box-shadow: 0 8px 32px rgba(251, 191, 36, 0.3), 0 2px 8px rgba(251, 191, 36, 0.2), inset 0 1px 0 rgba(251, 191, 36, 0.1);
          }
          50% {
            border-color: rgba(251, 191, 36, 0.7);
            box-shadow: 0 8px 40px rgba(251, 191, 36, 0.4), 0 4px 12px rgba(251, 191, 36, 0.3), inset 0 1px 0 rgba(251, 191, 36, 0.15);
          }
        }
      `}</style>
    </div>
  );
}
