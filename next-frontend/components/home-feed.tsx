import { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useSuits } from "../hooks/useSuits";
import { useInteractions } from "../hooks/useInteractions";
import { useProfile } from "../hooks/useProfile";
import { SuitCard } from "./suit-card";
import { FeedVertical } from "./feed-vertical";
import { ReplyModal } from "./reply-modal";
import { truncateAddress } from "@/lib/utils";

interface Suit {
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
  reposted?: boolean;
  isNFT: boolean;
  nftValue: number;
  currentBid: number;
  isEncrypted: boolean;
  media?: {
    type: "image" | "video";
    url: string;
  };
}

interface HomeFeedProps {
  onCompose: () => void;
}

const SAMPLE_SUITS: Suit[] = [
  {
    id: "1",
    author: "Sui Foundation",
    handle: "suifoundation",
    avatar: "S",
    content:
      "Introducing Suiter - a production-ready decentralized social network built on Sui blockchain. Every post is an NFT with dynamic value.",
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    likes: 1243,
    replies: 342,
    reposts: 856,
    liked: false,
    reposted: false,
    isNFT: true,
    nftValue: 0.5,
    currentBid: 0.75,
    isEncrypted: true,
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
    },
  },
  {
    id: "2",
    author: "Developer Insights",
    handle: "devinsights",
    avatar: "D",
    content:
      "Building on Sui with React and TypeScript. The performance is incredible. Transactions finalize in milliseconds.",
    timestamp: Date.now() - 4 * 60 * 60 * 1000,
    likes: 892,
    replies: 156,
    reposts: 423,
    liked: false,
    reposted: false,
    isNFT: true,
    nftValue: 0.3,
    currentBid: 0.4,
    isEncrypted: false,
    media: {
      type: "video",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
  },
  {
    id: "3",
    author: "Web3 Daily",
    handle: "web3daily",
    avatar: "W",
    content:
      "Monochrome elegance meets decentralization. No distractions, just pure connection on the blockchain.",
    timestamp: Date.now() - 6 * 60 * 60 * 1000,
    likes: 2156,
    replies: 678,
    reposts: 1245,
    liked: false,
    reposted: false,
    isNFT: true,
    nftValue: 0.8,
    currentBid: 1.2,
    isEncrypted: true,
  },
];

const FOLLOWING_SUITS: Suit[] = [
  {
    id: "f1",
    author: "Sui Builder",
    handle: "suibuilder",
    avatar: "SB",
    content:
      "Just deployed my first dApp on Sui testnet! The developer experience is amazing. Gas fees are incredibly low compared to other chains.",
    timestamp: Date.now() - 1 * 60 * 60 * 1000,
    likes: 456,
    replies: 89,
    reposts: 123,
    liked: false,
    reposted: false,
    isNFT: true,
    nftValue: 0.4,
    currentBid: 0.55,
    isEncrypted: false,
  },
  {
    id: "f2",
    author: "NFT Collector",
    handle: "nftcollector",
    avatar: "NC",
    content:
      "My latest NFT collection on Sui is live! Each piece represents a unique moment in blockchain history. Check out the dynamic metadata updates.",
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
    likes: 789,
    replies: 234,
    reposts: 456,
    liked: true,
    reposted: false,
    isNFT: true,
    nftValue: 1.2,
    currentBid: 1.5,
    isEncrypted: true,
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800&q=80",
    },
  },
  {
    id: "f3",
    author: "DeFi Enthusiast",
    handle: "defilife",
    avatar: "DE",
    content:
      "Sui's parallel execution is a game changer for DeFi. No more waiting for transactions to process sequentially. The future is here!",
    timestamp: Date.now() - 5 * 60 * 60 * 1000,
    likes: 1024,
    replies: 178,
    reposts: 567,
    liked: false,
    reposted: true,
    isNFT: true,
    nftValue: 0.6,
    currentBid: 0.8,
    isEncrypted: false,
  },
  {
    id: "f4",
    author: "Move Developer",
    handle: "movedev",
    avatar: "MD",
    content:
      "Writing smart contracts in Move is such a pleasant experience. The safety guarantees and expressiveness make development faster and more secure.",
    timestamp: Date.now() - 8 * 60 * 60 * 1000,
    likes: 623,
    replies: 145,
    reposts: 289,
    liked: true,
    reposted: false,
    isNFT: true,
    nftValue: 0.35,
    currentBid: 0.45,
    isEncrypted: true,
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    },
  },
];

