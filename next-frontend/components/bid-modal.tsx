import { X } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  suitId: string;
  suitName: string;
  currentValue: number;
  currentBid: number;
  onPlaceBid: (amount: number) => void;
}

export function BidModal({
  isOpen,
  onClose,
  suitId: _suitId,
  suitName,
  currentValue,
  currentBid,
  onPlaceBid,
}: BidModalProps) {
  const [bidAmount, setBidAmount] = useState((currentBid + 0.1).toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      onPlaceBid(parseFloat(bidAmount));
      setBidAmount((currentBid + 0.1).toString());
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const minBid = currentBid + 0.1;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background border border-border rounded-2xl shadow-lg max-w-md w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-bold text-foreground">Place Your Bid</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Suit</p>
            <p className="font-semibold text-foreground">{suitName}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 p-3 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">
                Original Value
              </p>
              <p className="font-bold text-foreground">{currentValue} SUI</p>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Current Bid</p>
              <p className="font-bold text-foreground">{currentBid} SUI</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Your Bid Amount (minimum {minBid} SUI)
            </label>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              step="0.1"
              min={minBid}
              placeholder="Enter bid amount"
              className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/20 transition-all"
            />
            <p className="text-xs text-muted-foreground mt-2">
              You must bid at least {minBid} SUI
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-blue-700 dark:text-blue-400">
              ℹ️ Bids are binding. Once placed, your bid cannot be cancelled.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2 px-4 border border-border rounded-lg font-semibold hover:bg-muted/30 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || parseFloat(bidAmount) < minBid}
              className="flex-1 py-2 px-4 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? "Placing..." : "Place Bid"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
