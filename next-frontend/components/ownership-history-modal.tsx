import { X } from "lucide-react";
import { motion } from "framer-motion";

interface OwnershipRecord {
  owner: string;
  handle: string;
  avatar: string;
  amount: number;
  type: "purchase" | "bid" | "mint" | "transfer";
  date: number;
}

interface OwnershipHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  suitId: string;
  suitName: string;
  history: OwnershipRecord[];
}

export function OwnershipHistoryModal({
  isOpen,
  onClose,
  suitId: _suitId,
  suitName,
  history,
}: OwnershipHistoryModalProps) {
  if (!isOpen) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "mint":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
      case "purchase":
        return "bg-green-500/20 text-green-700 dark:text-green-400";
      case "bid":
        return "bg-amber-500/20 text-amber-700 dark:text-amber-400";
      case "transfer":
        return "bg-purple-500/20 text-purple-700 dark:text-purple-400";
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-400";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "mint":
        return "Minted";
      case "purchase":
        return "Purchased";
      case "bid":
        return "Bid Placed";
      case "transfer":
        return "Transferred";
      default:
        return type;
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background border border-border rounded-2xl shadow-lg max-w-lg w-full max-h-96 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-bold text-foreground">Ownership History</h3>
            <p className="text-xs text-muted-foreground">{suitName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-3 p-4">
            {history.map((record, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {record.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {record.owner}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(record.date)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${getTypeColor(
                      record.type
                    )}`}
                  >
                    {getTypeLabel(record.type)}
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {record.amount} SUI
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
