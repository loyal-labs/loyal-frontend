"use client";

import { ArrowDown, Check, Loader2, Repeat2 } from "lucide-react";
import { useState } from "react";
import type { SwapQuote } from "@/hooks/use-swap";

const BUTTON_DISABLED_OPACITY = 0.5;
const BUTTON_LOADING_OPACITY = 0.6;

type SwapTransactionWidgetProps = {
  quote: SwapQuote;
  onApprove: () => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
};

export function SwapTransactionWidget({
  quote,
  onApprove,
  onCancel,
  loading = false,
}: SwapTransactionWidgetProps) {
  const [isExecuting, setIsExecuting] = useState(false);

  const handleApprove = async () => {
    setIsExecuting(true);
    try {
      await onApprove();
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div
      style={{
        background: "rgba(15, 15, 15, 0.85)",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "rgba(255, 255, 255, 0.12)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        boxShadow:
          "0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
        borderRadius: "20px",
        padding: "1.75rem",
        maxWidth: "420px",
        width: "100%",
        color: "rgba(255, 255, 255, 0.9)",
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
            borderRadius: "14px",
            background:
              "linear-gradient(135deg, rgba(147, 197, 253, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)",
            border: "1px solid rgba(147, 197, 253, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(147, 197, 253, 0.15)",
          }}
        >
          <Repeat2 size={24} style={{ color: "rgba(147, 197, 253, 0.9)" }} />
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
            Swap Preview
          </h3>
          <p
            style={{
              fontSize: "0.8125rem",
              color: "rgba(255, 255, 255, 0.5)",
              margin: 0,
              marginTop: "0.125rem",
            }}
          >
            Review transaction details
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
        {/* From Token */}
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
            You pay
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
              {quote.inputAmount} {quote.inputToken}
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
                "linear-gradient(135deg, rgba(147, 197, 253, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)",
              border: "1px solid rgba(147, 197, 253, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowDown
              size={20}
              style={{ color: "rgba(147, 197, 253, 0.9)" }}
            />
          </div>
        </div>

        {/* To Token */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
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
            You receive
          </span>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "rgba(147, 197, 253, 1)",
                letterSpacing: "-0.01em",
              }}
            >
              {quote.outputAmount} {quote.outputToken}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      {(quote.priceImpact || quote.fee) && (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "12px",
            padding: "0.875rem 1rem",
            marginBottom: "1.25rem",
          }}
        >
          {quote.priceImpact && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.8125rem",
                marginBottom: quote.fee ? "0.5rem" : 0,
              }}
            >
              <span
                style={{
                  color: "rgba(255, 255, 255, 0.45)",
                  fontWeight: 500,
                }}
              >
                Price Impact
              </span>
              <span
                style={{
                  color: "rgba(255, 255, 255, 0.85)",
                  fontWeight: 600,
                }}
              >
                {quote.priceImpact}
              </span>
            </div>
          )}
          {quote.fee && (
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
                Fee
              </span>
              <span
                style={{
                  color: "rgba(255, 255, 255, 0.85)",
                  fontWeight: 600,
                }}
              >
                {quote.fee}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
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
                "linear-gradient(135deg, rgba(147, 197, 253, 0.28) 0%, rgba(99, 102, 241, 0.28) 100%)";
              e.currentTarget.style.borderColor = "rgba(147, 197, 253, 0.5)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 24px rgba(147, 197, 253, 0.25), 0 4px 8px rgba(0, 0, 0, 0.15)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg, rgba(147, 197, 253, 0.18) 0%, rgba(99, 102, 241, 0.18) 100%)";
            e.currentTarget.style.borderColor = "rgba(147, 197, 253, 0.35)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(147, 197, 253, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)";
          }}
          style={{
            flex: 1,
            padding: "0.875rem 1.5rem",
            borderRadius: "14px",
            fontSize: "0.875rem",
            fontWeight: 600,
            border: "1px solid rgba(147, 197, 253, 0.35)",
            background:
              "linear-gradient(135deg, rgba(147, 197, 253, 0.18) 0%, rgba(99, 102, 241, 0.18) 100%)",
            color: "rgba(147, 197, 253, 1)",
            cursor: isExecuting || loading ? "not-allowed" : "pointer",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            opacity: isExecuting || loading ? BUTTON_LOADING_OPACITY : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            boxShadow:
              "0 4px 12px rgba(147, 197, 253, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)",
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

      {/* Loading Spinner Animation */}
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
