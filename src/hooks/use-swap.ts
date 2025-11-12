import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import { useCallback, useState } from "react";

export type SwapQuote = {
  inputAmount: string;
  outputAmount: string;
  inputToken: string;
  outputToken: string;
  priceImpact?: string;
  fee?: string;
};

export type SwapResult = {
  signature: string;
  success: boolean;
};

// Use Jupiter public API for quotes (works with CORS)
const JUPITER_QUOTE_API_URL = "https://public.jupiterapi.com/quote";
// Use Jupiter Dial (Blinks) for swap execution - handles CORS properly
const JUPITER_DIAL_BASE_URL = "https://jupiter.dial.to";

// Token mint address mapping for Solana mainnet
const TOKEN_MINTS: Record<string, string> = {
  SOL: "So11111111111111111111111111111111111111112",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  BONK: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
};

/**
 * Convert token symbol to mint address
 * @param symbol - Token symbol (e.g., "SOL", "USDC")
 * @returns Mint address or undefined if not found
 */
const getTokenMint = (symbol: string): string | undefined => {
  const normalizedSymbol = symbol.toUpperCase();
  return TOKEN_MINTS[normalizedSymbol];
};

type JupiterQuoteResponse = {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee: null | {
    amount: string;
    feeBps: number;
  };
  priceImpactPct: string;
  routePlan: Array<{
    swapInfo: {
      ammKey: string;
      label: string;
      inputMint: string;
      outputMint: string;
      inAmount: string;
      outAmount: string;
      feeAmount: string;
      feeMint: string;
    };
    percent: number;
  }>;
  contextSlot?: number;
  timeTaken?: number;
};

type JupiterSwapResponse = {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
};

type BlinkActionResponse = {
  transaction: string;
  message?: string;
};

export function useSwap() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [quoteResponse, setQuoteResponse] =
    useState<JupiterQuoteResponse | null>(null);

  const getQuote = useCallback(
    async (
      fromToken: string,
      toToken: string,
      amount: string
    ): Promise<SwapQuote | null> => {
      try {
        setError(null);

        // Convert token symbols to mint addresses
        const inputMint = getTokenMint(fromToken);
        const outputMint = getTokenMint(toToken);

        if (!inputMint) {
          throw new Error(`Unknown token: ${fromToken}`);
        }
        if (!outputMint) {
          throw new Error(`Unknown token: ${toToken}`);
        }

        // Convert amount to lamports (smallest unit)
        // For SOL: 1 SOL = 1,000,000,000 lamports
        // For SPL tokens: usually 1 token = 1,000,000 (6 decimals) or 1,000,000,000 (9 decimals)
        // We'll use 9 decimals for SOL and 6 for others
        const decimals = fromToken.toUpperCase() === "SOL" ? 9 : 6;
        const amountInSmallestUnit = Math.floor(
          Number.parseFloat(amount) * 10 ** decimals
        ).toString();

        console.log("Token conversion:", {
          fromToken,
          inputMint,
          toToken,
          outputMint,
          amount,
          amountInSmallestUnit,
          decimals,
        });

        // Build Jupiter Quote API URL
        const url = `${JUPITER_QUOTE_API_URL}?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountInSmallestUnit}&slippageBps=50`;
        console.log("Fetching quote from:", url);

        const response = await fetch(url);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Quote API error:", errorText);
          throw new Error(`Failed to get quote: ${response.statusText}`);
        }

        const data: JupiterQuoteResponse = await response.json();
        console.log("Jupiter Quote response:", data);

        // Store the full quote response for later use in executeSwap
        setQuoteResponse(data);

        // Convert output amount from smallest unit back to tokens
        const outputDecimals = toToken.toUpperCase() === "SOL" ? 9 : 6;
        const outputAmount = (
          Number.parseInt(data.outAmount) /
          10 ** outputDecimals
        ).toFixed(outputDecimals === 9 ? 4 : 2);

        const priceImpact = `${(Number.parseFloat(data.priceImpactPct) * 100).toFixed(2)}%`;

        const quoteData: SwapQuote = {
          inputAmount: amount,
          outputAmount,
          inputToken: fromToken,
          outputToken: toToken,
          priceImpact,
          fee: undefined,
        };

        console.log("Parsed quote data:", quoteData);
        setQuote(quoteData);
        return quoteData;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to get quote";
        setError(errorMessage);
        console.error("Quote error:", err);
        return null;
      }
    },
    []
  );

  const executeSwap = useCallback(
    async (
      fromToken: string,
      toToken: string,
      amount: string
    ): Promise<SwapResult | null> => {
      if (!(publicKey && signTransaction)) {
        setError("Wallet not connected");
        return null;
      }

      if (!quoteResponse) {
        setError("No quote available. Please get a quote first.");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        console.log("Executing swap with quote:", quoteResponse);

        // Get token mints for Dial API
        const inputMint = getTokenMint(fromToken);
        const outputMint = getTokenMint(toToken);

        if (!(inputMint && outputMint)) {
          throw new Error("Invalid token mints");
        }

        // Convert amount to smallest unit
        const decimals = fromToken.toUpperCase() === "SOL" ? 9 : 6;
        const amountInSmallestUnit = Math.floor(
          Number.parseFloat(amount) * 10 ** decimals
        );

        // Step 1: Call Jupiter Dial Blinks API to get transaction
        // Format: POST /api/v0/swap/{inputMint}-{outputMint}/{amount}
        const dialUrl = `${JUPITER_DIAL_BASE_URL}/api/v0/swap/${inputMint}-${outputMint}/${amountInSmallestUnit}`;
        console.log("Calling Dial API:", dialUrl);

        const dialResponse = await fetch(dialUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            account: publicKey.toBase58(),
          }),
        });

        if (!dialResponse.ok) {
          const errorText = await dialResponse.text();
          console.error("Dial API error:", errorText);
          throw new Error(`Dial API failed: ${dialResponse.statusText}`);
        }

        const dialData: BlinkActionResponse = await dialResponse.json();
        console.log("Dial transaction response:", dialData);

        const { transaction: serializedTx } = dialData;
        if (!serializedTx) {
          throw new Error("No transaction returned from Dial API");
        }

        // Step 2: Deserialize and sign transaction
        const txBuffer = Buffer.from(serializedTx, "base64");
        const transaction = VersionedTransaction.deserialize(txBuffer);

        console.log("Transaction deserialized, requesting signature...");
        const signedTx = await signTransaction(transaction);

        // Step 3: Send transaction
        console.log("Sending transaction...");
        const signature = await connection.sendRawTransaction(
          signedTx.serialize(),
          {
            skipPreflight: false,
            preflightCommitment: "confirmed",
          }
        );

        console.log("Transaction sent:", signature);

        // Step 4: Confirm transaction
        console.log("Confirming transaction...");
        const confirmation = await connection.confirmTransaction(
          signature,
          "confirmed"
        );

        if (confirmation.value.err) {
          throw new Error(
            `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
          );
        }

        console.log("Transaction confirmed!");
        setLoading(false);
        return {
          signature,
          success: true,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Swap execution failed";
        setError(errorMessage);
        console.error("Swap execution error:", err);
        setLoading(false);
        return null;
      }
    },
    [publicKey, signTransaction, connection, quoteResponse]
  );

  const resetQuote = useCallback(() => {
    setQuote(null);
    setError(null);
  }, []);

  return {
    getQuote,
    executeSwap,
    resetQuote,
    quote,
    loading,
    error,
  };
}
