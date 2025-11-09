"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Ticker,
  TickerIcon,
  TickerPrice,
  TickerSymbol,
} from "@/components/kibo-ui/ticker";

const LOYAL_TOKEN_ADDRESS = "LYLikzBQtpa9ZgVrJsqYGQpR3cC1WMJrBHaXGrQmeta";

type TokenData = {
  symbol: string;
  icon: string;
  usdPrice: number;
};

export function LoyalTokenTicker() {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchTokenData = async () => {
      try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10_000); // 10 second timeout

        const response = await fetch(
          `https://lite-api.jup.ag/tokens/v2/search?query=${LOYAL_TOKEN_ADDRESS}`,
          { signal: controller.signal }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (mounted && data && data.length > 0) {
          const token = data[0];
          setTokenData({
            symbol: token.symbol,
            icon: token.icon,
            usdPrice: token.usdPrice,
          });
          setLoading(false);
          setRetryCount(0); // Reset retry count on success
        } else if (mounted && retryCount < 3) {
          // Retry if no data and haven't retried too many times
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, 2000); // Retry after 2 seconds
        } else if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch token data:", error);
        if (mounted && retryCount < 3) {
          // Retry on error
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, 2000);
        } else if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchTokenData();

    // Refresh every 60 seconds
    const interval = setInterval(fetchTokenData, 60_000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [retryCount]);

  if (loading || !tokenData) {
    return (
      <div className="flex items-center gap-1">
        {/* Icon skeleton */}
        <div
          className="animate-pulse rounded-full bg-white/10"
          style={{ width: "14px", height: "14px" }}
        />
        {/* Text skeletons */}
        <div
          className="h-2.5 animate-pulse rounded bg-white/10 md:h-3"
          style={{ width: "40px" }}
        />
        <div
          className="h-2.5 animate-pulse rounded bg-white/10 md:h-3"
          style={{ width: "30px" }}
        />
      </div>
    );
  }

  return (
    <Ticker
      className="loyal-ticker cursor-pointer gap-1 text-xs transition-opacity hover:opacity-80 md:text-xs"
      onClick={() =>
        window.open(
          "https://jup.ag/tokens/LYLikzBQtpa9ZgVrJsqYGQpR3cC1WMJrBHaXGrQmeta",
          "_blank",
          "noopener,noreferrer"
        )
      }
    >
      <TickerIcon asChild>
        <Image
          alt={tokenData.symbol}
          className="loyal-ticker-icon"
          height={16}
          src={tokenData.icon}
          width={16}
        />
      </TickerIcon>
      <TickerSymbol
        className="font-medium text-[10px] text-white md:text-xs"
        symbol={tokenData.symbol}
      />
      <TickerPrice
        className="text-[10px] text-white/80 md:text-xs"
        price={tokenData.usdPrice}
      />
    </Ticker>
  );
}
