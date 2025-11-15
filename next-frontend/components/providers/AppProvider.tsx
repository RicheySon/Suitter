import {
  SuiClientProvider,
  WalletProvider,
  createNetworkConfig,
} from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionKeyProvider } from "../../providers/SessionKeyProvider";
import { MessagingClientProvider } from "../../providers/MessagingClientProvider";

const queryClient = new QueryClient();

const { networkConfig } = createNetworkConfig({
  testnet: { url: "https://fullnode.testnet.sui.io:443" },
  devnet: { url: "https://fullnode.devnet.sui.io:443" },
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider
          autoConnect={true}
          slushWallet={{
            name: "suitter",
          }}
        >
          <SessionKeyProvider>
            <MessagingClientProvider>{children}</MessagingClientProvider>
          </SessionKeyProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
