"use client";

import { motion } from "motion/react";
import type { DragEvent } from "react";
import { useCallback } from "react";
import { useDragDrop } from "@/hooks/use-drag-drop";
import { useSend } from "@/hooks/use-send";
import { useSwap } from "@/hooks/use-swap";
import type { TokenBalance } from "@/hooks/use-wallet-balances";
import { useWalletBalances } from "@/hooks/use-wallet-balances";
import { DropZone, type DropZoneType } from "./DropZone";
import { SendForm } from "./SendForm";
import { SwapForm } from "./SwapForm";
import { TokenCard } from "./TokenCard";

type TransactionWidgetProps = {
  className?: string;
  onTransactionComplete?: (
    type: "send" | "swap",
    result: { signature?: string }
  ) => void;
};

export function TransactionWidget({
  className,
  onTransactionComplete,
}: TransactionWidgetProps) {
  const { balances, loading: balancesLoading, refetch } = useWalletBalances();
  const { executeSend } = useSend();
  const { getQuote, executeSwap } = useSwap();
  const {
    state,
    startDrag,
    endDrag,
    dragOverZone,
    dragLeaveZone,
    dropOnZone,
    cancelForm,
    setExecuting,
    setTransactionResult,
  } = useDragDrop();

  // Handle drag start
  const handleDragStart = useCallback(
    (_e: DragEvent<HTMLDivElement>, token: TokenBalance) => {
      startDrag(token);
    },
    [startDrag]
  );

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    endDrag();
  }, [endDrag]);

  // Handle drag over zone
  const handleDragOver = useCallback(
    (zone: DropZoneType) => (_e: DragEvent<HTMLDivElement>) => {
      if (state.isDragging) {
        dragOverZone(zone);
      }
    },
    [state.isDragging, dragOverZone]
  );

  // Handle drag leave zone
  const handleDragLeave = useCallback(
    () => (_e: DragEvent<HTMLDivElement>) => {
      dragLeaveZone();
    },
    [dragLeaveZone]
  );

  // Handle drop on zone
  const handleDrop = useCallback(
    (zone: DropZoneType) => (e: DragEvent<HTMLDivElement>) => {
      try {
        const data = e.dataTransfer.getData("application/json");
        const token = JSON.parse(data) as TokenBalance;
        dropOnZone(zone, token);
      } catch {
        endDrag();
      }
    },
    [dropOnZone, endDrag]
  );

  // Handle send transaction
  const handleSend = useCallback(
    async (data: {
      currency: string;
      currencyMint: string;
      currencyDecimals: number;
      amount: string;
      walletAddress: string;
      destinationType: "wallet" | "telegram";
    }) => {
      setExecuting(true);
      try {
        const result = await executeSend(
          data.currency,
          data.amount,
          data.walletAddress,
          data.destinationType,
          data.currencyMint,
          data.currencyDecimals
        );

        if (result.success) {
          setTransactionResult("success", { signature: result.signature });
          onTransactionComplete?.("send", { signature: result.signature });
          refetch(); // Refresh balances
        } else {
          setTransactionResult("error", { error: result.error });
        }
      } catch (err) {
        setTransactionResult("error", {
          error: err instanceof Error ? err.message : "Transaction failed",
        });
      }
    },
    [
      executeSend,
      setExecuting,
      setTransactionResult,
      onTransactionComplete,
      refetch,
    ]
  );

  // Handle swap quote
  const handleGetQuote = useCallback(
    async (
      fromToken: string,
      toToken: string,
      amount: string,
      fromMint?: string,
      fromDecimals?: number,
      toDecimals?: number
    ) => {
      const quote = await getQuote(
        fromToken,
        toToken,
        amount,
        fromMint,
        fromDecimals,
        toDecimals
      );
      if (quote) {
        return {
          outputAmount: quote.outputAmount,
          priceImpact: quote.priceImpact,
        };
      }
      return null;
    },
    [getQuote]
  );

  // Handle swap transaction
  const handleSwap = useCallback(
    async (data: {
      fromCurrency: string;
      fromCurrencyMint: string;
      fromCurrencyDecimals: number;
      amount: string;
      toCurrency: string;
      toCurrencyMint: string;
      toCurrencyDecimals: number;
    }) => {
      setExecuting(true);
      try {
        // First get the quote to ensure we have it
        await getQuote(
          data.fromCurrency,
          data.toCurrency,
          data.amount,
          data.fromCurrencyMint,
          data.fromCurrencyDecimals,
          data.toCurrencyDecimals
        );

        // Then execute the swap
        const result = await executeSwap();

        if (result.success) {
          setTransactionResult("success", { signature: result.signature });
          onTransactionComplete?.("swap", { signature: result.signature });
          refetch(); // Refresh balances
        } else {
          setTransactionResult("error", { error: result.error });
        }
      } catch (err) {
        setTransactionResult("error", {
          error: err instanceof Error ? err.message : "Swap failed",
        });
      }
    },
    [
      getQuote,
      executeSwap,
      setExecuting,
      setTransactionResult,
      onTransactionComplete,
      refetch,
    ]
  );

  // Empty state
  if (balances.length === 0 && !balancesLoading) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 16px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-geist-sans), sans-serif",
            fontSize: "14px",
            color: "rgba(255, 255, 255, 0.6)",
          }}
        >
          No tokens in wallet
        </p>
        <p
          style={{
            marginTop: "4px",
            fontFamily: "var(--font-geist-sans), sans-serif",
            fontSize: "12px",
            color: "rgba(255, 255, 255, 0.4)",
          }}
        >
          Connect wallet or get some tokens
        </p>
      </div>
    );
  }

  // Loading state
  if (balancesLoading && balances.length === 0) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
        }}
      >
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            borderTopColor: "rgba(255, 255, 255, 0.6)",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );
  }

  const isAnyZoneExpanded = state.expandedZone !== null;

  // Smooth spring for zoom
  const zoomSpring = { type: "spring", stiffness: 280, damping: 30 };

  // Transform origin based on which zone is expanded (zoom centers on that zone)
  const getSceneOrigin = () => {
    if (!state.expandedZone) return "center center";
    // Actions are on the right side
    if (state.expandedZone === "telegram") return "100% 0%"; // top-right area
    if (state.expandedZone === "wallet") return "100% 0%";
    if (state.expandedZone === "swap") return "100% 50%"; // right-center
    return "center center";
  };

  // ZOOM INTO SCENE - everything scales, centered on selected action
  return (
    <motion.div
      animate={{
        scale: isAnyZoneExpanded ? 1.15 : 1, // Scene zooms in
      }}
      className={className}
      style={{
        width: "100%",
        transformOrigin: getSceneOrigin(),
        overflow: "visible",
      }}
      transition={zoomSpring}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          width: "100%",
          gap: "48px",
        }}
      >
        {/* Tokens - blur when zoomed (out of focus) */}
        <motion.div
          animate={{
            opacity: isAnyZoneExpanded ? 0.35 : 1,
            filter: isAnyZoneExpanded ? "blur(4px)" : "blur(0px)",
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            pointerEvents: isAnyZoneExpanded ? "none" : "auto",
          }}
          transition={zoomSpring}
        >
          <span
            style={{
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              fontSize: "11px",
              fontWeight: 500,
              color: "rgba(255, 255, 255, 0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              paddingLeft: "4px",
            }}
          >
            Your Tokens
          </span>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "10px",
              padding: "12px",
              margin: "-12px",
            }}
          >
            {balances.map((token) => (
              <TokenCard
                isDragging={state.draggedToken?.mint === token.mint}
                isOtherDragging={
                  state.isDragging && state.draggedToken?.mint !== token.mint
                }
                key={token.mint}
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
                token={token}
              />
            ))}
          </div>
        </motion.div>

        {/* Actions section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Label - fades when zoomed */}
          <motion.span
            animate={{
              opacity: isAnyZoneExpanded ? 0 : 1,
            }}
            style={{
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              fontSize: "11px",
              fontWeight: 500,
              color: "rgba(255, 255, 255, 0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              paddingLeft: "4px",
            }}
            transition={zoomSpring}
          >
            Actions
          </motion.span>

          {/* Action cards - all always rendered, animated in/out */}
          <motion.div
            layout
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "10px",
              padding: "12px",
              margin: "-12px",
            }}
            transition={zoomSpring}
          >
            {(["telegram", "wallet", "swap"] as const).map((zone) => {
              const isSelected = state.expandedZone === zone;
              const isOther = isAnyZoneExpanded && !isSelected;

              return (
                <motion.div
                  animate={{
                    scale: isSelected ? 1.1 : isOther ? 0.85 : 1,
                    opacity: isOther ? 0 : 1,
                    filter: isOther ? "blur(4px)" : "blur(0px)",
                    zIndex: isSelected ? 10 : 1,
                    gridColumn: isSelected ? "1 / -1" : "auto", // Span full width when selected
                  }}
                  key={zone}
                  layout
                  style={{
                    transformOrigin: "center top",
                    pointerEvents: isOther ? "none" : "auto",
                  }}
                  transition={zoomSpring}
                >
                  <DropZone
                    droppedToken={state.droppedToken}
                    isDragOver={state.dragOverZone === zone}
                    isExpanded={isSelected}
                    onDragLeave={handleDragLeave()}
                    onDragOver={handleDragOver(zone)}
                    onDrop={handleDrop(zone)}
                    type={zone}
                  >
                    {isSelected && state.droppedToken && (
                      <>
                        {zone === "telegram" && (
                          <SendForm
                            destinationType="telegram"
                            isLoading={state.isExecuting}
                            onCancel={cancelForm}
                            onSend={handleSend}
                            result={state.transactionResult}
                            status={state.transactionStatus}
                            token={state.droppedToken}
                          />
                        )}
                        {zone === "wallet" && (
                          <SendForm
                            destinationType="wallet"
                            isLoading={state.isExecuting}
                            onCancel={cancelForm}
                            onSend={handleSend}
                            result={state.transactionResult}
                            status={state.transactionStatus}
                            token={state.droppedToken}
                          />
                        )}
                        {zone === "swap" && (
                          <SwapForm
                            isLoading={state.isExecuting}
                            onCancel={cancelForm}
                            onGetQuote={handleGetQuote}
                            onSwap={handleSwap}
                            result={state.transactionResult}
                            status={state.transactionStatus}
                            token={state.droppedToken}
                          />
                        )}
                      </>
                    )}
                  </DropZone>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export { DropZone } from "./DropZone";
export { SendForm } from "./SendForm";
export { SwapForm } from "./SwapForm";
// Re-export components for potential individual use
export { TokenCard } from "./TokenCard";
