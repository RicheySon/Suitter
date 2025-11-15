import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID } from "../constants";

/**
 * Hook for commenting on a Suit
 */
export function useCommentOnSuit() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const client = useSuiClient();

  const commentOnSuit = async (
    suitId: string,
    content: string,
    onSuccess?: (digest: string) => void,
    onError?: (error: Error) => void
  ) => {
    try {
      const tx = new Transaction();

      // Get the Clock object
      const clock = tx.object("0x6");

      // Convert content to bytes
      const contentBytes = Array.from(new TextEncoder().encode(content));

      // Call comment_on_suit function
      tx.moveCall({
        target: `${PACKAGE_ID}::interactions::comment_on_suit`,
        arguments: [
          tx.object(suitId), // suit
          tx.pure.vector("u8", contentBytes), // content
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
            console.log("Comment created successfully:", result);
            
            await client.waitForTransaction({
              digest: result.digest,
            });
            
            onSuccess?.(result.digest);
          },
          onError: (error) => {
            console.error("Failed to comment:", error);
            onError?.(error as Error);
          },
        }
      );
    } catch (error) {
      console.error("Error preparing transaction:", error);
      onError?.(error as Error);
    }
  };

  return { commentOnSuit };
}
