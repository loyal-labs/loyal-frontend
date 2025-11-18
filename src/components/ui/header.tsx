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

  // Allow users to change wallet during connection
  const handleWalletClick = () => {
    if (connecting) {
      // Disconnect current attempt and show modal again
      disconnect();
      setVisible(true);
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
        onClick={handleWalletClick}
      >
        <WalletMultiButton />
      </div>
    </header>
  );
}
