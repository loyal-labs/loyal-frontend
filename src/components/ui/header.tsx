"use client";

import { ConnectButton } from "@phantom/react-sdk";
import { useEffect, useState } from "react";

import { useChatMode } from "@/contexts/chat-mode-context";

export function Header() {
  const [mounted, setMounted] = useState(false);
  const { isChatMode } = useChatMode();

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <style>{`
        header button {
          min-height: 46px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
      `}</style>
      <ConnectButton />
    </header>
  );
}
