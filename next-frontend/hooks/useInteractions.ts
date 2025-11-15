import { useCallback, useMemo, useState } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import CONFIG from "../config";

const PACKAGE_ID = CONFIG.VITE_PACKAGE_ID;
const INTERACTION_REGISTRY_ID = CONFIG.INTERACTION_REGISTRY;

export function useInteractions() {
  const suiClient = useSuiClient();
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isRetweeting, setIsRetweeting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const address = account?.address ?? null;

  const likeSuit = useCallback(
    async (suitId: string) => {
      if (!address) throw new Error("Wallet not connected");
      if (!PACKAGE_ID || PACKAGE_ID === "0x...") {
        throw new Error("VITE_PACKAGE_ID not configured");
      }
      setIsLiking(true);
      setError(null);
      try {
        const tx = new Transaction();

        tx.moveCall({
          target: `${PACKAGE_ID}::interactions::like_suit`,
          arguments: [
            tx.object(suitId), // &mut Suit
            tx.object(INTERACTION_REGISTRY_ID), // &mut InteractionRegistry
            tx.object("0x6"), // Clock object
          ],
        });

        const { digest } = await signAndExecute({ transaction: tx });
        await suiClient.waitForTransaction({ digest });
        return digest;
      } catch (e: any) {
        setError(e?.message ?? "Failed to like suit");
        throw e;
      } finally {
        setIsLiking(false);
      }
    },
    [address, signAndExecute, suiClient]
  );

  const commentOnSuit = useCallback(
    async (suitId: string, content: string) => {
      if (!address) throw new Error("Wallet not connected");
      if (!PACKAGE_ID || PACKAGE_ID === "0x...") {
        throw new Error("VITE_PACKAGE_ID not configured");
      }
      setIsCommenting(true);
      setError(null);
      try {
        const tx = new Transaction();

        tx.moveCall({
          target: `${PACKAGE_ID}::interactions::comment_on_suit`,
          arguments: [
            tx.object(suitId), // &mut Suit
            tx.pure.string(content), // vector<u8> content
            tx.object("0x6"), // Clock object
          ],
        });

        const { digest } = await signAndExecute({ transaction: tx });
        await suiClient.waitForTransaction({ digest });
        return digest;
      } catch (e: any) {
        setError(e?.message ?? "Failed to comment on suit");
        throw e;
      } finally {
        setIsCommenting(false);
      }
    },
    [address, signAndExecute, suiClient]
  );

  const retweetSuit = useCallback(
    async (suitId: string) => {
      if (!address) throw new Error("Wallet not connected");
      if (!PACKAGE_ID || PACKAGE_ID === "0x...") {
        throw new Error("VITE_PACKAGE_ID not configured");
      }
      setIsRetweeting(true);
      setError(null);
      try {
        const tx = new Transaction();

        tx.moveCall({
          target: `${PACKAGE_ID}::interactions::retweet_suit`,
          arguments: [
            tx.object(suitId), // &mut Suit
            tx.object(INTERACTION_REGISTRY_ID), // &mut InteractionRegistry
            tx.object("0x6"), // Clock object
          ],
        });

        const { digest } = await signAndExecute({ transaction: tx });
        await suiClient.waitForTransaction({ digest });
        return digest;
      } catch (e: any) {
        setError(e?.message ?? "Failed to retweet suit");
        throw e;
      } finally {
        setIsRetweeting(false);
      }
    },
    [address, signAndExecute, suiClient]
  );

  const checkUserLiked = useCallback(
    async (suitId: string, userAddress: string) => {
      try {
        // Note: This is a simplified check. In production, you'd need to query
        // the likes table or check for owned Like objects
        const likeObjects = await suiClient.getOwnedObjects({
          owner: userAddress,
          filter: {
            StructType: `${PACKAGE_ID}::interactions::Like`,
          },
        });

        return likeObjects.data.some((obj: any) => {
          const fields = obj.data?.content?.fields;
          return fields?.suit_id === suitId;
        });
      } catch (e) {
        console.error("Failed to check if user liked:", e);
        return false;
      }
    },
    [suiClient]
  );

  const checkUserRetweeted = useCallback(
    async (suitId: string, userAddress: string) => {
      try {
        const retweetObjects = await suiClient.getOwnedObjects({
          owner: userAddress,
          filter: {
            StructType: `${PACKAGE_ID}::interactions::Retweet`,
          },
        });

        return retweetObjects.data.some((obj: any) => {
          const fields = obj.data?.content?.fields;
          return fields?.original_suit_id === suitId;
        });
      } catch (e) {
        console.error("Failed to check if user retweeted:", e);
        return false;
      }
    },
    [suiClient]
  );

  return useMemo(
    () => ({
      address,
      isLiking,
      isCommenting,
      isRetweeting,
      error,
      likeSuit,
      commentOnSuit,
      retweetSuit,
      checkUserLiked,
      checkUserRetweeted,
    }),
    [
      address,
      isLiking,
      isCommenting,
      isRetweeting,
      error,
      likeSuit,
      commentOnSuit,
      retweetSuit,
      checkUserLiked,
      checkUserRetweeted,
    ]
  );
}
