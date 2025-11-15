/**
 * Smart Contract Constants
 * 
 * Update these values after deploying your contracts to Sui testnet/mainnet
 */

// Package ID - Update this after deploying your Move package
export const PACKAGE_ID = "YOUR_PACKAGE_ID_HERE";

// Shared Object IDs - Update these after initialization
export const SUIT_REGISTRY_ID = "YOUR_SUIT_REGISTRY_ID_HERE";
export const USERNAME_REGISTRY_ID = "YOUR_USERNAME_REGISTRY_ID_HERE";
export const INTERACTION_REGISTRY_ID = "YOUR_INTERACTION_REGISTRY_ID_HERE";
export const TIP_BALANCE_REGISTRY_ID = "YOUR_TIP_BALANCE_REGISTRY_ID_HERE";
export const CHAT_REGISTRY_ID = "YOUR_CHAT_REGISTRY_ID_HERE";

// Module names
export const MODULES = {
  PROFILE: `${PACKAGE_ID}::profile`,
  SUITS: `${PACKAGE_ID}::suits`,
  INTERACTIONS: `${PACKAGE_ID}::interactions`,
  TIPPING: `${PACKAGE_ID}::tipping`,
  MESSAGING: `${PACKAGE_ID}::messaging`,
} as const;

// Network configuration
export const NETWORK = "testnet"; // or "mainnet" or "devnet"
