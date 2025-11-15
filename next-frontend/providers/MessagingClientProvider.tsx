import { useSuiClient } from "@mysten/dapp-kit";
import { SealClient } from "@mysten/seal";
import { SuiStackMessagingClient } from "@mysten/messaging";
import { createContext, useContext, useMemo, ReactNode } from "react";
import { useSessionKey } from "./SessionKeyProvider";

// Seal servers for testnet
const SEAL_SERVERS = [
  "0x87e73dab48efd8f74f287e426c16b0cd8a73c046e30d79e7b1ab20c0b0870088",
  "0x0c62a862b9c52e25c4b5f1fb81da3e0c09b95f00c96dece97f38c62c8d62d15b",
];

// Walrus configuration for testnet
const WALRUS_CONFIG = {
  publisher: "https://publisher.walrus-testnet.walrus.space",
  aggregator: "https://aggregator.walrus-testnet.walrus.space",
  epochs: 1,
};

// Extended client type - using any for simplicity since the nested generic type is complex
type ExtendedSuiClient = any;

interface MessagingClientContextType {
  messagingClient: ExtendedSuiClient | null;
}

const MessagingClientContext = createContext<
  MessagingClientContextType | undefined
>(undefined);

interface MessagingClientProviderProps {
  children: ReactNode;
}

export const MessagingClientProvider = ({
  children,
}: MessagingClientProviderProps) => {
  const suiClient = useSuiClient();
  const { sessionKey } = useSessionKey();

  const messagingClient = useMemo(() => {
    if (!sessionKey) {
      return null;
    }

    // Create extended client with Seal and Messaging capabilities
    const extendedClient = suiClient
      .$extend(
        SealClient.asClientExtension({
          serverConfigs: SEAL_SERVERS.map((objectId) => ({
            objectId,
            weight: 1,
          })),
        })
      )
      .$extend(
        SuiStackMessagingClient.experimental_asClientExtension({
          walrusStorageConfig: WALRUS_CONFIG,
          sessionKey,
        })
      );

    return extendedClient;
  }, [suiClient, sessionKey]);

  return (
    <MessagingClientContext.Provider value={{ messagingClient }}>
      {children}
    </MessagingClientContext.Provider>
  );
};

export const useMessagingClient = () => {
  const context = useContext(MessagingClientContext);
  if (context === undefined) {
    throw new Error(
      "useMessagingClient must be used within MessagingClientProvider"
    );
  }
  return context.messagingClient;
};
