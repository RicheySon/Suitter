import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  Share,
  MoreHorizontal,
} from "lucide-react";
import { formatTime } from "@/lib/utils";
import { OwnershipHistoryModal } from "./ownership-history-modal";
import { BidModal } from "./bid-modal";

interface SuitCardProps {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  content: string;
  timestamp: number;
  likes: number;
  replies: number;
  reposts: number;
  liked: boolean;
  isNFT?: boolean;
  nftValue?: number;
  currentBid?: number;
  isEncrypted?: boolean;
  onLike: (id: string) => void;
  onBookmark: (id: string, isBookmarked: boolean) => void;
  bookmarked?: boolean;
}

export function SuitCard({
  id,
  author,
  handle,
  avatar,
  content,
  timestamp,
  likes,
  replies,
  reposts,
  liked,
  isNFT = true,
  nftValue = 0.5,
  currentBid = 0.75,
  isEncrypted = false,
  onLike,
  onBookmark,
  bookmarked = false,
}: SuitCardProps) {
  const [showBidMenu, setShowBidMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);

  const ownershipHistory = [
    {
      owner: author,
      handle: handle,
      avatar: avatar,
      amount: currentBid,
      type: "bid" as const,
      date: Date.now() - 1 * 60 * 60 * 1000,
    },
    {
      owner: "Sui Developer",
      handle: "sui_dev",
      avatar: "S",
      amount: nftValue,
      type: "purchase" as const,
      date: Date.now() - 7 * 24 * 60 * 60 * 1000,
    },
    {
      owner: "Creator",
      handle: "creator",
      avatar: "C",
      amount: 0,
      type: "mint" as const,
      date: Date.now() - 30 * 24 * 60 * 60 * 1000,
    },
  ];

  const handlePlaceBid = (amount: number) => {
    console.log("[v0] Bid placed:", amount, "SUI for suit", id);
    setShowBidMenu(false);
  };

  return (
    <>
      <article className="border-b border-border p-4 hover:bg-muted/30 transition-colors cursor-pointer group relative">
        <div className="flex gap-4 flex-col">
          <div className="flex-1 min-w-0">
            {/* Header with Author Info and Three-Dot Menu */}
            <div className="flex items-center justify-between">
              {/* Avatar */}
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {avatar}
              </div>
              <div className="flex items-center gap-1 text-sm flex-wrap">
                <span className="font-semibold text-foreground hover:underline">
                  {author}
                </span>
                <span className="text-muted-foreground">@{handle}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground hover:underline">
                  {formatTime(timestamp)}
                </span>
                {isNFT && (
                  <span
                    className={`ml-2 text-xs font-semibold px-2 py-1 rounded-full ${
                      isEncrypted
                        ? "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                        : "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    {isEncrypted ? "🔐 NFT" : "📦 Suit"}
                  </span>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowBidMenu(!showBidMenu)}
                  className="p-2 rounded-full hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="More options"
                >
                  <MoreHorizontal size={16} className="text-muted-foreground" />
                </button>

                {showBidMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-xl shadow-lg z-10 p-3 space-y-2">
                    {isNFT && (
                      <>
                        <div className="pb-3 border-b border-border">
                          <div className="text-xs text-muted-foreground mb-1">
                            Suit Value
                          </div>
                          <div className="text-lg font-bold text-foreground">
                            {nftValue} SUI
                          </div>
                          {currentBid > nftValue && (
                            <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                              Current bid: {currentBid} SUI
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            setShowBidMenu(false);
                            setShowBidModal(true);
                          }}
                          className="w-full py-2 px-3 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm"
                        >
                          Place Bid
                        </button>
                        <button
                          onClick={() => {
                            setShowBidMenu(false);
                            setShowHistory(true);
                          }}
                          className="w-full py-2 px-3 border border-border rounded-lg font-semibold hover:bg-muted/30 transition-colors text-sm"
                        >
                          View History
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <p className="mt-2 text-base text-foreground break-words">
            {content}
          </p>

          {/* Action Buttons with Icons and Counts */}
          <div className="mt-3 flex justify-between text-muted-foreground max-w-md">
            <button className="flex items-center gap-2 p-2 rounded-full hover:bg-muted transition-colors group/btn">
              <MessageCircle size={16} />
              <span className="text-xs">{replies}</span>
            </button>
            <button className="flex items-center gap-2 p-2 rounded-full hover:bg-muted transition-colors group/btn">
              <Repeat2 size={16} />
              <span className="text-xs">{reposts}</span>
            </button>
            <button
              onClick={() => onLike(id)}
              className="flex items-center gap-2 p-2 rounded-full hover:bg-muted transition-colors group/btn"
            >
              <Heart
                size={16}
                fill={liked ? "currentColor" : "none"}
                color={liked ? "#000" : "currentColor"}
              />
              <span className="text-xs">{likes}</span>
            </button>
            <button
              onClick={() => onBookmark(id, !bookmarked)}
              className="flex items-center gap-2 p-2 rounded-full hover:bg-muted transition-colors group/btn"
            >
              <Bookmark
                size={16}
                fill={bookmarked ? "currentColor" : "none"}
                color={bookmarked ? "#000" : "currentColor"}
              />
              <span className="text-xs">{bookmarked ? "1" : "0"}</span>
            </button>
            <button className="flex items-center gap-2 p-2 rounded-full hover:bg-muted transition-colors group/btn">
              <Share size={16} />
            </button>
          </div>
        </div>
      </article>

      <OwnershipHistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        suitId={id}
        suitName={content}
        history={ownershipHistory}
      />

      <BidModal
        isOpen={showBidModal}
        onClose={() => setShowBidModal(false)}
        suitId={id}
        suitName={content}
        currentValue={nftValue || 0.5}
        currentBid={currentBid || 0.75}
        onPlaceBid={handlePlaceBid}
      />
    </>
  );
}
