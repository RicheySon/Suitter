import { useCallback, useMemo, useRef, useState } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { WalrusClient } from "@mysten/walrus";

interface UploadResult {
  blobId: string;
  url: string;
}

export function useWalrusUpload() {
  const account = useCurrentAccount();
  const address = account?.address;
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const clientRef = useRef<WalrusClient | null>(null);
  if (!clientRef.current) {
    // Instantiate for testnet (adjust if environment differs)
    clientRef.current = new WalrusClient({ network: "testnet", suiClient });
  }

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(
    async (file: File): Promise<UploadResult> => {
      if (!address) throw new Error("Wallet not connected");
      if (!clientRef.current) throw new Error("Walrus client not ready");
      setIsUploading(true);
      setError(null);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const flow = clientRef.current.writeBlobFlow({ blob: bytes });
        await flow.encode();
        const registerTx = flow.register({
          epochs: 5,
          deletable: false,
          owner: address,
        });
        const { digest: registerDigest } = await signAndExecute({
          transaction: registerTx,
        });
        // Wait for registration to finalize before upload
        await suiClient.waitForTransaction({ digest: registerDigest });
        await flow.upload({ digest: registerDigest });
        const certifyTx = flow.certify();
        const { digest: certifyDigest } = await signAndExecute({
          transaction: certifyTx,
        });
        await suiClient.waitForTransaction({ digest: certifyDigest });
        const { blobId } = await flow.getBlob();
        // Construct a public URL (testnet storage domain convention)
        const url = `https://walrus-testnet.storage.mystenlabs.com/blob/${blobId}`;
        return { blobId, url };
      } catch (e: any) {
        setError(e?.message ?? "Upload failed");
        throw e;
      } finally {
        setIsUploading(false);
      }
    },
    [address, signAndExecute, suiClient]
  );

  return useMemo(
    () => ({ uploadImage, isUploading, error }),
    [uploadImage, isUploading, error]
  );
}
