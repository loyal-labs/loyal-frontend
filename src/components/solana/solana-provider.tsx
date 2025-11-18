"use client";

import "@solana/wallet-adapter-react-ui/styles.css";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  CoinbaseWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { type FC, type ReactNode, useMemo } from "react";

type SolanaProviderProps = {
  children: ReactNode;
};

export const SolanaProvider: FC<SolanaProviderProps> = ({ children }) => {
  const network = WalletAdapterNetwork.Mainnet;
  // Using QuickNode endpoint to avoid 403 errors from public RPC
  const endpoint = useMemo(() => {
    const rpcEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT;
    if (!rpcEndpoint) {
      throw new Error(
        "NEXT_PUBLIC_SOLANA_RPC_ENDPOINT environment variable is not set. Please add it to your .env file."
      );
    }
    return rpcEndpoint;
  }, []);

  // Configure connection with appropriate timeout and commitment settings
  const config = useMemo(
    () => ({
      commitment: "confirmed" as const,
      confirmTransactionInitialTimeout: 60_000, // 60 seconds
    }),
    []
  );

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      // Remove Solflare to prevent X-Frame-Options iframe crash
      // Users can still use Solflare mobile app or browser extension
      // new SolflareWalletAdapter({ network }),
      new CoinbaseWalletAdapter({ network }),
    ],
    [network]
  );

  return (
    <ConnectionProvider config={config} endpoint={endpoint}>
      <WalletProvider autoConnect wallets={wallets}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
