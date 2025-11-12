import {
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useCallback, useState } from "react";

export type SendResult = {
  signature?: string;
  success: boolean;
  error?: string;
};

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

export function useSend() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeSend = useCallback(
    async (
      currency: string,
      amount: string,
      recipientAddress: string
    ): Promise<SendResult> => {
      if (!(publicKey && signTransaction)) {
        const error = "Wallet not connected";
        setError(error);
        return { success: false, error };
      }

      setLoading(true);
      setError(null);

      try {
        console.log("Executing send:", { currency, amount, recipientAddress });

        // Validate recipient address
        let recipientPubkey: PublicKey;
        try {
          recipientPubkey = new PublicKey(recipientAddress);
        } catch (err) {
          throw new Error("Invalid recipient wallet address");
        }

        const isSol = currency.toUpperCase() === "SOL";

        if (isSol) {
          // Send native SOL
          const amountInLamports = Math.floor(
            Number.parseFloat(amount) * LAMPORTS_PER_SOL
          );

          console.log("Sending SOL:", {
            amount,
            amountInLamports,
            from: publicKey.toBase58(),
            to: recipientPubkey.toBase58(),
          });

          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: recipientPubkey,
              lamports: amountInLamports,
            })
          );

          // Get latest blockhash
          const { blockhash } = await connection.getLatestBlockhash();
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = publicKey;

          console.log("Signing transaction...");
          const signedTransaction = await signTransaction(transaction);

          console.log("Sending signed transaction...");
          const signature = await connection.sendRawTransaction(
            signedTransaction.serialize()
          );

          console.log("Transaction sent:", signature);

          // Confirm transaction
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
        }
        // Send SPL Token
        const tokenMint = getTokenMint(currency);
        if (!tokenMint) {
          throw new Error(`Unknown token: ${currency}`);
        }

        const mintPubkey = new PublicKey(tokenMint);

        // Get decimals for the token (6 for USDC/USDT, 9 for SOL, 5 for BONK)
        const decimals = currency.toUpperCase() === "BONK" ? 5 : 6;
        const amountInSmallestUnit = Math.floor(
          Number.parseFloat(amount) * 10 ** decimals
        );

        console.log("Sending SPL token:", {
          currency,
          amount,
          amountInSmallestUnit,
          decimals,
          mint: tokenMint,
        });

        // Get associated token accounts
        const fromTokenAccount = await getAssociatedTokenAddress(
          mintPubkey,
          publicKey
        );

        const toTokenAccount = await getAssociatedTokenAddress(
          mintPubkey,
          recipientPubkey
        );

        console.log("Token accounts:", {
          from: fromTokenAccount.toBase58(),
          to: toTokenAccount.toBase58(),
        });

        const transaction = new Transaction().add(
          createTransferInstruction(
            fromTokenAccount,
            toTokenAccount,
            publicKey,
            amountInSmallestUnit
          )
        );

        // Get latest blockhash
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        console.log("Signing transaction...");
        const signedTransaction = await signTransaction(transaction);

        console.log("Sending signed transaction...");
        const signature = await connection.sendRawTransaction(
          signedTransaction.serialize()
        );

        console.log("Transaction sent:", signature);

        // Confirm transaction
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
        let errorMessage = "Send execution failed";

        if (err instanceof Error) {
          // Handle timeout errors specifically
          if (err.message.includes("timeout") || err.message.includes("Timeout")) {
            errorMessage = "Transaction signing timed out. Please try again and approve the transaction in your wallet promptly.";
          } else if (err.message.includes("User rejected")) {
            errorMessage = "Transaction was rejected in your wallet.";
          } else {
            errorMessage = err.message;
          }
        }

        setError(errorMessage);
        console.error("Send execution error:", err);
        setLoading(false);
        return { success: false, error: errorMessage };
      }
    },
    [publicKey, signTransaction, connection]
  );

  return {
    executeSend,
    loading,
    error,
  };
}
