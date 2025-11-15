import { useCallback, useMemo, useRef, useState } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { WalrusClient } from "@mysten/walrus";
import { SuiClient } from "@mysten/sui/client";

interface UploadResult {
  blobId: string;
  url: string;
}

export function useWalrusUpload() {
  const account = useCurrentAccount();
  const address = account?.address;
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const clientRef = useRef<WalrusClient | null>(null);
  const walrusSuiClientRef = useRef<SuiClient | null>(null);

  if (!clientRef.current) {
    // Walrus requires its own SuiClient pointing to testnet
    walrusSuiClientRef.current = new SuiClient({
      url: "https://fullnode.testnet.sui.io:443",
    });
    clientRef.current = new WalrusClient({
      network: "testnet",
      suiClient: walrusSuiClientRef.current,
    });
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
        await walrusSuiClientRef.current!.waitForTransaction({
          digest: registerDigest,
        });
        await flow.upload({ digest: registerDigest });
        const certifyTx = flow.certify();
        const { digest: certifyDigest } = await signAndExecute({
          transaction: certifyTx,
        });
        await walrusSuiClientRef.current!.waitForTransaction({
          digest: certifyDigest,
        });
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
    [address, signAndExecute]
  );

  return useMemo(
    () => ({ uploadImage, isUploading, error }),
    [uploadImage, isUploading, error]
  );
}
