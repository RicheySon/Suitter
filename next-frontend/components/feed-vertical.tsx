import { useState } from "react";
import { Heart, MessageCircle, Share, Bookmark } from "lucide-react";
import { useSui } from "./sui-context";

interface VideoPost {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  content: string;
  videoUrl: string;
  timestamp: number;
  likes: number;
  replies: number;
  reposts: number;
  liked: boolean;
}

const SAMPLE_VIDEOS: VideoPost[] = [
  {
    id: "v1",
    author: "Sui Builder",
    handle: "suibuilder",
    avatar: "S",
    content:
      "🚀 Building the future on Sui - TikTok style content coming to Suiter",
    videoUrl: "/blockchain-video-content.jpg",
    timestamp: Date.now() - 30 * 60 * 1000,
    likes: 5420,
    replies: 892,
    reposts: 2340,
    liked: false,
  },
  {
    id: "v2",
    author: "Web3 Creator",
    handle: "web3creator",
    avatar: "W",
    content: "Check out this epic Sui transaction flow 🔥",
    videoUrl: "/crypto-transaction-flow.jpg",
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    likes: 3180,
    replies: 456,
    reposts: 1205,
    liked: false,
  },
  {
    id: "v3",
    author: "Dev Vlog",
    handle: "devvlog",
    avatar: "D",
    content: "Living the blockchain developer life - day in the life 👨‍💻",
    videoUrl: "/developer-lifestyle-video.jpg",
    timestamp: Date.now() - 5 * 60 * 60 * 1000,
    likes: 7650,
    replies: 1203,
    reposts: 4120,
    liked: false,
  },
];

export function FeedVertical() {
  const { address: _address } = useSui();
  const [videos, setVideos] = useState<VideoPost[]>(SAMPLE_VIDEOS);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) => {
    setVideos(
      videos.map((video) =>
        video.id === id
          ? {
              ...video,
              liked: !video.liked,
              likes: video.liked ? video.likes - 1 : video.likes + 1,
            }
          : video
      )
    );
  };

  const toggleBookmark = (id: string) => {
    const newBookmarks = new Set(bookmarks);
    if (newBookmarks.has(id)) {
      newBookmarks.delete(id);
    } else {
      newBookmarks.add(id);
    }
    setBookmarks(newBookmarks);
  };

  return (
    <div className="h-full flex flex-col bg-background w-full overflow-hidden">
      {/* Vertical Snap Scroll Container */}
      <div
        className="flex-1 overflow-y-scroll snap-y snap-mandatory scroll-smooth"
        style={{ scrollBehavior: "smooth" }}
      >
        {videos.map((video, _index) => (
          <div
            key={video.id}
            className="snap-center h-full w-full shrink-0 flex items-center justify-center relative bg-black overflow-hidden"
          >
            {/* Video Container */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={video.videoUrl || "/placeholder.svg"}
                alt="Video content"
                className="w-full h-full object-cover"
              />

              {/* Video Overlay - Bottom Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {video.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{video.author}</div>
                    <div className="text-xs text-gray-300">@{video.handle}</div>
                  </div>
                  <button className="px-4 py-1 bg-foreground text-background rounded-full font-semibold text-xs hover:opacity-90 transition-opacity">
                    Follow
                  </button>
                </div>
                <p className="text-sm text-white break-words">
                  {video.content}
                </p>
              </div>

              {/* Right Side Interaction Icons */}
              <div className="absolute right-4 bottom-32 flex flex-col gap-6 z-10">
                {/* Like Button */}
                <button
                  onClick={() => toggleLike(video.id)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors backdrop-blur">
                    <Heart
                      size={20}
                      fill={video.liked ? "#fff" : "none"}
                      color="#fff"
                    />
                  </div>
                  <span className="text-white text-xs font-semibold">
                    {video.likes}
                  </span>
                </button>

                {/* Reply Button */}
                <button className="flex flex-col items-center gap-1 group">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors backdrop-blur">
                    <MessageCircle size={20} color="#fff" />
                  </div>
                  <span className="text-white text-xs font-semibold">
                    {video.replies}
                  </span>
                </button>

                {/* Share Button */}
                <button className="flex flex-col items-center gap-1 group">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors backdrop-blur">
                    <Share size={20} color="#fff" />
                  </div>
                  <span className="text-white text-xs font-semibold">
                    {video.reposts}
                  </span>
                </button>

                {/* Bookmark Button */}
                <button
                  onClick={() => toggleBookmark(video.id)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors backdrop-blur">
                    <Bookmark
                      size={20}
                      fill={bookmarks.has(video.id) ? "#fff" : "none"}
                      color="#fff"
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
