"use client";

import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { WalletSelectorModal } from "./wallet-selector-modal";

type WalletSelectorContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const WalletSelectorContext = createContext<
  WalletSelectorContextValue | undefined
>(undefined);

export function WalletSelectorProvider({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  return (
    <WalletSelectorContext.Provider value={value}>
      {children}
      <WalletSelectorModal isOpen={isOpen} onClose={close} />
    </WalletSelectorContext.Provider>
  );
}

export function useWalletSelector() {
  const context = useContext(WalletSelectorContext);
  if (!context) {
    throw new Error(
      "useWalletSelector must be used within a WalletSelectorProvider"
    );
  }
  return context;
}
