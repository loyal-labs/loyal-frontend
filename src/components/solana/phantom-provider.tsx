"use client";

import {
  PhantomProvider as PhantomSdkProvider,
  darkTheme,
  AddressType,
} from "@phantom/react-sdk";
import { Connection } from "@solana/web3.js";
import {
  createContext,
  useContext,
  useMemo,
  type FC,
  type ReactNode,
} from "react";

type ConnectionContextValue = {
  connection: Connection;
};

const ConnectionContext = createContext<ConnectionContextValue | null>(null);

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error("useConnection must be used within PhantomWalletProvider");
  }
  return context;
};

type PhantomWalletProviderProps = {
  children: ReactNode;
};

const PHANTOM_APP_ID = "4b74c407-6337-44e5-bf42-eae48c9c35a7";

export const PhantomWalletProvider: FC<PhantomWalletProviderProps> = ({
  children,
}) => {
  const endpoint = useMemo(() => {
    const rpcEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT;
    if (!rpcEndpoint) {
      throw new Error(
        "NEXT_PUBLIC_SOLANA_RPC_ENDPOINT environment variable is not set. Please add it to your .env file."
      );
    }
    return rpcEndpoint;
  }, []);

  const connection = useMemo(() => {
    return new Connection(endpoint, {
      commitment: "confirmed",
      confirmTransactionInitialTimeout: 60_000,
    });
  }, [endpoint]);

  const connectionValue = useMemo(() => ({ connection }), [connection]);

  return (
    <PhantomSdkProvider
      appIcon="https://askloyal.com/favicon.png"
      appName="Loyal"
      config={{
        providers: ["injected", "deeplink"],
        appId: PHANTOM_APP_ID,
        addressTypes: [AddressType.solana],
      }}
      theme={darkTheme}
    >
      <ConnectionContext.Provider value={connectionValue}>
        {children}
      </ConnectionContext.Provider>
    </PhantomSdkProvider>
  );
};
