# Suitter Smart Contract Deployment Guide

This guide walks you through deploying the Suitter smart contracts to Sui.

## Prerequisites

1. Install Sui CLI: https://docs.sui.io/guides/developer/getting-started/sui-install
2. Set up a Sui wallet with testnet SUI
3. Configure your Sui client

```bash
# Check Sui CLI installation
sui --version

# Check active address
sui client active-address

# Get testnet SUI (if needed)
# Join Sui Discord and use the faucet channel
```

## Step 1: Build the Package

```bash
cd Suits
sui move build
```

This will compile your Move code and check for errors.

## Step 2: Run Tests

```bash
sui move test
```

All 13 tests should pass before deployment.

## Step 3: Publish to Testnet

```bash
sui client publish --gas-budget 100000000
```

**Important**: Save the output! You'll need:
- Package ID
- All created object IDs (registries)

Example output:
```
----- Transaction Digest ----
<TRANSACTION_DIGEST>

----- Transaction Data ----
...

----- Transaction Effects ----
Status : Success
Created Objects:
  - ID: 0xABC123... , Owner: Shared
    Type: 0xPACKAGE_ID::suits::SuitRegistry
  - ID: 0xDEF456... , Owner: Shared
    Type: 0xPACKAGE_ID::profile::UsernameRegistry
  ...
```

## Step 4: Extract Object IDs

From the transaction output, find and note:

1. **Package ID**: The published package ID
2. **SuitRegistry**: Object with type `::suits::SuitRegistry`
3. **UsernameRegistry**: Object with type `::profile::UsernameRegistry`
4. **InteractionRegistry**: Object with type `::interactions::InteractionRegistry`
5. **TipBalanceRegistry**: Object with type `::tipping::TipBalanceRegistry`
6. **ChatRegistry**: Object with type `::messaging::ChatRegistry`

## Step 5: Verify Deployment

```bash
# View the package
sui client object <PACKAGE_ID>

# View a registry
sui client object <SUIT_REGISTRY_ID>
```

## Step 6: Update Frontend Constants

Edit `frontend/src/constants.ts`:

```typescript
export const PACKAGE_ID = "0xYOUR_PACKAGE_ID_HERE";
export const SUIT_REGISTRY_ID = "0xYOUR_SUIT_REGISTRY_ID";
export const USERNAME_REGISTRY_ID = "0xYOUR_USERNAME_REGISTRY_ID";
export const INTERACTION_REGISTRY_ID = "0xYOUR_INTERACTION_REGISTRY_ID";
export const TIP_BALANCE_REGISTRY_ID = "0xYOUR_TIP_BALANCE_REGISTRY_ID";
export const CHAT_REGISTRY_ID = "0xYOUR_CHAT_REGISTRY_ID";
```

## Step 7: Test the Integration

```bash
cd frontend
npm install
npm run dev
```

1. Connect your wallet
2. Try creating a Suit
3. Try liking a Suit
4. Try commenting on a Suit

## Deployment Checklist

- [ ] Code builds successfully (`sui move build`)
- [ ] All tests pass (`sui move test`)
- [ ] Package published to testnet
- [ ] Package ID saved
- [ ] All registry object IDs saved
- [ ] Frontend constants updated
- [ ] Frontend tested with real transactions

## Troubleshooting

### Build Errors

```bash
# Clean and rebuild
sui move clean
sui move build
```

### Insufficient Gas

Make sure you have enough SUI:
```bash
sui client gas
```

Get more testnet SUI from the Discord faucet.

### Object Not Found

If you can't find the registry objects:

```bash
# List all objects you own
sui client objects

# Filter by type
sui client objects --filter StructType --type "<PACKAGE_ID>::suits::SuitRegistry"
```

### Transaction Fails

Check the transaction on Sui Explorer:
- Testnet: https://suiexplorer.com/?network=testnet
- Mainnet: https://suiexplorer.com/?network=mainnet

## Upgrading the Contract

To upgrade your package:

```bash
# Build with upgrade capability
sui client publish --gas-budget 100000000 --upgrade-capability

# Later, upgrade
sui client upgrade --package-id <PACKAGE_ID> --gas-budget 100000000
```

## Mainnet Deployment

When ready for mainnet:

1. Switch to mainnet:
```bash
sui client switch --env mainnet
```

2. Ensure you have mainnet SUI for gas

3. Follow the same deployment steps

4. Update frontend to use mainnet network

## Security Considerations

Before mainnet deployment:
- [ ] Complete security audit
- [ ] Test all functions thoroughly on testnet
- [ ] Verify all error handling
- [ ] Test with multiple users
- [ ] Check gas costs
- [ ] Review access controls

## Cost Estimation

Approximate gas costs on testnet:
- Package publication: ~0.1-0.5 SUI
- Create Suit: ~0.001-0.005 SUI
- Like Suit: ~0.001-0.003 SUI
- Comment: ~0.001-0.005 SUI

Actual costs may vary based on network conditions.

## Support Resources

- Sui Documentation: https://docs.sui.io
- Sui Discord: https://discord.gg/sui
- Sui Explorer: https://suiexplorer.com
- Move Language: https://move-language.github.io/move/

## Next Steps

After successful deployment:
1. Test all features thoroughly
2. Monitor transaction costs
3. Gather user feedback
4. Plan feature additions
5. Consider security audit for mainnet
