import { useCallback, useMemo, useState } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import CONFIG from "../config";

const PACKAGE_ID = CONFIG.VITE_PACKAGE_ID;

/**
 * NOTE: This assumes a Move entry function exists:
 * entry fun create_suit(content: vector<u8>, ctx: &mut TxContext) { ... }
 * in module `${PACKAGE_ID}::suits::suits`.
 * If the function name or signature differs, update target/arguments accordingly.
 */
export function useSuits() {
  const suiClient = useSuiClient();
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const address = account?.address ?? null;

  const postSuit = useCallback(
    async (content: string, mediaUrls?: string[]) => {
      if (!address) throw new Error("Wallet not connected");
      if (!PACKAGE_ID || PACKAGE_ID === "0x...") {
        throw new Error("VITE_PACKAGE_ID not configured");
      }
      setIsPosting(true);
      setError(null);
      try {
        const tx = new Transaction();

        // Convert media URLs to vector<vector<u8>> format
        const mediaUrlsBytes = (mediaUrls || []).map((url) =>
          Array.from(new TextEncoder().encode(url))
        );

        // create_suit(registry, content, media_urls, clock)
        tx.moveCall({
          target: `${PACKAGE_ID}::suits::create_suit`,
          arguments: [
            tx.pure.string(content), // content as vector<u8>
            tx.pure(mediaUrlsBytes, "vector<vector<u8>>"), // media_urls
            tx.object("0x6"), // Clock object
          ],
        });
        const { digest } = await signAndExecute({ transaction: tx });
        await suiClient.waitForTransaction({ digest });
        return digest;
      } catch (e: any) {
        setError(e?.message ?? "Failed to post suit");
        throw e;
      } finally {
        setIsPosting(false);
      }
    },
    [address, signAndExecute, suiClient]
  );

  return useMemo(
    () => ({ address, isPosting, error, postSuit }),
    [address, isPosting, error, postSuit]
  );
}
