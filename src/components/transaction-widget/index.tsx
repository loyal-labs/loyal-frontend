"use client";

import { AnimatePresence, motion } from "motion/react";
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

  // Shared container with perspective for 3D depth effect
  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        perspective: "1200px",
        perspectiveOrigin: "center center",
      }}
    >
      <AnimatePresence mode="wait">
        {isAnyZoneExpanded ? (
          // DEEPER LAYER: Expanded action form - we've zoomed INTO this
          <motion.div
            animate={{
              scale: 1,
              opacity: 1,
              filter: "blur(0px)",
            }}
            exit={{
              // Zooming OUT: form shrinks back into the distance
              scale: 0.85,
              opacity: 0,
              filter: "blur(6px)",
            }}
            initial={{
              // Zooming IN: form starts small/far, grows towards us
              scale: 0.8,
              opacity: 0,
              filter: "blur(8px)",
            }}
            key="expanded-layer"
            style={{
              transformStyle: "preserve-3d",
              width: "100%",
            }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 32,
              mass: 0.8,
            }}
          >
            {/* Expanded zone takes full width */}
            <DropZone
              droppedToken={state.droppedToken}
              isDragOver={false}
              isExpanded={true}
              onDragLeave={handleDragLeave()}
              onDragOver={handleDragOver(state.expandedZone as DropZoneType)}
              onDrop={handleDrop(state.expandedZone as DropZoneType)}
              type={state.expandedZone as DropZoneType}
            >
              {state.expandedZone === "telegram" && state.droppedToken && (
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
              {state.expandedZone === "wallet" && state.droppedToken && (
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
              {state.expandedZone === "swap" && state.droppedToken && (
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
            </DropZone>
          </motion.div>
        ) : (
          // SURFACE LAYER: Default tokens + actions view - we're at this level
          <motion.div
            animate={{
              scale: 1,
              opacity: 1,
              filter: "blur(0px)",
            }}
            exit={{
              // Zooming IN to action: surface zooms PAST us (scales up, blurs out)
              scale: 1.15,
              opacity: 0,
              filter: "blur(10px)",
            }}
            initial={{
              // Coming BACK from deeper: surface was behind us, comes back
              scale: 1.1,
              opacity: 0,
              filter: "blur(8px)",
            }}
            key="surface-layer"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              width: "100%",
              gap: "48px",
              transformStyle: "preserve-3d",
            }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 32,
              mass: 0.8,
            }}
          >
            {/* Left side: Tokens */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {/* Section label */}
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

              {/* Token cards - 2 column grid */}
              <motion.div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "10px",
                  padding: "8px",
                  margin: "-8px",
                }}
              >
                {balances.map((token, index) => (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 20 }}
                    key={token.mint}
                    transition={{
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                    }}
                  >
                    <TokenCard
                      isDragging={state.draggedToken?.mint === token.mint}
                      isOtherDragging={
                        state.isDragging && state.draggedToken?.mint !== token.mint
                      }
                      onDragEnd={handleDragEnd}
                      onDragStart={handleDragStart}
                      token={token}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right side: Actions */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {/* Section label */}
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
                Actions
              </span>

              {/* Drop zones - 2 column grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "10px",
                  padding: "8px",
                  margin: "-8px",
                }}
              >
                {(["telegram", "wallet", "swap"] as const).map((zone, index) => (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 20 }}
                    key={zone}
                    transition={{
                      delay: 0.1 + index * 0.05,
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                    }}
                  >
                    <DropZone
                      droppedToken={state.droppedToken}
                      isDragOver={state.dragOverZone === zone}
                      isExpanded={false}
                      onDragLeave={handleDragLeave()}
                      onDragOver={handleDragOver(zone)}
                      onDrop={handleDrop(zone)}
                      type={zone}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { DropZone } from "./DropZone";
export { SendForm } from "./SendForm";
export { SwapForm } from "./SwapForm";
// Re-export components for potential individual use
export { TokenCard } from "./TokenCard";
