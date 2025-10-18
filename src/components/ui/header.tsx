"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function Header() {
  return (
    <header className="fixed right-6 top-6 z-10">
      <WalletMultiButton />
    </header>
  );
}
