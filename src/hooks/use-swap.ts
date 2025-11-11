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

const JUPITER_API_URL = "https://jupiter.dial.to/api/v0/swap";

export function useSwap() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<SwapQuote | null>(null);

  const getQuote = useCallback(
    async (
      fromToken: string,
      toToken: string,
      amount: string
    ): Promise<SwapQuote | null> => {
      try {
        setError(null);
        const tokenPair = `${fromToken}-${toToken}`;
        const response = await fetch(
          `${JUPITER_API_URL}/${tokenPair}/${amount}`
        );

        if (!response.ok) {
          throw new Error(`Failed to get quote: ${response.statusText}`);
        }

        const data = await response.json();

        // Extract quote information from response
        const quoteData: SwapQuote = {
          inputAmount: amount,
          outputAmount: data.outputAmount || "Unknown",
          inputToken: fromToken,
          outputToken: toToken,
          priceImpact: data.priceImpact,
          fee: data.fee,
        };

        setQuote(quoteData);
        return quoteData;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to get quote";
        setError(errorMessage);
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

      setLoading(true);
      setError(null);

      try {
        // Step 1: Get quote first
        const quoteData = await getQuote(fromToken, toToken, amount);
        if (!quoteData) {
          throw new Error("Failed to get swap quote");
        }

        // Step 2: Create swap transaction
        const tokenPair = `${fromToken}-${toToken}`;
        const swapResponse = await fetch(
          `${JUPITER_API_URL}/${tokenPair}/${amount}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              account: publicKey.toBase58(),
            }),
          }
        );

        if (!swapResponse.ok) {
          const errorData = await swapResponse.json();
          throw new Error(
            errorData.message || `Swap failed: ${swapResponse.statusText}`
          );
        }

        const { transaction: serializedTx } = await swapResponse.json();

        // Step 3: Deserialize and sign transaction
        const txBuffer = Buffer.from(serializedTx, "base64");
        const transaction = VersionedTransaction.deserialize(txBuffer);

        const signedTx = await signTransaction(transaction);

        // Step 4: Send transaction
        const signature = await connection.sendRawTransaction(
          signedTx.serialize(),
          {
            skipPreflight: false,
            preflightCommitment: "confirmed",
          }
        );

        // Step 5: Confirm transaction
        const confirmation = await connection.confirmTransaction(
          signature,
          "confirmed"
        );

        if (confirmation.value.err) {
          throw new Error(
            `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
          );
        }

        setLoading(false);
        return {
          signature,
          success: true,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Swap execution failed";
        setError(errorMessage);
        setLoading(false);
        return null;
      }
    },
    [publicKey, signTransaction, connection, getQuote]
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
