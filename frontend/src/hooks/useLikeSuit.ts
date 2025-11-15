import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID, INTERACTION_REGISTRY_ID } from "../constants";

/**
 * Hook for liking a Suit
 */
export function useLikeSuit() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const client = useSuiClient();

  const likeSuit = async (
    suitId: string,
    onSuccess?: (digest: string) => void,
    onError?: (error: Error) => void
  ) => {
    try {
      const tx = new Transaction();

      // Get the Clock object
      const clock = tx.object("0x6");

      // Call like_suit function
      tx.moveCall({
        target: `${PACKAGE_ID}::interactions::like_suit`,
        arguments: [
          tx.object(suitId), // suit
          tx.object(INTERACTION_REGISTRY_ID), // registry
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
            console.log("Suit liked successfully:", result);
            
            await client.waitForTransaction({
              digest: result.digest,
            });
            
            onSuccess?.(result.digest);
          },
          onError: (error) => {
            console.error("Failed to like suit:", error);
            onError?.(error as Error);
          },
        }
      );
    } catch (error) {
      console.error("Error preparing transaction:", error);
      onError?.(error as Error);
    }
  };

  return { likeSuit };
}
