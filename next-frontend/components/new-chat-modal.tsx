import { useState } from "react";
import { X } from "lucide-react";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (receiverAddress: string) => void;
  isLoading?: boolean;
}

export function NewChatModal({
  isOpen,
  onClose,
  onStartChat,
  isLoading,
}: NewChatModalProps) {
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic Sui address validation
    if (!address.startsWith("0x")) {
      setError("Address must start with 0x");
      return;
    }

    if (address.length < 64) {
      setError("Invalid Sui address format");
      return;
    }

    onStartChat(address);
    setAddress("");
  };

  const handleClose = () => {
    setAddress("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />

      <div className="relative bg-background rounded-2xl w-full max-w-md border border-border shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Start New Chat</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Recipient Sui Address
            </label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x..."
              className="w-full bg-muted text-foreground placeholder-muted-foreground rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-foreground/20"
              disabled={isLoading}
            />
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-border rounded-full font-semibold hover:bg-muted transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-foreground text-background rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              disabled={isLoading || !address}
            >
              {isLoading ? "Starting..." : "Start Chat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
