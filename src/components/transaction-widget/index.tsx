"use client";

import { AnimatePresence, motion } from "motion/react";
import type { DragEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { useDragDrop } from "@/hooks/use-drag-drop";
import { type Recipe, useRecipes } from "@/hooks/use-recipes";
import { useSend } from "@/hooks/use-send";
import { useSwap } from "@/hooks/use-swap";
import type { TokenBalance } from "@/hooks/use-wallet-balances";
import { useWalletBalances } from "@/hooks/use-wallet-balances";
import { DropZone, type DropZoneType } from "./DropZone";
import { RecipeCard } from "./RecipeCard";
import { RecipeSendForm } from "./RecipeSendForm";
import { SendForm } from "./SendForm";
import { SwapForm } from "./SwapForm";
import { getUsdValue, TokenCard } from "./TokenCard";

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
  const { recipes, addRecipe, deleteRecipe } = useRecipes();

  // Active recipe state - when a recipe card is clicked
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);

  // Animation phases:
  // Opening: "zooming" (card comes closer) -> "opened" (content visible)
  // Closing: "returning" (expanded form exits, card zooms back)
  const [animationPhase, setAnimationPhase] = useState<
    "zooming" | "opened" | "returning"
  >("zooming");

  // Reset animation phase when zone changes
  useEffect(() => {
    if (state.expandedZone) {
      setAnimationPhase("zooming");
    }
  }, [state.expandedZone]);

  // Handle cancel - go directly to returning phase
  const handleCancel = useCallback(() => {
    // Close active recipe view if open
    if (activeRecipe) {
      setActiveRecipe(null);
      return;
    }
    if (animationPhase === "opened") {
      setAnimationPhase("returning");
    } else {
      cancelForm();
    }
  }, [animationPhase, cancelForm, activeRecipe]);

  // Handle recipe click - opens pre-filled form
  const handleRecipeClick = useCallback((recipe: Recipe) => {
    setActiveRecipe(recipe);
  }, []);

  // Handle recipe creation
  const handleCreateRecipe = useCallback(
    (recipeData: Omit<Recipe, "id" | "createdAt">) => {
      addRecipe(recipeData);
    },
    [addRecipe]
  );

  // Handle recipe delete
  const handleDeleteRecipe = useCallback(
    (id: string) => {
      deleteRecipe(id);
    },
    [deleteRecipe]
  );

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

  const isAnyZoneExpanded =
    state.expandedZone !== null || activeRecipe !== null;

  // Smooth spring for zoom
  const zoomSpring = { type: "spring", stiffness: 280, damping: 30 } as const;

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
        scale: isAnyZoneExpanded ? 1.15 : 1,
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
            opacity: isAnyZoneExpanded ? 0.25 : 1,
            filter: isAnyZoneExpanded ? "blur(6px)" : "blur(0px)",
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
            {balances
              .filter(
                (token) => getUsdValue(token.balance, token.symbol) >= 0.01
              )
              .map((token) => (
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

        {/* Actions section - position relative for expanded form */}
        <div
          style={{
            position: "relative",
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

          {/* Action cards container */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              padding: "12px",
              margin: "-12px",
            }}
          >
            {(["telegram", "wallet", "swap"] as const).map((zone) => {
              const isSelected = state.expandedZone === zone && !activeRecipe;
              const isOther = isAnyZoneExpanded && !isSelected;

              // Collapsed card visibility:
              // - Show during "zooming" (opening phase 1)
              // - Hide during "opened" (expanded form visible)
              // - Show during "returning" (zoom back out)
              const showCollapsed =
                !isSelected ||
                animationPhase === "zooming" ||
                animationPhase === "returning";

              // Scale logic for selected card:
              // - "zooming": scale up to 1.28 (coming closer)
              // - "opened": stay at 1.28 (hidden, but maintain scale for seamless transition)
              // - "returning": animate from 1.28 back to 1
              const getSelectedScale = () => {
                if (animationPhase === "returning") {
                  return 1;
                }
                return 1.28; // "zooming" or "opened"
              };

              return (
                <motion.div
                  animate={{
                    opacity: isOther ? 0.25 : 1,
                    scale: isSelected ? getSelectedScale() : isOther ? 0.85 : 1,
                    filter: isOther ? "blur(4px)" : "blur(0px)",
                  }}
                  key={zone}
                  onAnimationComplete={() => {
                    if (isSelected) {
                      // Opening: zooming -> opened
                      if (animationPhase === "zooming") {
                        setAnimationPhase("opened");
                      }
                      // Closing complete: returning -> reset
                      if (animationPhase === "returning") {
                        cancelForm();
                      }
                    }
                  }}
                  style={{
                    flex: 1,
                    transformOrigin: "center center",
                    pointerEvents: isOther ? "none" : "auto",
                    visibility: showCollapsed ? "visible" : "hidden",
                    zIndex: isSelected ? 5 : 1,
                  }}
                  transition={zoomSpring}
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
              );
            })}
          </div>

          {/* Recipes row - separate section below actions */}
          {recipes.length > 0 && (
            <motion.div
              animate={{
                opacity: isAnyZoneExpanded ? 0.25 : 1,
                filter: isAnyZoneExpanded ? "blur(4px)" : "blur(0px)",
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginTop: "8px",
                pointerEvents: isAnyZoneExpanded ? "none" : "auto",
              }}
              transition={zoomSpring}
            >
              <span
                style={{
                  fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                  fontSize: "10px",
                  fontWeight: 500,
                  color: "rgba(255, 255, 255, 0.3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  paddingLeft: "4px",
                }}
              >
                Recipes
              </span>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                {recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    onClick={() => handleRecipeClick(recipe)}
                    onDelete={() => handleDeleteRecipe(recipe.id)}
                    recipe={recipe}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Expanded form - appears after zoom phase */}
          <AnimatePresence>
            {state.expandedZone &&
              state.droppedToken &&
              animationPhase === "opened" && (
                <motion.div
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  initial={{ opacity: 0, scale: 1.08 }}
                  key={state.expandedZone}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    transformOrigin: "center top",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                >
                  <DropZone
                    droppedToken={state.droppedToken}
                    isDragOver={false}
                    isExpanded={true}
                    onDragLeave={handleDragLeave()}
                    onDragOver={handleDragOver(state.expandedZone)}
                    onDrop={handleDrop(state.expandedZone)}
                    type={state.expandedZone}
                  >
                    {state.expandedZone === "telegram" && (
                      <SendForm
                        destinationType="telegram"
                        isLoading={state.isExecuting}
                        onCancel={handleCancel}
                        onCreateRecipe={handleCreateRecipe}
                        onSend={handleSend}
                        result={state.transactionResult}
                        status={state.transactionStatus}
                        token={state.droppedToken}
                      />
                    )}
                    {state.expandedZone === "wallet" && (
                      <SendForm
                        destinationType="wallet"
                        isLoading={state.isExecuting}
                        onCancel={handleCancel}
                        onCreateRecipe={handleCreateRecipe}
                        onSend={handleSend}
                        result={state.transactionResult}
                        status={state.transactionStatus}
                        token={state.droppedToken}
                      />
                    )}
                    {state.expandedZone === "swap" && (
                      <SwapForm
                        isLoading={state.isExecuting}
                        onCancel={handleCancel}
                        onGetQuote={handleGetQuote}
                        onSwap={handleSwap}
                        result={state.transactionResult}
                        status={state.transactionStatus}
                        token={state.droppedToken}
                      />
                    )}
                  </DropZone>
                </motion.div>
              )}
          </AnimatePresence>

          {/* Recipe form overlay - when recipe card is clicked */}
          <AnimatePresence>
            {activeRecipe && (
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                initial={{ opacity: 0, scale: 1.08 }}
                key={`recipe-${activeRecipe.id}`}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  zIndex: 10,
                  transformOrigin: "center top",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              >
                <DropZone
                  droppedToken={null}
                  isDragOver={false}
                  isExpanded={true}
                  onDragLeave={handleDragLeave()}
                  onDragOver={handleDragOver(activeRecipe.type)}
                  onDrop={handleDrop(activeRecipe.type)}
                  type={activeRecipe.type}
                >
                  <RecipeSendForm
                    isLoading={state.isExecuting}
                    onCancel={handleCancel}
                    onSend={handleSend}
                    recipe={activeRecipe}
                    result={state.transactionResult}
                    status={state.transactionStatus}
                  />
                </DropZone>
              </motion.div>
            )}
          </AnimatePresence>
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
