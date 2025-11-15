import { useCallback, useMemo, useState } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { bcs } from "@mysten/sui/bcs";
import CONFIG from "../config";

const PACKAGE_ID = CONFIG.VITE_PACKAGE_ID;
const SUIT_REGISTRY_ID = CONFIG.SUIT_REGISTRY;

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

        tx.moveCall({
          target: `${PACKAGE_ID}::suits::create_suit`,
          arguments: [
            tx.object(SUIT_REGISTRY_ID), // &mut SuitRegistry
            tx.pure.string(content), // vector<u8> content
            tx.pure(
              bcs
                .vector(bcs.vector(bcs.u8()))
                .serialize(
                  (mediaUrls || []).map((url) =>
                    Array.from(new TextEncoder().encode(url))
                  )
                )
            ), // vector<vector<u8>> media URLs
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