export function HomeFeed({ onCompose }: HomeFeedProps) {
  const account = useCurrentAccount();
  const address = account?.address ?? null;
  const { fetchSuits, isFetching } = useSuits();
  const {
    likeSuit,
    retweetSuit,
    commentOnSuit,
    isLiking,
    isRetweeting,
    isCommenting,
  } = useInteractions();
  const { fetchProfileByAddress } = useProfile();
  const [forYouSuits, setForYouSuits] = useState<Suit[]>(SAMPLE_SUITS);
  const [followingSuits, setFollowingSuits] = useState<Suit[]>(FOLLOWING_SUITS);
  const [onChainSuits, setOnChainSuits] = useState<Suit[]>([]);
  const [tab, setTab] = useState<"foryou" | "following" | "feed">("foryou");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyToSuit, setReplyToSuit] = useState<Suit | null>(null);

  // Fetch on-chain suits on mount
  useEffect(() => {
    const loadSuits = async () => {
      const suits = await fetchSuits(20, 0);

      // Transform on-chain suits to component format
      const transformedPromises = suits.map(async (suit: any) => {
        const fields = suit?.content?.fields;
        if (!fields) return null;

        const creatorAddress = fields.creator || "";
        let displayName = truncateAddress(creatorAddress || "Unknown");
        let handleName = truncateAddress(creatorAddress || "unknown", 4, 4);

        // Fetch profile for the creator
        if (creatorAddress) {
          const profile = await fetchProfileByAddress(creatorAddress);
          if (profile && profile.username) {
            displayName = profile.username;
            handleName = profile.username;
          }
        }

        return {
          id: suit.objectId,
          author: displayName,
          handle: handleName,
          avatar: creatorAddress?.slice(-2).toUpperCase() || "??",
          content: fields.content || "",
          timestamp: parseInt(fields.created_at) || Date.now(),
          likes: parseInt(fields.like_count) || 0,
          replies: parseInt(fields.comment_count) || 0,
          reposts: parseInt(fields.retweet_count) || 0,
          liked: false,
          reposted: false,
          isNFT: true,
          nftValue: 0,
          currentBid: 0,
          isEncrypted: false,
          media:
            fields.media_urls?.length > 0
              ? {
                  type: "image" as const,
                  url: fields.media_urls[0],
                }
              : undefined,
        };
      });

      const transformed = (await Promise.all(transformedPromises)).filter(
        Boolean
      ) as Suit[];

      setOnChainSuits(transformed);
    };

    const intervalId = setInterval(() => {
      loadSuits();
    }, 2000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);

    // loadSuits();
  }, [fetchSuits, fetchProfileByAddress]);

  // Get current suits based on active tab
  const currentSuits =
    tab === "following"
      ? followingSuits
      : tab === "foryou"
      ? [...onChainSuits, ...forYouSuits]
      : forYouSuits;

  const toggleLike = async (id: string) => {
    if (!address) {
      console.log("Please connect wallet to like");
      return;
    }

    const suit = currentSuits.find((s) => s.id === id);
    if (!suit) return;
    const isOnChain = id.startsWith("0x");

    // Optimistically update UI - update both arrays
    const updateSuit = (suits: Suit[]) =>
      suits.map((s) =>
        s.id === id
          ? {
              ...s,
              liked: !s.liked,
              likes: s.liked ? s.likes - 1 : s.likes + 1,
            }
          : s
      );

    setOnChainSuits(updateSuit(onChainSuits));
    setForYouSuits(updateSuit(forYouSuits));
    setFollowingSuits(updateSuit(followingSuits));

    // Only call blockchain for on-chain suits
    if (isOnChain) {
      try {
        await likeSuit(id);
        console.log("Suit liked successfully!");
      } catch (error: any) {
        console.error("Failed to like suit:", error);
        // Revert optimistic update on error
        const revertSuit = (suits: Suit[]) =>
          suits.map((s) =>
            s.id === id
              ? {
                  ...s,
                  liked: suit.liked,
                  likes: suit.likes,
                }
              : s
          );

        setOnChainSuits(revertSuit(onChainSuits));
        setForYouSuits(revertSuit(forYouSuits));
        setFollowingSuits(revertSuit(followingSuits));
      }
    }
  };

  const toggleRepost = async (id: string) => {
    if (!address) {
      console.log("Please connect wallet to retweet");
      return;
    }

    const suit = currentSuits.find((s) => s.id === id);
    if (!suit) return;
    const isOnChain = id.startsWith("0x");

    // Optimistically update UI - update both arrays
    const updateSuit = (suits: Suit[]) =>
      suits.map((s) =>
        s.id === id
          ? {
              ...s,
              reposted: !s.reposted,
              reposts: s.reposted ? s.reposts - 1 : s.reposts + 1,
            }
          : s
      );

    setOnChainSuits(updateSuit(onChainSuits));
    setForYouSuits(updateSuit(forYouSuits));
    setFollowingSuits(updateSuit(followingSuits));

    // Only call blockchain for on-chain suits
    if (isOnChain) {
      try {
        await retweetSuit(id);
        console.log("Suit retweeted successfully!");
      } catch (error: any) {
        console.error("Failed to retweet suit:", error);
        // Revert optimistic update on error
        const revertSuit = (suits: Suit[]) =>
          suits.map((s) =>
            s.id === id
              ? {
                  ...s,
                  reposted: suit.reposted,
                  reposts: suit.reposts,
                }
              : s
          );

        setOnChainSuits(revertSuit(onChainSuits));
        setForYouSuits(revertSuit(forYouSuits));
        setFollowingSuits(revertSuit(followingSuits));
      }
    }
  };

  const handleReply = (id: string) => {
    const suit = currentSuits.find((s) => s.id === id);
    if (suit) {
      setReplyToSuit(suit);
      setReplyModalOpen(true);
    }
  };

  const handleReplySubmit = async (suitId: string, replyContent: string) => {
    if (!address) {
      console.log("Please connect wallet to comment");
      return;
    }

    try {
      const isOnChain = suitId.startsWith("0x");
      // Submit comment to blockchain only for on-chain suits
      if (isOnChain) {
        await commentOnSuit(suitId, replyContent);
        console.log("Comment submitted successfully!");
      }

      // Increment the reply count - update both arrays
      const updateReplies = (suits: Suit[]) =>
        suits.map((suit) =>
          suit.id === suitId ? { ...suit, replies: suit.replies + 1 } : suit
        );

      setOnChainSuits(updateReplies(onChainSuits));
      setForYouSuits(updateReplies(forYouSuits));
      setFollowingSuits(updateReplies(followingSuits));
    } catch (error: any) {
      console.error("Failed to comment on suit:", error);
    }
  };

  const handleShare = (id: string) => {
    const suit = currentSuits.find((s) => s.id === id);
    if (suit && navigator.share) {
      navigator
        .share({
          title: `${suit.author} on Suiter`,
          text: suit.content,
          url: window.location.href,
        })
        .catch((err) => console.log("Error sharing:", err));
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(window.location.href);
      console.log("Link copied to clipboard");
      // TODO: Show toast notification
    }
  };

  const toggleBookmark = (id: string, isBookmarked: boolean) => {
    const newBookmarks = new Set(bookmarks);
    if (isBookmarked) {
      newBookmarks.add(id);
    } else {
      newBookmarks.delete(id);
    }
    setBookmarks(newBookmarks);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="sticky top-0 bg-background/80 backdrop-blur border-b border-border z-10">
        <div className="flex border-b border-border">
          <button
            onClick={() => setTab("foryou")}
            className={`flex-1 px-4 py-4 font-semibold text-sm transition-colors relative hover:bg-muted/50 ${
              tab === "foryou" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            For You
            {tab === "foryou" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t" />
            )}
          </button>
          <button
            onClick={() => setTab("following")}
            className={`flex-1 px-4 py-4 font-semibold text-sm transition-colors relative hover:bg-muted/50 ${
              tab === "following" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Following
            {tab === "following" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t" />
            )}
          </button>
          <button
            onClick={() => setTab("feed")}
            className={`flex-1 px-4 py-4 font-semibold text-sm transition-colors relative hover:bg-muted/50 ${
              tab === "feed" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Feed
            {tab === "feed" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t" />
            )}
          </button>
        </div>
      </div>

      {/* Compose Section */}
      {address && tab !== "feed" && (
        <div className="border-b border-border p-4">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-sm font-mono font-bold shrink-0">
              {address.slice(-4).toUpperCase()}
            </div>
            <div className="flex-1">
              <button
                onClick={onCompose}
                className="w-full text-left text-lg text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/30"
              >
                What's happening!?
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conditional Content Based on Tab */}
      <div className="flex-1 overflow-y-auto">
        {tab === "feed" ? (
          <FeedVertical />
        ) : (
          <>
            {currentSuits.map((suit) => (
              <SuitCard
                key={suit.id}
                {...suit}
                media={suit.media}
                onLike={toggleLike}
                onRepost={toggleRepost}
                onReply={handleReply}
                onShare={handleShare}
                onBookmark={toggleBookmark}
                bookmarked={bookmarks.has(suit.id)}
              />
            ))}
          </>
        )}
      </div>

      {replyToSuit && (
        <ReplyModal
          isOpen={replyModalOpen}
          onClose={() => {
            setReplyModalOpen(false);
            setReplyToSuit(null);
          }}
          originalSuit={{
            id: replyToSuit.id,
            author: replyToSuit.author,
            handle: replyToSuit.handle,
            avatar: replyToSuit.avatar,
            content: replyToSuit.content,
          }}
          onReplySubmit={handleReplySubmit}
        />
      )}
    </div>
  );
}
