import { ReactNode } from "react";

// This provider is simplified since we're using direct smart contract calls
// No need for Mysten messaging SDK or session keys
interface MessagingClientProviderProps {
  children: ReactNode;
}

export const MessagingClientProvider = ({
  children,
}: MessagingClientProviderProps) => {
  // Provider is now just a pass-through
  // All messaging logic is handled directly in useMessaging hook
  return <>{children}</>;
};
