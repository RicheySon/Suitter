# Project Structure and Registry Initialization Summary

## Overview
This document summarizes the project structure setup and registry initialization for the Suitter social network smart contracts.

## 1. Move.toml Configuration

**Updated Dependencies:**
- Added Sui framework dependency pointing to the testnet branch
- Configuration: `Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "framework/testnet" }`

## 2. Module Structure

The project consists of 5 main Move modules:

### Profile Module (`suits::profile`)
- **Purpose**: User identity and profile management
- **Registry**: `UsernameRegistry` - Enforces unique usernames across the platform
- **Initialization**: Creates shared UsernameRegistry with Table<String, address> mapping

### Suits Module (`suits::suits`)
- **Purpose**: Post creation and management
- **Registry**: `SuitRegistry` - Tracks all Suits for feed queries
- **Initialization**: Creates shared SuitRegistry with Table<ID, address> and vector<ID> for ordered tracking

### Interactions Module (`suits::interactions`)
- **Purpose**: User engagement (likes, comments, retweets)
- **Registry**: `InteractionRegistry` - Prevents duplicate likes and retweets
- **Initialization**: Creates shared InteractionRegistry with separate Tables for likes and retweets

### Tipping Module (`suits::tipping`)
- **Purpose**: Content monetization and earnings management
- **Registry**: `TipBalanceRegistry` - Maps user addresses to their tip balances
- **Initialization**: Creates shared TipBalanceRegistry with Table<address, ID> mapping

### Messaging Module (`suits::messaging`)
- **Purpose**: Encrypted peer-to-peer communication
- **Registry**: `ChatRegistry` - Finds chats between users and prevents duplicates
- **Initialization**: Creates shared ChatRegistry with Table<vector<u8>, ID> for composite keys

## 3. Error Constants

All error constants have been defined across modules with non-overlapping ranges:
- Profile: 1-9
- Suits: 10-19
- Interactions: 20-29
- Tipping: 30-39
- Messaging: 40-49

See `ERROR_CONSTANTS.md` for complete reference.

## 4. Initialization Functions

Each module includes an `init` function that:
- Is called automatically once during module deployment
- Creates the module's registry as a shared object
- Makes the registry accessible to all users for reading and authorized modifications

### Registry Initialization Flow

When the package is published to Sui:
1. Each module's `init` function executes automatically
2. Registry objects are created with unique UIDs
3. Registries are shared using `transfer::share_object()`
4. Registries become globally accessible at their object IDs

## 5. Next Steps

With the project structure and registries initialized, the next tasks involve:
- Implementing the Profile module with username validation and registration
- Building the Suits module for post creation and feed queries
- Creating interaction functions (like, comment, retweet)
- Implementing the tipping and withdrawal system
- Enhancing the messaging module with encryption support

## Files Created/Modified

### Modified:
- `Suits/Move.toml` - Added Sui framework dependency
- `Suits/sources/profile.move` - Added UsernameRegistry and init function
- `Suits/sources/suits.move` - Created module structure with SuitRegistry
- `Suits/sources/messaging.move` - Added ChatRegistry and updated error constants

### Created:
- `Suits/sources/interactions.move` - Complete module with InteractionRegistry
- `Suits/sources/tipping.move` - Complete module with TipBalanceRegistry
- `Suits/ERROR_CONSTANTS.md` - Error constants reference
- `Suits/INITIALIZATION_SUMMARY.md` - This document

## Verification

All modules compile without errors and are ready for implementation of business logic in subsequent tasks.
