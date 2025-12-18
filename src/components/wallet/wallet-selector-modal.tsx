"use client";

import {
  useConnect,
  useDiscoveredWallets,
  usePhantom,
} from "@phantom/react-sdk";
import { X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type WalletSelectorModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function WalletSelectorModal({
  isOpen,
  onClose,
}: WalletSelectorModalProps) {
  const { wallets, isLoading: isDiscovering } = useDiscoveredWallets();
  const { connect, isConnecting } = useConnect();
  const { isConnected } = usePhantom();
  const [connectingWalletId, setConnectingWalletId] = useState<string | null>(
    null
  );

  // Close modal when connected
  useEffect(() => {
    if (isConnected && isOpen) {
      onClose();
    }
  }, [isConnected, isOpen, onClose]);

  const handleWalletConnect = useCallback(
    async (walletId: string) => {
      setConnectingWalletId(walletId);
      try {
        await connect({ provider: "injected", walletId });
        onClose();
      } catch {
        // Silently handle connection errors - user can retry
      } finally {
        setConnectingWalletId(null);
      }
    },
    [connect, onClose]
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const handleBackdropKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        handleBackdropClick(e);
      }
    },
    [handleBackdropClick]
  );

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const renderContent = () => {
    if (isDiscovering) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      );
    }

    if (wallets.length === 0) {
      return (
        <div className="py-8 text-center">
          <p className="mb-4 text-gray-400">No wallets detected</p>
          <a
            className="inline-flex items-center gap-2 rounded-lg bg-[#ab9ff2] px-4 py-2 font-medium text-black text-sm transition-colors hover:bg-[#9b8fe2]"
            href="https://phantom.app/download"
            rel="noopener noreferrer"
            target="_blank"
          >
            Install Phantom
          </a>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        {wallets.map((wallet) => {
          const isThisConnecting = connectingWalletId === wallet.id;
          return (
            <button
              className="flex w-full items-center gap-3 rounded-xl bg-[#2a2a2a] p-4 transition-colors hover:bg-[#3a3a3a] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isConnecting}
              key={wallet.id}
              onClick={() => handleWalletConnect(wallet.id)}
              type="button"
            >
              {wallet.icon ? (
                <Image
                  alt={wallet.name}
                  className="rounded-lg"
                  height={40}
                  src={wallet.icon}
                  width={40}
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-gray-600" />
              )}
              <span className="flex-1 text-left font-medium text-white">
                {wallet.name}
              </span>
              {isThisConnecting && (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: Modal backdrop click-to-close is standard UX pattern
    <div
      aria-modal="true"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80"
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
      role="dialog"
    >
      <div className="relative w-full max-w-[400px] rounded-2xl bg-[#1a1a1a] p-6">
        <button
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-400 transition-colors hover:text-white"
          onClick={onClose}
          type="button"
        >
          <X size={20} />
        </button>

        <h2 className="mb-6 text-center font-medium text-lg text-white">
          Connect Wallet
        </h2>

        {renderContent()}
      </div>
    </div>
  );
}
