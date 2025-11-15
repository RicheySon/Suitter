import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID, USERNAME_REGISTRY_ID } from "../constants";

/**
 * Hook for creating a user profile
 */
export function useCreateProfile() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const client = useSuiClient();

  const createProfile = async (
    username: string,
    bio: string,
    pfpUrl: string,
    onSuccess?: (digest: string) => void,
    onError?: (error: Error) => void
  ) => {
    try {
      const tx = new Transaction();

      // Convert strings to bytes
      const usernameBytes = Array.from(new TextEncoder().encode(username));
      const bioBytes = Array.from(new TextEncoder().encode(bio));
      const pfpUrlBytes = Array.from(new TextEncoder().encode(pfpUrl));

      // Call create_profile function
      const [profile] = tx.moveCall({
        target: `${PACKAGE_ID}::profile::create_profile`,
        arguments: [
          tx.object(USERNAME_REGISTRY_ID), // registry
          tx.pure.vector("u8", usernameBytes), // username
          tx.pure.vector("u8", bioBytes), // bio
          tx.pure.vector("u8", pfpUrlBytes), // pfp_url
        ],
      });

      // Transfer the profile to the sender
      tx.transferObjects([profile], tx.pure.address(await client.getAddress()));

      // Execute transaction
      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: async (result) => {
            console.log("Profile created successfully:", result);
            
            await client.waitForTransaction({
              digest: result.digest,
            });
            
            onSuccess?.(result.digest);
          },
          onError: (error) => {
            console.error("Failed to create profile:", error);
            onError?.(error as Error);
          },
        }
      );
    } catch (error) {
      console.error("Error preparing transaction:", error);
      onError?.(error as Error);
    }
  };

  return { createProfile };
}
