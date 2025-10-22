import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";

import { deriveDekFromCmk, generateCmk } from "../loyal/encryption";
import {
  createOrRestoreEphemeralKeypair,
  getIrysUploader,
} from "../loyal/irys";
import { createUserChat } from "../loyal/service";
import { UserContext } from "../loyal/types";
import { createEmptyTableOfContents } from "./helpers";

export async function createAndUploadChat(
  connection: Connection,
  wallet: AnchorWallet,
  query: string,
  context: UserContext
) {
  console.log("Creating chat");

  // 1. preparing for chat set up
  const kp = createOrRestoreEphemeralKeypair();
  const irysUploader = await getIrysUploader(kp, connection);
  const emptyTableOfContents = createEmptyTableOfContents();

  const receipt = await irysUploader.upload(
    JSON.stringify(emptyTableOfContents)
  );

  // 2. deriving encryption for the first time
  const receiptId = receipt.id;
  const cmk = generateCmk();
  const receiptIdBytes = bs58.decode(receiptId);
  const dek = await deriveDekFromCmk(cmk, receiptIdBytes);

  // 3. encrypting the query and uploading it to Irys
  const queryJson = {
    role: "user",
    text: query,
    createdAt: new Date().toISOString(),
  };
  // const encryptedQueryJson = await encryptJsonWithDek(dek, queryJson);
  const receiptQuery = await irysUploader.upload(JSON.stringify(queryJson));
  const queryId = receiptQuery.id;

  // 4. updating the table of contents with new query
  emptyTableOfContents.entries.push({
    tx_id: new PublicKey(queryId),
  });
  const tags = [
    { name: "Content-Type", value: "application/json" },
    { name: "Root-TX", value: receiptId },
  ];
  await irysUploader.upload(JSON.stringify(emptyTableOfContents), { tags });

  // 5. create new onchain chat entity
  await createUserChat(
    connection,
    wallet,
    context,
    new PublicKey(cmk),
    new PublicKey(queryId)
  );
}
