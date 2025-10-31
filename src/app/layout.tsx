import "./globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SolanaProvider } from "@/components/solana/solana-provider";
import { Header } from "@/components/ui/header";
import { UserChatsProvider } from "@/providers/user-chats";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Loyal: Privacy Preserving Intelligence",
  description: "True private intelligence network: open-source privacy-preserving AI with confidential compute in TEE and attested runtimes.",
  metadataBase: new URL("https://askloyal.com"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.png", rel: "icon", type: "image/png" },
      { url: "/favicon.ico", rel: "icon" },
    ],
    shortcut: "/favicon.png",
    apple: [
      { url: "/favicon.png", sizes: "180x180" },
    ],
  },
  openGraph: {
    type: "website",
    url: "https://askloyal.com/",
    title: "Loyal: Privacy Preserving Intelligence",
    description: "True private intelligence network: open-source privacy-preserving AI with confidential compute in TEE and attested runtimes.",
    images: [
      {
        url: "/card1.jpg",
        width: 1033,
        height: 542,
        alt: "Loyal network visual",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Loyal: Privacy Preserving Intelligence",
    description: "True private intelligence network: open-source privacy-preserving AI with confidential compute in TEE and attested runtimes.",
    images: [
      {
        url: "/card2.jpg",
        alt: "Loyal private intelligence preview",
      },
    ],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SolanaProvider>
          <UserChatsProvider>
            <Header />
            {children}
          </UserChatsProvider>
        </SolanaProvider>
      </body>
    </html>
  );
}
