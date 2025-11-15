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
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const address = account?.address ?? null;

  const fetchSuits = useCallback(
    async (limit: number = 20, offset: number = 0) => {
      setIsFetching(true);
      setError(null);
      try {
        // Get the SuitRegistry to fetch suit IDs
        const registry = await suiClient.getObject({
          id: SUIT_REGISTRY_ID,
          options: { showContent: true },
        });

        const registryContent = registry.data?.content as any;
        const suitIds = registryContent?.fields?.suit_ids || [];

        // Get recent suits (reverse order for newest first)
        const recentSuitIds = suitIds
          .slice(-limit - offset)
          .reverse()
          .slice(offset, offset + limit);

        // Fetch all suit objects
        const suits = await Promise.all(
          recentSuitIds.map(async (id: string) => {
            try {
              const suit = await suiClient.getObject({
                id,
                options: { showContent: true, showOwner: true },
              });
              return suit.data;
            } catch (e) {
              console.error(`Failed to fetch suit ${id}:`, e);
              return null;
            }
          })
        );

        return suits.filter(Boolean);
      } catch (e: any) {
        setError(e?.message ?? "Failed to fetch suits");
        console.error("Failed to fetch suits:", e);
        return [];
      } finally {
        setIsFetching(false);
      }
    },
    [suiClient]
  );

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
    () => ({ address, isPosting, isFetching, error, postSuit, fetchSuits }),
    [address, isPosting, isFetching, error, postSuit, fetchSuits]
  );
}
