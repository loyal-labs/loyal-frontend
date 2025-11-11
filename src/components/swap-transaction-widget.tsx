"use client";

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
        background: "rgba(20, 20, 20, 0.6)",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow:
          "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
        borderRadius: "16px",
        padding: "1.5rem",
        maxWidth: "400px",
        color: "rgba(255, 255, 255, 0.9)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1.25rem",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background:
              "linear-gradient(135deg, rgba(147, 197, 253, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)",
            border: "1px solid rgba(147, 197, 253, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.25rem",
          }}
        >
          🔄
        </div>
        <div>
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              margin: 0,
              color: "rgba(255, 255, 255, 0.95)",
            }}
          >
            Swap Preview
          </h3>
          <p
            style={{
              fontSize: "0.875rem",
              color: "rgba(255, 255, 255, 0.6)",
              margin: 0,
            }}
          >
            Review transaction details
          </p>
        </div>
      </div>

      {/* Transaction Details */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "12px",
          padding: "1rem",
          marginBottom: "1rem",
        }}
      >
        {/* From Token */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.75rem",
          }}
        >
          <span
            style={{
              fontSize: "0.875rem",
              color: "rgba(255, 255, 255, 0.6)",
            }}
          >
            You pay
          </span>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.95)",
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
            margin: "0.5rem 0",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(147, 197, 253, 0.1)",
              border: "1px solid rgba(147, 197, 253, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
            }}
          >
            ↓
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
              fontSize: "0.875rem",
              color: "rgba(255, 255, 255, 0.6)",
            }}
          >
            You receive
          </span>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "rgba(147, 197, 253, 1)",
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
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
            padding: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          {quote.priceImpact && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.875rem",
                marginBottom: quote.fee ? "0.5rem" : 0,
              }}
            >
              <span style={{ color: "rgba(255, 255, 255, 0.5)" }}>
                Price Impact
              </span>
              <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                {quote.priceImpact}
              </span>
            </div>
          )}
          {quote.fee && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.875rem",
              }}
            >
              <span style={{ color: "rgba(255, 255, 255, 0.5)" }}>Fee</span>
              <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>
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
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
          }}
          style={{
            flex: 1,
            padding: "0.75rem 1.5rem",
            borderRadius: "12px",
            fontSize: "0.875rem",
            fontWeight: 500,
            border: "1px solid rgba(255, 255, 255, 0.15)",
            background: "rgba(255, 255, 255, 0.05)",
            color: "rgba(255, 255, 255, 0.8)",
            cursor: isExecuting ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            opacity: isExecuting ? BUTTON_DISABLED_OPACITY : 1,
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
                "linear-gradient(135deg, rgba(147, 197, 253, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)";
              e.currentTarget.style.borderColor = "rgba(147, 197, 253, 0.5)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg, rgba(147, 197, 253, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)";
            e.currentTarget.style.borderColor = "rgba(147, 197, 253, 0.3)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
          style={{
            flex: 1,
            padding: "0.75rem 1.5rem",
            borderRadius: "12px",
            fontSize: "0.875rem",
            fontWeight: 500,
            border: "1px solid rgba(147, 197, 253, 0.3)",
            background:
              "linear-gradient(135deg, rgba(147, 197, 253, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)",
            color: "rgba(147, 197, 253, 1)",
            cursor: isExecuting || loading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            opacity: isExecuting || loading ? BUTTON_LOADING_OPACITY : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
          type="button"
        >
          {isExecuting || loading ? (
            <>
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid rgba(147, 197, 253, 0.3)",
                  borderTopColor: "rgba(147, 197, 253, 1)",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Approve & Sign</span>
              <span>✓</span>
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
