"use client";

import { ArrowDown, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useState } from "react";

export type SendTransactionData = {
  currency: string;
  amount: string;
  walletAddress: string;
  destinationType: "wallet" | "telegram";
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

  const handleApprove = async () => {
    setIsExecuting(true);
    try {
      await onApprove();
    } finally {
      setIsExecuting(false);
    }
  };

  // Format recipient for display
  const displayRecipient =
    sendData.destinationType === "telegram"
      ? `@${sendData.walletAddress}` // Show full username with @ prefix
      : sendData.walletAddress.length > 12
        ? `${sendData.walletAddress.slice(0, 6)}...${sendData.walletAddress.slice(-4)}`
        : sendData.walletAddress;

  const recipientTitle =
    sendData.destinationType === "telegram"
      ? `Telegram: @${sendData.walletAddress}`
      : sendData.walletAddress;

  // Helper to render the send cards
  const renderSendCards = (statusIcon: React.ReactNode) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        position: "relative",
      }}
    >
      {/* You send card (top) */}
      <div
        style={{
          background: "rgba(37, 37, 37, 0.6)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "16px 16px 8px 8px",
          padding: "10px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <span
            style={{
              color: "white",
              opacity: 0.6,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.154px",
            }}
          >
            You send
          </span>
          <span
            style={{
              color: "white",
              fontSize: "24px",
              fontWeight: 600,
              lineHeight: "24px",
              letterSpacing: "-0.264px",
            }}
          >
            {sendData.amount}
          </span>
        </div>
        <span
          style={{
            color: "white",
            fontSize: "17px",
            fontWeight: 500,
            lineHeight: "22px",
            letterSpacing: "-0.4px",
          }}
        >
          {sendData.currency}
        </span>
      </div>

      {/* To address card (bottom) */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.06)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "8px 8px 16px 16px",
          padding: "10px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <span
            style={{
              color: "white",
              opacity: 0.6,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.154px",
            }}
          >
            To
          </span>
          <span
            style={{
              color: "white",
              fontSize: "24px",
              fontWeight: 600,
              lineHeight: "24px",
              letterSpacing: "-0.264px",
              fontFamily: "monospace",
            }}
            title={recipientTitle}
          >
            {displayRecipient}
          </span>
        </div>
      </div>

      {/* Status icon in the middle */}
      {statusIcon}
    </div>
  );

  // Success state
  if (status === "success") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          width: "320px",
        }}
      >
        {renderSendCards(
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "28px",
              height: "28px",
              borderRadius: "25px",
              background: "#28c281",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle2 size={18} style={{ color: "white" }} />
          </div>
        )}

        {/* Success message and link */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 4px",
          }}
        >
          <span
            style={{
              color: "#28c281",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Send Successful
          </span>
          {result?.signature && (
            <a
              href={`https://solscan.io/tx/${result.signature}`}
              rel="noopener noreferrer"
              style={{
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "13px",
                textDecoration: "none",
              }}
              target="_blank"
            >
              View on Solscan →
            </a>
          )}
        </div>
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
          gap: "8px",
          width: "320px",
        }}
      >
        {renderSendCards(
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "28px",
              height: "28px",
              borderRadius: "25px",
              background: "#ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <XCircle size={18} style={{ color: "white" }} />
          </div>
        )}

        {/* Error message */}
        <div
          style={{
            padding: "0 4px",
          }}
        >
          <span
            style={{
              color: "#ef4444",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            {result?.error || "Transaction Failed"}
          </span>
        </div>
      </div>
    );
  }

  // Pending state
  if (status === "pending") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          width: "320px",
        }}
      >
        {renderSendCards(
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "28px",
              height: "28px",
              borderRadius: "25px",
              background: "#fbbf24",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Loader2
              size={18}
              style={{
                color: "white",
                animation: "spin 1s linear infinite",
              }}
            />
          </div>
        )}

        {/* Pending message */}
        <div
          style={{
            padding: "0 4px",
          }}
        >
          <span
            style={{
              color: "#fbbf24",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Processing send...
          </span>
        </div>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Default preview state
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        width: "320px",
        position: "relative",
      }}
    >
      {/* Send cards container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          position: "relative",
        }}
      >
        {/* You send card (top) */}
        <div
          style={{
            background: "rgba(37, 37, 37, 0.6)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "16px 16px 8px 8px",
            padding: "10px 12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <span
              style={{
                color: "white",
                opacity: 0.6,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "-0.154px",
              }}
            >
              You send
            </span>
            <span
              style={{
                color: "white",
                fontSize: "24px",
                fontWeight: 600,
                lineHeight: "24px",
                letterSpacing: "-0.264px",
              }}
            >
              {sendData.amount}
            </span>
          </div>
          <span
            style={{
              color: "white",
              fontSize: "17px",
              fontWeight: 500,
              lineHeight: "22px",
              letterSpacing: "-0.4px",
            }}
          >
            {sendData.currency}
          </span>
        </div>

        {/* To address card (bottom) */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.06)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "8px 8px 16px 16px",
            padding: "10px 12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <span
              style={{
                color: "white",
                opacity: 0.6,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "-0.154px",
              }}
            >
              To
            </span>
            <span
              style={{
                color: "white",
                fontSize: "24px",
                fontWeight: 600,
                lineHeight: "24px",
                letterSpacing: "-0.264px",
                fontFamily: "monospace",
              }}
              title={recipientTitle}
            >
              {displayRecipient}
            </span>
          </div>
        </div>

        {/* Arrow button in the middle */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "28px",
            height: "28px",
            borderRadius: "25px",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowDown size={20} style={{ color: "black" }} />
        </div>
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          gap: "8px",
        }}
      >
        <button
          disabled={isExecuting}
          onClick={onCancel}
          style={{
            flex: 1,
            height: "40px",
            borderRadius: "59px",
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(20px)",
            border: "none",
            color: "white",
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: "20px",
            letterSpacing: "-0.154px",
            cursor: isExecuting ? "not-allowed" : "pointer",
            opacity: isExecuting ? 0.5 : 1,
            transition: "all 0.2s ease",
          }}
          type="button"
        >
          Cancel
        </button>
        <button
          disabled={isExecuting || loading}
          onClick={handleApprove}
          style={{
            flex: 1,
            height: "40px",
            borderRadius: "59px",
            background: "#28c281",
            border: "none",
            color: "white",
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: "20px",
            letterSpacing: "-0.154px",
            cursor: isExecuting || loading ? "not-allowed" : "pointer",
            opacity: isExecuting || loading ? 0.7 : 1,
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
          type="button"
        >
          {isExecuting || loading ? (
            <>
              <Loader2
                size={16}
                style={{ animation: "spin 1s linear infinite" }}
              />
              Processing...
            </>
          ) : (
            "Approve & Sign"
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
