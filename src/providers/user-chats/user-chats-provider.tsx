"use client";

import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import type { PropsWithChildren } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  fetchAllUserChats,
  fetchUserContext,
  initializeUserContext,
} from "@/lib/loyal/service";
import type { UserChat, UserContext } from "@/lib/loyal/types";

type UserChatsContextValue = {
  userContext: UserContext | null;
  userChats: UserChat[];
  isLoading: boolean;
  refreshUserChats: () => Promise<void>;
};

const UserChatsContext = createContext<UserChatsContextValue | undefined>(
  undefined
);

export const UserChatsProvider = ({ children }: PropsWithChildren) => {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [userChats, setUserChats] = useState<UserChat[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadUserChats = useCallback(
    async (options?: { signal?: AbortSignal }) => {
      if (!anchorWallet) {
        setUserContext(null);
        setUserChats([]);
        setIsLoading(false);
        return;
      }

      const { signal } = options ?? {};

      setIsLoading(true);

      try {
        let context = await fetchUserContext(connection, anchorWallet);
        if (signal?.aborted) return;

        if (!context) {
          context = await initializeUserContext(connection, anchorWallet);
        }

        if (!context || signal?.aborted) {
          return;
        }

        setUserContext(context);
        const chats =
          (await fetchAllUserChats(
            connection,
            anchorWallet,
            context.nextChatId
          )) ?? [];

        if (!signal?.aborted) {
          setUserChats(chats);
        }
      } catch (error) {
        if (signal?.aborted) {
          return;
        }
        console.error("Failed to refresh user chats", error);
        setUserContext(null);
        setUserChats([]);
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [anchorWallet, connection]
  );

  const refreshUserChats = useCallback(async () => {
    await loadUserChats();
  }, [loadUserChats]);

  useEffect(() => {
    if (!anchorWallet) {
      setUserContext(null);
      setUserChats([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    void loadUserChats({ signal: controller.signal });

    return () => {
      controller.abort();
    };
  }, [anchorWallet, loadUserChats]);

  const value = useMemo<UserChatsContextValue>(
    () => ({
      userContext,
      userChats,
      isLoading,
      refreshUserChats,
    }),
    [isLoading, refreshUserChats, userChats, userContext]
  );

  return (
    <UserChatsContext.Provider value={value}>
      {children}
    </UserChatsContext.Provider>
  );
};

export const useUserChats = () => {
  const context = useContext(UserChatsContext);
  if (!context) {
    throw new Error("useUserChats must be used within a UserChatsProvider");
  }
  return context;
};
