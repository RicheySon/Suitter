import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading, Tabs } from "@radix-ui/themes";
import { WalletStatus } from "./WalletStatus";
import { CreateSuitForm } from "./components/CreateSuitForm";
import { SuitsList } from "./components/SuitsList";

function App() {
  return (
    <>
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        style={{
          borderBottom: "1px solid var(--gray-a2)",
        }}
      >
        <Box>
          <Heading>Suitter - Decentralized Social Network</Heading>
        </Box>

        <Box>
          <ConnectButton />
        </Box>
      </Flex>
      <Container>
        <Container
          mt="5"
          pt="2"
          px="4"
          style={{ minHeight: 500 }}
        >
          <Tabs.Root defaultValue="feed">
            <Tabs.List>
              <Tabs.Trigger value="feed">Feed</Tabs.Trigger>
              <Tabs.Trigger value="create">Create Suit</Tabs.Trigger>
              <Tabs.Trigger value="wallet">Wallet Info</Tabs.Trigger>
            </Tabs.List>

            <Box pt="4">
              <Tabs.Content value="feed">
                <Flex direction="column" gap="4">
                  <Heading size="6">Latest Suits</Heading>
                  <SuitsList />
                </Flex>
              </Tabs.Content>

              <Tabs.Content value="create">
                <CreateSuitForm />
              </Tabs.Content>

              <Tabs.Content value="wallet">
                <WalletStatus />
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </Container>
      </Container>
    </>
  );
}

export default App;
