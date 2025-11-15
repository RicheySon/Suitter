import { useCallback, useMemo, useState } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import CONFIG from "../config";

const PACKAGE_ID = CONFIG.VITE_PACKAGE_ID;
const USERNAME_REGISTRY_ID = CONFIG.USERNAME_REGISTRY;
const PROFILE_TYPE = `${PACKAGE_ID}::profile::Profile`;

export function useProfile() {
  const suiClient = useSuiClient();
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const address = account?.address ?? null;

  const fetchMyProfile = useCallback(async () => {
    if (!address) return null;
    try {
      const res = await suiClient.getOwnedObjects({
        owner: address,
        filter: { StructType: PROFILE_TYPE },
        options: { showType: true, showContent: true, showDisplay: true },
      });
      const obj = res.data?.[0];
      if (!obj) return null;
      return obj;
    } catch (e) {
      console.error("fetchMyProfile failed", e);
      return null;
    }
  }, [address, suiClient]);

  const fetchMyProfileFields = useCallback(async () => {
    const obj: any = await fetchMyProfile();
    if (!obj) return null;
    const content = obj?.data?.content;
    const objectId = obj?.data?.objectId ?? obj?.objectId;
    let username = "";
    let bio = "";
    let pfpUrl = "";
    let fields = {};
    if (content && typeof content === "object" && "fields" in content) {
      fields = (content as any).fields;
    }
    const readStr = (v: any) => {
      if (typeof v === "string") return v;
      if (v && typeof v === "object" && typeof v.bytes === "string")
        return v.bytes;
      return "";
    };
    if ((fields as any).username) username = readStr((fields as any).username);
    if ((fields as any).bio) bio = readStr((fields as any).bio);
    if ((fields as any).pfp_url) pfpUrl = readStr((fields as any).pfp_url);
    return { profileId: objectId as string, username, bio, pfpUrl };
  }, [fetchMyProfile]);

  const fetchProfileByAddress = useCallback(
    async (userAddress: string) => {
      if (!userAddress) return null;
      try {
        const res = await suiClient.getOwnedObjects({
          owner: userAddress,
          filter: { StructType: PROFILE_TYPE },
          options: { showType: true, showContent: true, showDisplay: true },
        });
        const obj = res.data?.[0];
        if (!obj) return null;

        const content = obj?.data?.content;
        const objectId = obj?.data?.objectId;
        let fields = {};
        if (content && typeof content === "object" && "fields" in content) {
          fields = (content as any).fields;
        }
        const readStr = (v: any) => {
          if (typeof v === "string") return v;
          if (v && typeof v === "object" && typeof v.bytes === "string")
            return v.bytes;
          return "";
        };
        const username = (fields as any).username
          ? readStr((fields as any).username)
          : "";
        const bio = (fields as any).bio ? readStr((fields as any).bio) : "";
        const pfpUrl = (fields as any).pfp_url
          ? readStr((fields as any).pfp_url)
          : "";
        return { profileId: objectId as string, username, bio, pfpUrl };
      } catch (e) {
        console.error("fetchProfileByAddress failed", e);
        return null;
      }
    },
    [suiClient]
  );

  const createProfile = useCallback(
    async (username: string, bio: string, pfpUrl: string) => {
      if (!address) throw new Error("Wallet not connected");
      if (!PACKAGE_ID || PACKAGE_ID === "0x...") {
        throw new Error("VITE_PACKAGE_ID not configured");
      }
      if (!USERNAME_REGISTRY_ID) {
        throw new Error("USERNAME_REGISTRY not configured");
      }
      setIsLoading(true);
      setError(null);
      try {
        const tx = new Transaction();
        // create_profile returns a Profile object that needs to be transferred
        const [profile] = tx.moveCall({
          target: `${PACKAGE_ID}::profile::create_profile`,
          arguments: [
            tx.object(USERNAME_REGISTRY_ID), // &mut UsernameRegistry
            tx.pure.string(username),
            tx.pure.string(bio),
            tx.pure.string(pfpUrl),
          ],
        });
        // Transfer the profile to the sender
        tx.transferObjects([profile], tx.pure.address(address));
        const { digest } = await signAndExecute({ transaction: tx });
        await suiClient.waitForTransaction({ digest });
        return digest;
      } catch (e: any) {
        setError(e?.message ?? "Failed to create profile");
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [address, signAndExecute, suiClient]
  );

  const updateProfile = useCallback(
    async (
      profileId: string,
      username: string,
      bio: string,
      pfpUrl: string
    ) => {
      if (!address) throw new Error("Wallet not connected");
      if (!PACKAGE_ID || PACKAGE_ID === "0x...") {
        throw new Error("VITE_PACKAGE_ID not configured");
      }
      if (!USERNAME_REGISTRY_ID) {
        throw new Error("USERNAME_REGISTRY not configured");
      }
      setIsLoading(true);
      setError(null);
      try {
        const tx = new Transaction();
        tx.moveCall({
          target: `${PACKAGE_ID}::profile::update_profile`,
          arguments: [
            tx.object(profileId), // &mut Profile
            tx.object(USERNAME_REGISTRY_ID), // &mut UsernameRegistry
            tx.pure.string(username),
            tx.pure.string(bio),
            tx.pure.string(pfpUrl),
          ],
        });
        const { digest } = await signAndExecute({ transaction: tx });
        await suiClient.waitForTransaction({ digest });
        return digest;
      } catch (e: any) {
        setError(e?.message ?? "Failed to update profile");
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [address, signAndExecute, suiClient]
  );

  return useMemo(
    () => ({
      address,
      isLoading,
      error,
      fetchMyProfile,
      fetchMyProfileFields,
      fetchProfileByAddress,
      createProfile,
      updateProfile,
    }),
    [
      address,
      isLoading,
      error,
      fetchMyProfile,
      fetchMyProfileFields,
      fetchProfileByAddress,
      createProfile,
      updateProfile,
    ]
  );
}
