import { SessionKey } from "@mysten/seal";
import {
  useCurrentAccount,
  useSignPersonalMessage,
  useSuiClient,
} from "@mysten/dapp-kit";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

const PACKAGE_ID =
  "0x984960ebddd75c15c6d38355ac462621db0ffc7d6647214c802cd3b685e1af3d";
const SESSION_KEY_TTL_MIN = 30; // 30 minutes

interface SessionKeyContextType {
  sessionKey: SessionKey | null;
  isInitializing: boolean;
  error: string | null;
  initializeSessionKey: () => Promise<void>;
}

const SessionKeyContext = createContext<SessionKeyContextType | undefined>(
  undefined
);

interface SessionKeyProviderProps {
  children: ReactNode;
}

export const SessionKeyProvider = ({ children }: SessionKeyProviderProps) => {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const suiClient = useSuiClient();
  const [sessionKey, setSessionKey] = useState<SessionKey | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load session key from localStorage if available and not expired
  useEffect(() => {
    if (!currentAccount) {
      setSessionKey(null);
      return;
    }

    const storageKey = `sessionKey-${currentAccount.address}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const key = SessionKey.import(parsed.sessionKey, suiClient);

        // Check if expired
        if (key.isExpired()) {
          localStorage.removeItem(storageKey);
          setSessionKey(null);
        } else {
          setSessionKey(key);
        }
      } catch (err) {
        console.error("Failed to load session key from storage:", err);
        localStorage.removeItem(storageKey);
      }
    }
  }, [currentAccount, suiClient]);

  // Manual initialization function
  const initializeSessionKey = useCallback(async () => {
    if (!currentAccount) {
      setError("No account connected");
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      // Create session key
      const key = await SessionKey.create({
        address: currentAccount.address,
        packageId: PACKAGE_ID,
        ttlMin: SESSION_KEY_TTL_MIN,
        suiClient,
      });

      // Sign the personal message
      const personalMessage = key.getPersonalMessage();
      const { signature } = await signPersonalMessage({
        message: personalMessage,
      });

      // Set the signature
      await key.setPersonalMessageSignature(signature);

      setSessionKey(key);

      // Save to localStorage
      const storageKey = `sessionKey-${currentAccount.address}`;
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          sessionKey: key.export(),
          address: currentAccount.address,
          createdAt: Date.now(),
        })
      );
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to create session key";
      setError(errorMsg);
      console.error("Error creating session key:", err);
    } finally {
      setIsInitializing(false);
    }
  }, [currentAccount, signPersonalMessage, suiClient]);

  return (
    <SessionKeyContext.Provider
      value={{ sessionKey, isInitializing, error, initializeSessionKey }}
    >
      {children}
    </SessionKeyContext.Provider>
  );
};

export const useSessionKey = () => {
  const context = useContext(SessionKeyContext);
  if (context === undefined) {
    throw new Error("useSessionKey must be used within SessionKeyProvider");
  }
  return context;
};
