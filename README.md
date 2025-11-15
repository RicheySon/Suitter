# Suitter - Decentralized Social Network on Sui

![Suitter Logo](https://img.shields.io/badge/Suitter-Decentralized%20Social%20Network-blue?style=for-the-badge&logo=sui&logoColor=white)
![Sui Blockchain](https://img.shields.io/badge/Powered%20by-Sui%20Blockchain-blue?style=flat-square)
![Hackathon Project](https://img.shields.io/badge/Sui%20Move-Hackathon%20Project-orange?style=flat-square)

A censorship-resistant, user-owned social network alternative to X (Twitter) built on the Sui blockchain.

## Live Demo

Deployment URL: [https://suiitter.vercel.app](https://suitter.vercel.app)

## Table of Contents

- [Overview](#overview)
- [Team Members](#team-members)
- [Features](#features)
- [Architecture](#architecture)
- [Technical Stack](#technical-stack)
- [Smart Contracts](#smart-contracts)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

## Overview

Suitter is a decentralized social network built on the Sui blockchain that provides users with ownership of their data and content. Unlike traditional social platforms, Suitter offers censorship resistance, user sovereignty, and monetization opportunities through NFTs.

Users can create posts (Suits), interact with content through likes and comments, discover and connect with other users, and start direct conversations - all while maintaining full ownership of their data and content.

### Hackathon Challenge Requirements Met

Core Requirements:
- Posting (Suits): Create Post Objects (Suits) as dedicated Move objects with text content
- Suitter Feed: Functional frontend feed that retrieves and renders all published Suits with pagination
- Public Deployment: Frontend deployed on Vercel with public access

Bonus Features Implemented:
- Interactions: On-chain objects for Comments and Likes with real-time updates
- zkLogin Integration: Sui's ZK Login for seamless web2 user authentication
- Profiles: Complete Profile system with username, bio, and profile image binding
- Social Features: User discovery, profile viewing, and direct messaging
- Advanced Features: Real-time search, balance management, asset tracking, and more

## Team Members

- Godrich Armah ( Github profile ::  @RicheySon )
- Abdul Hafis Mohammed ( Github profile :: @pious2847 )
- Michael Perry Nii Tettey ( Github profile :: @theniitettey )
- Gabriel Kwame Addo Quainoo    ( Github profile :: @Gabby-Tech1 )


## Features

### Core Features

- Decentralized Posting: Create and own your posts as Sui objects (Suits)
- Real-time Feed: Dynamic feed with automatic refresh every 5 seconds
- User Profiles: Custom usernames, bios, and profile pictures
- Profile Discovery: View and explore other users' profiles
- Direct Messaging: Start conversations directly from user profiles
- Interactions: Like, comment, and repost functionality
- Advanced Search: Search users, posts, and content with filters
- Wallet Integration: Seamless Sui wallet connection
- zkLogin: Web2-style authentication with blockchain security

### User Experience

- Responsive Design: Optimized for desktop and mobile
- Dark/Light Mode: Theme switching capability
- Fast Performance: Optimized with React and Vite
- Intuitive UI: Twitter-like interface with modern design
- Real-time Updates: Live feed updates and notifications
- Enhanced Compose: Clickable compose section with profile avatar display

### Advanced Features

- Balance Management: Real SUI balance display with hide/show toggle
- NFT Assets: View and manage your Suit NFTs and other assets
- Smart Search: Multi-type search (users, posts, content)
- Analytics: Engagement metrics and post performance
- Privacy Controls: Balance hiding and content encryption options

## Architecture

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Smart         │    │   Sui           │
│   (React/TS)    │◄──►│   Contracts     │◄──►│   Blockchain    │
│                 │    │   (Move)        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User          │    │   Sui Objects   │    │   Walrus        │
│   Interface     │    │   (Suits,       │    │   Storage       │
│                 │    │    Profiles)    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Smart Contract Architecture

```
SuitRegistry (0x13ae63b88414ef8e40cc26f042911e83c90456c05dffeb8fbabc85c0d32d4134)
├── Suit Objects
│   ├── Content (text)
│   ├── Creator (address)
│   ├── Timestamp
│   ├── Engagement (likes, comments, reposts)
│   └── Media URLs
│
├── InteractionRegistry (0x41f4cc6d57beb4f5416efd4e15c0660cc046c5a366d3704062431e76298e8454)
│   ├── Like Objects
│   ├── Comment Objects
│   └── Repost Objects
│
└── UsernameRegistry (0x485c056cf156b3fe659d0484836f07c03cf5e11cb6af4fbf8789c7db5bfa69a2)
    └── Profile Objects
        ├── Username
        ├── Bio
        └── Profile Picture URL
```

## Technical Stack

### Frontend
- Framework: React 18 with TypeScript
- Build Tool: Vite
- Styling: Tailwind CSS + Radix UI
- State Management: React Hooks + Context
- Blockchain: @mysten/dapp-kit, @mysten/sui.js
- Storage: Walrus (decentralized storage)

### Backend (Smart Contracts)
- Language: Move (Sui)
- Runtime: Sui Blockchain
- Package ID: `0x0` (to be updated after deployment)
- Edition: 2024.beta

### Development Tools
- Package Manager: pnpm
- Linting: ESLint
- Type Checking: TypeScript
- Deployment: Vercel
- Version Control: Git

## Smart Contracts

### Package Information
- Package ID: `0x0` (Deployed on Sui Testnet)
- Module: `suits`
- Dependencies: Sui Framework

### Key Objects

#### 1. Suit (Post Object)
```move
struct Suit has key, store {
    id: UID,
    creator: address,
    content: String,
    created_at: u64,
    like_count: u64,
    comment_count: u64,
    retweet_count: u64,
    media_urls: vector<String>,
}
```

#### 2. Profile
```move
struct Profile has key, store {
    id: UID,
    owner: address,
    username: String,
    bio: String,
    pfp_url: String,
}
```

#### 3. Like
```move
struct Like has key, store {
    id: UID,
    suit_id: ID,
    liker: address,
}
```

## Installation & Setup

### Prerequisites

- Node.js: v18 or higher
- pnpm: v8 or higher
- Sui Wallet: Browser extension or mobile wallet
- Git: Version control system

### Local Development Setup

1. Clone the repository
   ```bash
   git clone https://github.com/RicheySon/Suitter.git
   cd Suitter
   ```

2. Install dependencies
   ```bash
   cd next-frontend
   pnpm install
   ```

3. Environment Configuration
   ```bash
   # Create .env.local file
   cp .env.example .env.local

   # Add your configuration
   VITE_PACKAGE_ID=your_deployed_package_id
   VITE_WALRUS_URL=https://walrus.example.com
   ```

4. Deploy Smart Contracts (Optional for development)
   ```bash
   cd ../Suits
   sui client publish --gas-budget 100000000
   ```

5. Start development server
   ```bash
   cd ../next-frontend
   pnpm dev
   ```

6. Build for production
   ```bash
   pnpm build
   pnpm preview
   ```

### Smart Contract Deployment

```bash
# Navigate to contracts directory
cd Suits

# Publish to Sui testnet
sui client publish --gas-budget 100000000

# Note the package ID from the output
# Update config/index.ts with the deployed package ID
```

## Usage

### For Users

1. Connect Wallet: Click "Connect Wallet" and select your Sui wallet
2. Create Profile: Set up your username, bio, and profile picture
3. Start Posting: Create your first Suit (post) with text and media
4. Explore: Browse the feed, search for users and content
5. Discover Users: Click on usernames in posts to view other users' profiles
6. Connect: Start direct conversations with other users from their profiles
7. Interact: Like, comment, and repost other users' content
8. Manage Assets: View your SUI balance and NFT collection

### For Developers

```typescript
// Example: Create a new Suit
import { useSuits } from '../hooks/useSuits'

const { postSuit } = useSuits()

await postSuit("Hello, Suitter! This is my first post on the decentralized social network!")

// Example: Fetch user profile
import { useProfile } from '../hooks/useProfile'

const { fetchProfileByAddress } = useProfile()

const profile = await fetchProfileByAddress(userAddress)
```

## API Reference

### Hooks

#### `useSuits()`
- `fetchSuits(limit, offset)`: Fetch suits from blockchain
- `postSuit(content, mediaUrls)`: Create new suit
- `isPosting`: Loading state for posting

#### `useProfile()`
- `fetchMyProfile()`: Get current user's profile
- `fetchProfileByAddress(address)`: Get profile by address
- `fetchMyProfileFields()`: Get current user's profile fields
- `createProfile(username, bio, pfpUrl)`: Create new profile

#### `useInteractions()`
- `likeSuit(suitId)`: Like a suit
- `commentOnSuit(suitId, content)`: Comment on a suit
- `retweetSuit(suitId)`: Repost a suit

#### `useMessaging()`
- `startChat(otherUserAddress)`: Start a new chat with another user
- `fetchChats()`: Fetch user's chat conversations
- `sendMessage(chatId, content)`: Send message in a chat

#### `useSearch()`
- `search(query, filters)`: Search users and posts
- `searchUsers(query)`: Search only users
- `searchPosts(query)`: Search only posts

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed
- Ensure code passes linting checks

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

