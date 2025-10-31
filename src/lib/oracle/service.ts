import type { SolanaSignInInput } from "@solana/wallet-standard-features";

import { getFromOracle } from "./client";
import { ORACLE_ROUTES } from "./constants";

export async function createDataForSIWS(): Promise<SolanaSignInInput> {
  const { data, status, statusText } = await getFromOracle<SolanaSignInInput>(
    ORACLE_ROUTES.signInWithSolana.create
  );

  if (status !== 200) {
    throw new Error(`Failed to create sign in data: ${statusText}`);
  }
  if (!data) {
    throw new Error(`Failed to create sign in data: ${statusText}`);
  }
  return data;
}
