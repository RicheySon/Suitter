"use client";

import { MapPin, LinkIcon, Calendar, ArrowLeft } from "lucide-react";
import { MinimalHeader } from "@/components/minimal-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SuiProvider } from "@/components/sui-context";
import { ComposeModal } from "@/components/compose-modal";
import { SuitCard } from "@/components/suit-card";
import { useSui } from "@/components/sui-context";
import { useProfile } from "@/hooks/useProfile";
import { useSuits } from "@/hooks/useSuits";
import { useInteractions } from "@/hooks/useInteractions";
import { useState, useEffect } from "react";
import { useSuiClient } from "@mysten/dapp-kit";
import CONFIG from "@/config";

interface ProfileProps {
  params: { address?: string };
}

function ProfileContent() {
  const { address } = useSui();
  const suiClient = useSuiClient();
  const { fetchMyProfileFields } = useProfile();
  const { fetchSuits } = useSuits();
  const { likeSuit, retweetSuit, commentOnSuit } = useInteractions();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "suits" | "media" | "likes" | "shorts"
  >("suits");
  const [isFollowing, setIsFollowing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [userSuits, setUserSuits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profile and suits
  useEffect(() => {
    const loadData = async () => {
      if (!address) return;

      setIsLoading(true);
      try {
        // Fetch profile
        const profileData = await fetchMyProfileFields();
        setProfile(profileData);

        // Fetch all suits and filter by creator
        const allSuits = await fetchSuits(100, 0);
        const filtered = allSuits.filter((suit: any) => {
          const fields = suit?.content?.fields;
          const creator = fields?.creator;
          return creator === address;
        });

        console.log("Filtered suits for user:", filtered.length);

        // Transform to display format
        const transformed = filtered.map((suit: any) => {
          const fields = suit?.content?.fields;
          return {
            id: suit.objectId,
            author: profileData?.username || address.slice(0, 8),
            handle: profileData?.username || address.slice(0, 8),
            avatar:
              profileData?.pfpUrl ||
              profileData?.username?.slice(0, 2).toUpperCase() ||
              address.slice(-2).toUpperCase(),
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
                ? {
                    type: "image" as const,
                    url: fields.media_urls[0],
                  }
                : undefined,
          };
        });

        setUserSuits(transformed);
      } catch (error) {
        console.error("Failed to load profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [address, fetchMyProfileFields, fetchSuits]);

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

  const handleReply = async (id: string, content: string) => {
    if (!address) return;

    try {
      await commentOnSuit(id, content);
      setUserSuits(
        userSuits.map((s) =>
          s.id === id ? { ...s, replies: s.replies + 1 } : s
        )
      );
    } catch (error) {
      console.error("Failed to comment on suit:", error);
    }
  };

  const userProfile = {
    username: profile?.username || address?.slice(0, 8) || "anonymous",
    handle: profile?.username || address?.slice(0, 8) || "anonymous",
    bio:
      profile?.bio ||
      "Building decentralized social platforms | Web3 Enthusiast | Sui Developer",
    location: "San Francisco, CA",
    website: "johndoe.dev",
    joinedDate: "March 2024",
    followers: 0,
    following: 0,
    walletAddress: address
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : "0x...",
    avatar: profile?.pfpUrl || "👤",
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

        <main className="flex-1 overflow-hidden max-w-2xl w-full mx-auto border-r border-border">
          <div className="h-full flex flex-col overflow-y-auto">
            {/* Header with Back Button */}
            <div className="sticky top-0 bg-background/80 backdrop-blur border-b border-border px-4 py-3 z-10 flex items-center gap-4">
              <button
                className="p-2 hover:bg-muted rounded-full transition-colors"
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="font-bold text-lg text-foreground">
                  @{userProfile.username}
                </h2>
                <p className="text-xs text-muted-foreground">Profile</p>
              </div>
            </div>

            <div className="h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />

            {/* Profile Info */}
            <div className="px-6 pb-4">
              <div className="flex justify-between items-start -mt-24 mb-4 relative z-10">
                <div className="w-32 h-32 bg-gradient-to-br from-yellow-300 to-yellow-100 rounded-full flex items-center justify-center text-5xl font-mono font-bold border-4 border-background shadow-lg overflow-hidden">
                  {profile?.pfpUrl ? (
                    <img
                      src={profile.pfpUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{userProfile.avatar}</span>
                  )}
                </div>
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`px-7 py-2 font-semibold rounded-full transition-all ${
                    isFollowing
                      ? "bg-muted text-foreground hover:bg-muted/80"
                      : "bg-foreground text-background hover:opacity-90"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">
                    @{userProfile.username}
                  </h1>
                  <span className="text-blue-500">✓</span>
                </div>
                <p className="text-muted-foreground">@{userProfile.handle}</p>
              </div>

              <p className="text-foreground mb-4">{userProfile.bio}</p>

              <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
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

              <div className="flex gap-6 mb-4 text-sm">
                <button className="hover:opacity-80 transition-opacity">
                  <span className="font-bold text-foreground">
                    {userProfile.following}
                  </span>
                  <span className="text-muted-foreground ml-1">Following</span>
                </button>
                <button className="hover:opacity-80 transition-opacity">
                  <span className="font-bold text-foreground">
                    {userProfile.followers}
                  </span>
                  <span className="text-muted-foreground ml-1">Followers</span>
                </button>
              </div>

              {/* Wallet Address Badge */}
              <div className="inline-block bg-muted/50 text-muted-foreground px-4 py-2 rounded-lg text-xs font-mono mb-6">
                {userProfile.walletAddress}
              </div>
            </div>

            <div className="border-b border-border sticky top-0 bg-background/80 backdrop-blur">
              <div className="px-6 flex gap-8">
                {(["suits", "media", "likes", "shorts"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 font-semibold capitalize text-sm transition-colors relative ${
                      activeTab === tab
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-foreground rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Loading...</p>
                </div>
              ) : activeTab === "suits" && userSuits.length > 0 ? (
                userSuits.map((suit) => (
                  <SuitCard
                    key={suit.id}
                    {...suit}
                    onLike={handleLike}
                    onRepost={handleRepost}
                    onReply={() => {}}
                    onShare={() => {}}
                    onBookmark={() => {}}
                    bookmarked={false}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No {activeTab} yet</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
      />
    </div>
  );
}

export default function ProfilePage(props: ProfileProps) {
  return (
    <SuiProvider>
      <ProfileContent />
    </SuiProvider>
  );
}
