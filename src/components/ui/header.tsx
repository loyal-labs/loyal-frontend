"use client";

import {
  useAccounts,
  useDisconnect,
  usePhantom,
} from "@phantom/react-sdk";

import { useWalletSelector } from "@/components/wallet/wallet-selector-context";
import { useEffect, useState } from "react";

import { useChatMode } from "@/contexts/chat-mode-context";

export function Header() {
  const [mounted, setMounted] = useState(false);
  const { isChatMode } = useChatMode();
  const { isConnected } = usePhantom();
  const { open } = useWalletSelector();
  const { disconnect } = useDisconnect();
  const accounts = useAccounts();

  // Get Solana address for display
  const solanaAddress = accounts?.find(
    (acc) => acc.addressType === "Solana"
  )?.address;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      open();
    }
  };

  // Truncate address for display
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (!mounted) {
    return (
      <header className="fixed top-6 right-6 z-[100]">
        {/* Placeholder to prevent layout shift */}
        <div
          className="hidden md:block"
          style={{ width: "140px", height: "40px" }}
        />
      </header>
    );
  }

  return (
    <header
      className={`fixed top-6 right-6 z-[100] ${isChatMode ? "chat-mode-active" : ""}`}
    >
      <button
        className={`rounded-lg px-4 py-2 font-medium text-sm transition-colors ${
          isConnected
            ? "bg-[#ab9ff2] text-black hover:bg-[#9b8fe2]"
            : "bg-[#ab9ff2] text-black hover:bg-[#9b8fe2]"
        }`}
        onClick={handleClick}
        type="button"
      >
        {isConnected && solanaAddress
          ? truncateAddress(solanaAddress)
          : "Select Wallet"}
      </button>
    </header>
  );
}
