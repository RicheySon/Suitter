import { useCallback, useMemo, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { WalrusService } from "../services/walrus";

interface UploadResult {
  blobId: string;
  url: string;
}

export function useWalrusUpload() {
  const account = useCurrentAccount();
  const address = account?.address;

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(
    async (file: File): Promise<UploadResult> => {
      if (!address) throw new Error("Wallet not connected");
      
      setIsUploading(true);
      setError(null);
      
      try {
        const result = await WalrusService.uploadFile(file, address);
        return {
          blobId: result.blobId,
          url: result.walrusUrl,
        };
      } catch (e: any) {
        const errorMessage = e?.message ?? "Upload failed";
        setError(errorMessage);
        throw e;
      } finally {
        setIsUploading(false);
      }
    },
    [address]
  );

  return useMemo(
    () => ({ uploadImage, isUploading, error }),
    [uploadImage, isUploading, error]
  );
}
