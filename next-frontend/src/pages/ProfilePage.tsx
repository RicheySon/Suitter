import { MapPin, LinkIcon, Calendar, MoreHorizontal, MessageCircle } from "lucide-react";
import { MinimalHeader } from "../../components/minimal-header";
import { AppSidebar } from "../../components/app-sidebar";
import { SuiProvider } from "../../components/sui-context";
import { ComposeModal } from "../../components/compose-modal";
import { TrendingSidebar } from "../../components/trending-sidebar";
import { useEffect, useState } from "react";
import { useProfile } from "../../hooks/useProfile";
import { useSuits } from "../../hooks/useSuits";
import { useInteractions } from "../../hooks/useInteractions";
import { useMessaging } from "../../hooks/useMessaging";
import { CreateProfileModal } from "../../components/create-profile-modal";
import { UpdateProfileModal } from "../../components/update-profile-modal";
import { SuitCard } from "../../components/suit-card";
import { CommentsView } from "../../components/comments-view";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useSearchParams, useNavigate } from "react-router-dom";

function ProfileContent() {
  const account = useCurrentAccount();
  const address = account?.address ?? null;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const targetAddress = searchParams.get('address') || address;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "suits" | "media" | "likes" | "replies"
  >("suits");
  const [isFollowing, setIsFollowing] = useState(false);
  const { fetchMyProfileFields, fetchProfileByAddress } = useProfile();
  const { fetchSuits } = useSuits();
  const { likeSuit, retweetSuit } = useInteractions();
  const { startChat } = useMessaging();
  const [onChainName, setOnChainName] = useState<string>("");
  const [onChainBio, setOnChainBio] = useState<string>("");
  const [onChainPfp, setOnChainPfp] = useState<string>("");
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [profileId, setProfileId] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [userSuits, setUserSuits] = useState<any[]>([]);
  const [isLoadingSuits, setIsLoadingSuits] = useState(true);
  const [commentsViewOpen, setCommentsViewOpen] = useState(false);
  const [commentsForSuit, setCommentsForSuit] = useState<any | null>(null);
  const [isStartingChat, setIsStartingChat] = useState(false);

  useEffect(() => {
    (async () => {
      if (!targetAddress) return;
      const fields = targetAddress === address
        ? await fetchMyProfileFields()
        : await fetchProfileByAddress(targetAddress);
      if (fields) {
        setHasProfile(true);
        setProfileId(fields.profileId || "");
        setOnChainName(fields.username || "");
        setOnChainBio(fields.bio || "");
        setOnChainPfp(fields.pfpUrl || "");
      } else {
        setHasProfile(false);
      }
    })();
  }, [fetchMyProfileFields, fetchProfileByAddress, targetAddress, address]);

  // Fetch user's suits
  useEffect(() => {
    const loadSuits = async () => {
      if (!targetAddress) return;

      setIsLoadingSuits(true);
      try {
        const allSuits = await fetchSuits(100, 0);
        const filtered = allSuits.filter((suit: any) => {
          const fields = suit?.content?.fields;
          const creator = fields?.creator;
          return creator === targetAddress;
        });

        const transformed = filtered.map((suit: any) => {
          const fields = suit?.content?.fields;
          return {
            id: suit.objectId,
            author: onChainName || targetAddress.slice(0, 8),
            handle: onChainName || targetAddress.slice(0, 8),
            avatar:
              onChainPfp ||
              onChainName?.slice(0, 2).toUpperCase() ||
              targetAddress.slice(-2).toUpperCase(),
            authorAddress: fields?.creator,
            content: fields?.content || "",
            timestamp: parseInt(fields?.created_at) || Date.now(),
            likes: parseInt(fields?.like_count) || 0,
            replies: parseInt(fields?.comment_count) || 0,
            reposts: parseInt(fields?.retweet_count) || 0,
            liked: false,
            reposted: false,
            isNFT: true,
            nftValue: 0,
            currentBid: 0,
            isEncrypted: false,
            media:
              fields?.media_urls?.length > 0
                ? { type: "image" as const, url: fields.media_urls[0] }
                : undefined,
          };
        });

        setUserSuits(transformed);
      } catch (error) {
        console.error("Failed to load suits:", error);
      } finally {
        setIsLoadingSuits(false);
      }
    };

    if (targetAddress && (onChainName || hasProfile !== null)) {
      loadSuits();
    }
  }, [targetAddress, fetchSuits, onChainName, onChainPfp, hasProfile, address]);

  const handleLike = async (id: string) => {
    if (!address) return;

    const suit = userSuits.find((s) => s.id === id);
    if (!suit) return;

    setUserSuits(
      userSuits.map((s) =>
        s.id === id
          ? {
              ...s,
              liked: !s.liked,
              likes: s.liked ? s.likes - 1 : s.likes + 1,
            }
          : s
      )
    );

    try {
      await likeSuit(id);
    } catch (error) {
      console.error("Failed to like suit:", error);
      setUserSuits(
        userSuits.map((s) =>
          s.id === id ? { ...s, liked: suit.liked, likes: suit.likes } : s
        )
      );
    }
  };

  const handleRepost = async (id: string) => {
    if (!address) return;

    const suit = userSuits.find((s) => s.id === id);
    if (!suit) return;

    setUserSuits(
      userSuits.map((s) =>
        s.id === id
          ? {
              ...s,
              reposted: !s.reposted,
              reposts: s.reposted ? s.reposts - 1 : s.reposts + 1,
            }
          : s
      )
    );

    try {
      await retweetSuit(id);
    } catch (error) {
      console.error("Failed to retweet suit:", error);
      setUserSuits(
        userSuits.map((s) =>
          s.id === id
            ? { ...s, reposted: suit.reposted, reposts: suit.reposts }
            : s
        )
      );
    }
  };

  const handleReply = async (id: string) => {
    // Will be implemented with reply modal
    console.log("Reply to suit:", id);
  };

  const handleViewComments = (id: string) => {
    const suit = userSuits.find((s) => s.id === id);
    if (suit) {
      setCommentsForSuit(suit);
      setCommentsViewOpen(true);
    }
  };

  const handleShare = (id: string) => {
    console.log("Share suit:", id);
  };

  const handleBookmark = (id: string, bookmarked: boolean) => {
    console.log("Bookmark suit:", id, bookmarked);
  };

  const handleMessage = async () => {
    if (!targetAddress || !address || targetAddress === address) return;

    setIsStartingChat(true);
    try {
      const result = await startChat(targetAddress);
      if (result?.chatId) {
        navigate('/messages');
      }
    } catch (error) {
      console.error("Failed to start chat:", error);
    } finally {
      setIsStartingChat(false);
    }
  };

  const userProfile = {
    name: onChainName || targetAddress?.slice(0, 8) || "Anonymous",
    handle: onChainName || targetAddress?.slice(0, 8) || "anonymous",
    bio:
      onChainBio ||
      "Building decentralized social platforms on Sui | Web3 Enthusiast | Creating the future of social media 🚀",
    location: "San Francisco, CA",
    website: "gabby.sui",
    joinedDate: "March 2024",
    followers: 5678,
    following: 1234,
    suitsCount: 342,
    walletAddress: targetAddress || "0x1234...5678",
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <MinimalHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onCompose={() => setIsComposeOpen(true)}
        />

        <main className="flex-1 overflow-y-auto border-r border-border max-w-4xl relative">
          <div className="h-full flex flex-col overflow-y-auto">
            {hasProfile === false && (
              <div className="p-4 border-b border-border bg-amber-50 dark:bg-amber-950/20 flex flex-col gap-3">
                <h2 className="text-lg font-semibold text-foreground">
                  No on-chain profile found
                </h2>
                <p className="text-sm text-muted-foreground">
                  Create your decentralized profile to set a username, bio and
                  profile image stored via Walrus.
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="self-start px-4 py-2 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90"
                >
                  Create Profile
                </button>
              </div>
            )}
            {/* Header with Back Button */}
            {/* <div className="sticky top-0 bg-background/80 backdrop-blur border-b border-border px-4 py-3 z-10 flex items-center gap-4">
              <button className="p-2 hover:bg-muted rounded-full transition-colors" aria-label="Back">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="font-bold text-lg text-foreground">{userProfile.name}</h2>
                <p className="text-xs text-muted-foreground">Profile</p>
              </div>
            </div> */}

            {/* Cover Image */}
            {/* <div className="relative h-48 bg-muted border-b border-border">
              <div className="absolute inset-0 bg-linear-to-br from-muted-foreground/5 to-muted-foreground/10" />
            </div> */}

            {/* Profile Info */}
            <div className="border-b border-border mt-24">
              <div className="px-4 pb-4">
                <div className="flex justify-between items-start -mt-16 mb-3">
                  <div className="w-32 h-32 rounded-full bg-muted border-4 border-background flex items-center justify-center text-5xl font-bold overflow-hidden">
                    {onChainPfp ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={onChainPfp}
                        alt="pfp"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>👤</span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-16">
                    {address !== userProfile.walletAddress ? (
                      <>
                        <button
                          className="p-2 border border-border rounded-full hover:bg-muted transition-colors"
                          aria-label="More options"
                        >
                          <MoreHorizontal size={20} />
                        </button>
                        <button
                          onClick={handleMessage}
                          disabled={isStartingChat}
                          className="px-4 py-2 border border-border rounded-full hover:bg-muted transition-colors font-semibold flex items-center gap-2 disabled:opacity-50"
                          aria-label="Message"
                        >
                          <MessageCircle size={18} />
                          {isStartingChat ? "Starting..." : "Message"}
                        </button>
                        <button
                          onClick={() => setIsFollowing(!isFollowing)}
                          className={`px-4 py-2 font-semibold rounded-full transition-all ${
                            isFollowing
                              ? "border border-border text-foreground hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400"
                              : "bg-foreground text-background hover:bg-foreground/90"
                          }`}
                        >
                          {isFollowing ? "Unfollow" : "Follow"}
                        </button>
                      </>
                    ) : hasProfile ? (
                      <button 
                        onClick={() => setIsUpdateModalOpen(true)}
                        className="px-4 py-2 border border-border rounded-full hover:bg-muted transition-colors font-semibold">
                        Edit profile
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 border border-border rounded-full hover:bg-muted transition-colors font-semibold"
                      >
                        Create profile
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center gap-1">
                    <h1 className="text-xl font-bold text-foreground">
                      {userProfile.name}
                    </h1>
                    <svg
                      className="w-5 h-5 text-blue-500 fill-current"
                      viewBox="0 0 22 22"
                    >
                      <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground">@{userProfile.handle}</p>
                </div>

                <p className="text-foreground mb-3 leading-normal">
                  {userProfile.bio}
                </p>

                <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span>{userProfile.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <LinkIcon size={16} />
                    <a href="#" className="text-blue-500 hover:underline">
                      {userProfile.website}
                    </a>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>Joined {userProfile.joinedDate}</span>
                  </div>
                </div>

                <div className="flex gap-4 text-sm">
                  <button className="hover:underline">
                    <span className="font-semibold text-foreground">
                      {userProfile.following.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      Following
                    </span>
                  </button>
                  <button className="hover:underline">
                    <span className="font-semibold text-foreground">
                      {userProfile.followers.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      Followers
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border sticky top-[57px] bg-background z-10">
              <div className="flex">
                {(["suits", "replies", "media", "likes"] as const).map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-4 font-semibold capitalize text-sm transition-colors relative hover:bg-muted/50 ${
                        activeTab === tab
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t" />
                      )}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1">
              {activeTab === "suits" && (
                <div className="divide-y divide-border">
                  {isLoadingSuits ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Loading suits...</p>
                    </div>
                  ) : userSuits.length > 0 ? (
                    userSuits.map((suit) => (
                      <SuitCard
                        key={suit.id}
                        {...suit}
                        onLike={handleLike}
                        onRepost={handleRepost}
                        onReply={handleReply}
                        onViewComments={handleViewComments}
                        onShare={handleShare}
                        onBookmark={handleBookmark}
                        bookmarked={false}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No suits yet</p>
                    </div>
                  )}
                </div>
              )}
              {activeTab !== "suits" && (
                <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    {activeTab === "media" && (
                      <span className="text-2xl">📷</span>
                    )}
                    {activeTab === "likes" && (
                      <span className="text-2xl">❤️</span>
                    )}
                    {activeTab === "replies" && (
                      <span className="text-2xl">💬</span>
                    )}
                  </div>
                  <h3 className="text-foreground text-xl font-bold mb-2">
                    {activeTab === "media" && "No media yet"}
                    {activeTab === "likes" && "No likes yet"}
                    {activeTab === "replies" && "No replies yet"}
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    {activeTab === "media" &&
                      `When ${userProfile.name} shares photos or videos, they'll show up here.`}
                    {activeTab === "likes" &&
                      `When ${userProfile.name} likes a post, it'll show up here.`}
                    {activeTab === "replies" &&
                      `When ${userProfile.name} replies to posts, they'll show up here.`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        <TrendingSidebar />
      </div>

      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
      />
      <CreateProfileModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={() => {
          (async () => {
            const fields = await fetchMyProfileFields();
            if (fields) {
              setHasProfile(true);
              setOnChainName(fields.username || "");
              setOnChainBio(fields.bio || "");
              setOnChainPfp(fields.pfpUrl || "");
            }
          })();
        }}
      />

      <UpdateProfileModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        currentProfile={{
          profileId: profileId,
          username: onChainName,
          bio: onChainBio,
          pfpUrl: onChainPfp,
        }}
        onUpdated={() => {
          (async () => {
            const fields = await fetchMyProfileFields();
            if (fields) {
              setProfileId(fields.profileId || "");
              setOnChainName(fields.username || "");
              setOnChainBio(fields.bio || "");
              setOnChainPfp(fields.pfpUrl || "");
            }
          })();
        }}
      />

      {commentsForSuit && (
        <CommentsView
          isOpen={commentsViewOpen}
          onClose={() => {
            setCommentsViewOpen(false);
            setCommentsForSuit(null);
          }}
          suitId={commentsForSuit.id}
          suitContent={commentsForSuit.content}
          suitAuthor={commentsForSuit.author}
          suitHandle={commentsForSuit.handle}
          suitAvatar={commentsForSuit.avatar}
        />
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <SuiProvider>
      <ProfileContent />
    </SuiProvider>
  );
}
