# Quick Start Guide

## Setup (5 minutes)

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Update Contract Addresses

Edit `src/constants.ts` with your deployed contract addresses:

```typescript
export const PACKAGE_ID = "0xYOUR_PACKAGE_ID";
export const SUIT_REGISTRY_ID = "0xYOUR_SUIT_REGISTRY_ID";
// ... update all IDs
```

### 3. Run Development Server
```bash
npm run dev
```

Open http://localhost:5173

## Usage

### Connect Wallet
1. Click "Connect Wallet" button
2. Select your Sui wallet (Sui Wallet, Suiet, Ethos, etc.)
3. Approve the connection

### Create a Suit (Post)
```typescript
import { useCreateSuit } from './hooks';

const { createSuit } = useCreateSuit();

createSuit(
  "Hello Suitter!",
  [], // optional media URLs
  (digest) => console.log("Posted!", digest),
  (error) => console.error(error)
);
```

### Like a Suit
```typescript
import { useLikeSuit } from './hooks';

const { likeSuit } = useLikeSuit();

likeSuit(
  suitId,
  () => console.log("Liked!"),
  (error) => console.error(error)
);
```

### Comment on a Suit
```typescript
import { useCommentOnSuit } from './hooks';

const { commentOnSuit } = useCommentOnSuit();

commentOnSuit(
  suitId,
  "Great post!",
  () => console.log("Commented!"),
  (error) => console.error(error)
);
```

### Create Profile
```typescript
import { useCreateProfile } from './hooks';

const { createProfile } = useCreateProfile();

createProfile(
  "myusername",
  "My bio",
  "https://example.com/avatar.jpg",
  () => console.log("Profile created!"),
  (error) => console.error(error)
);
```

## Components

### CreateSuitForm
Ready-to-use form for creating Suits:
```tsx
import { CreateSuitForm } from './components/CreateSuitForm';

<CreateSuitForm />
```

### SuitsList
Display all Suits with like/comment functionality:
```tsx
import { SuitsList } from './components/SuitsList';

<SuitsList />
```

## Common Issues

### "Please connect your wallet first"
- Click the "Connect Wallet" button in the header
- Make sure you have a Sui wallet extension installed

### "Object not found"
- Verify contract addresses in `src/constants.ts`
- Make sure you're on the correct network (testnet/mainnet)

### "Insufficient gas"
- Get testnet SUI from Discord faucet
- Check your wallet balance

### Transaction fails silently
- Open browser console (F12) to see error details
- Check transaction on Sui Explorer

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── CreateSuitForm.tsx    # Form to create Suits
│   │   └── SuitsList.tsx         # Display Suits feed
│   ├── hooks/
│   │   ├── useCreateSuit.ts      # Create Suit hook
│   │   ├── useLikeSuit.ts        # Like Suit hook
│   │   ├── useCommentOnSuit.ts   # Comment hook
│   │   ├── useCreateProfile.ts   # Profile creation hook
│   │   └── index.ts              # Export all hooks
│   ├── constants.ts              # Contract addresses
│   ├── App.tsx                   # Main app component
│   └── main.tsx                  # Entry point
```

## Development Tips

### Hot Reload
The dev server supports hot reload. Changes to components will update automatically.

### TypeScript
All hooks and components are fully typed. Use TypeScript for better DX.

### Debugging Transactions
```typescript
createSuit(
  content,
  [],
  (digest) => {
    console.log("Success! View on explorer:");
    console.log(`https://suiexplorer.com/txblock/${digest}?network=testnet`);
  },
  (error) => {
    console.error("Transaction failed:", error);
  }
);
```

### Query Sui Objects
```typescript
import { useSuiClientQuery } from "@mysten/dapp-kit";

const { data, isLoading } = useSuiClientQuery(
  "getObject",
  {
    id: objectId,
    options: { showContent: true }
  }
);
```

## Next Steps

1. ✅ Connect wallet
2. ✅ Create your first Suit
3. ✅ Like and comment on Suits
4. 🔜 Create your profile
5. 🔜 Add more features (retweet, tipping, messaging)

## Resources

- [Full Integration Guide](./INTEGRATION_GUIDE.md)
- [Sui dApp Kit Docs](https://sdk.mystenlabs.com/dapp-kit)
- [Sui TypeScript SDK](https://sdk.mystenlabs.com/typescript)
- [Move Smart Contracts](../Suits/sources/)

## Support

Need help? Check:
1. Browser console for errors
2. Sui Explorer for transaction details
3. Smart contract source code in `Suits/sources/`
4. Test files in `Suits/tests/` for usage examples
