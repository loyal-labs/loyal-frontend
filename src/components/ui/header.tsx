"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import {
  useWalletModal,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";

import { useChatMode } from "@/contexts/chat-mode-context";

export function Header() {
  const [mounted, setMounted] = useState(false);
  const { isChatMode } = useChatMode();
  const { connected, connecting, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Allow users to change wallet selection at any time when not connected
  const handleWalletClick = (e: React.MouseEvent) => {
    if (!connected) {
      // Prevent default wallet button behavior
      e.preventDefault();
      e.stopPropagation();

      // Disconnect any pending connection and show modal
      disconnect();
      // Small delay to ensure disconnect completes
      setTimeout(() => {
        setVisible(true);
      }, 100);
    }
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
      <div
        className={connected ? "wallet-connected" : "wallet-disconnected"}
        onClickCapture={handleWalletClick}
      >
        <WalletMultiButton />
      </div>
    </header>
  );
}
