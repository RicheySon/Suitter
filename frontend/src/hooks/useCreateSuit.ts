import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID, SUIT_REGISTRY_ID } from "../constants";

/**
 * Hook for creating a new Suit (post)
 */
export function useCreateSuit() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const client = useSuiClient();

  const createSuit = async (
    content: string,
    mediaUrls: string[] = [],
    onSuccess?: (digest: string) => void,
    onError?: (error: Error) => void
  ) => {
    try {
      const tx = new Transaction();

      // Get the Clock object (0x6 is the shared Clock object on Sui)
      const clock = tx.object("0x6");

      // Convert content and media URLs to bytes
      const contentBytes = Array.from(new TextEncoder().encode(content));
      const mediaUrlsBytes = mediaUrls.map((url) =>
        Array.from(new TextEncoder().encode(url))
      );

      // Call create_suit function
      tx.moveCall({
        target: `${PACKAGE_ID}::suits::create_suit`,
        arguments: [
          tx.object(SUIT_REGISTRY_ID), // registry
          tx.pure.vector("u8", contentBytes), // content
          tx.pure.vector("vector<u8>", mediaUrlsBytes), // media_urls
          clock, // clock
        ],
      });

      // Execute transaction
      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: async (result) => {
            console.log("Suit created successfully:", result);
            
            // Wait for transaction to be confirmed
            await client.waitForTransaction({
              digest: result.digest,
            });
            
            onSuccess?.(result.digest);
          },
          onError: (error) => {
            console.error("Failed to create suit:", error);
            onError?.(error as Error);
          },
        }
      );
    } catch (error) {
      console.error("Error preparing transaction:", error);
      onError?.(error as Error);
    }
  };

  return { createSuit };
}
