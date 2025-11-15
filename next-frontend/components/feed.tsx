import { useState } from "react";
import { Heart, MessageCircle, Repeat2, Share } from "lucide-react";

interface FeedProps {
  onCompose: () => void;
}

export default function Feed({ onCompose }: FeedProps) {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Sarah Chen",
      handle: "@sarahchen",
      avatar: "S",
      content:
        "Just launched Suitter, a modern social platform. The future of digital connection starts now! 🚀",
      timestamp: "2h",
      likes: 1234,
      replies: 342,
      retweets: 856,
      liked: false,
    },
    {
      id: 2,
      author: "Developer Daily",
      handle: "@devdaily",
      avatar: "D",
      content:
        "Building with Next.js 16 and Tailwind CSS feels so smooth. The developer experience is unmatched.",
      timestamp: "4h",
      likes: 892,
      replies: 156,
      retweets: 423,
      liked: false,
    },
    {
      id: 3,
      author: "Tech News Hub",
      handle: "@technewshub",
      avatar: "T",
      content:
        "New social media platform launches with focus on user privacy and authentic connections.",
      timestamp: "6h",
      likes: 2156,
      replies: 678,
      retweets: 1245,
      liked: false,
    },
  ]);

  const toggleLike = (id: number) => {
    setPosts(
      posts.map((post) =>
        post.id === id
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur border-b border-border p-4 z-10">
        <h2 className="text-xl font-bold">Home</h2>
      </div>

      {/* Compose Section */}
      <div className="border-b border-border p-4">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
            Y
          </div>
          <div className="flex-1">
            <textarea
              onClick={onCompose}
              placeholder="What is happening!?"
              className="w-full text-2xl bg-background text-foreground placeholder-muted-foreground focus:outline-none resize-none"
              rows={3}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={onCompose}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-full font-bold text-lg"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      {posts.map((post) => (
        <article
          key={post.id}
          className="border-b border-border p-4 hover:bg-muted/30 transition-colors cursor-pointer"
        >
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold flex-shrink-0">
              {post.avatar}
            </div>
            <div className="flex-1">
              {/* Author Info */}
              <div className="flex items-center gap-2">
                <span className="font-bold hover:underline">{post.author}</span>
                <span className="text-muted-foreground">@{post.handle}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground hover:underline">
                  {post.timestamp}
                </span>
              </div>

              {/* Content */}
              <p className="mt-2 text-base text-foreground">{post.content}</p>

              {/* Stats */}
              <div className="mt-3 flex gap-2 text-xs text-muted-foreground">
                <span className="hover:underline">{post.replies} replies</span>
                <span className="hover:underline">{post.retweets} reposts</span>
                <span className="hover:underline">{post.likes} likes</span>
              </div>

              {/* Actions */}
              <div className="mt-3 flex justify-between text-muted-foreground max-w-xs">
                <button className="flex items-center gap-2 hover:text-primary hover:bg-primary/10 p-2 rounded-full transition-colors">
                  <MessageCircle size={16} />
                </button>
                <button className="flex items-center gap-2 hover:text-green-500 hover:bg-green-500/10 p-2 rounded-full transition-colors">
                  <Repeat2 size={16} />
                </button>
                <button
                  onClick={() => toggleLike(post.id)}
                  className="flex items-center gap-2 hover:text-destructive hover:bg-destructive/10 p-2 rounded-full transition-colors"
                >
                  <Heart
                    size={16}
                    fill={post.liked ? "currentColor" : "none"}
                    color={post.liked ? "currentColor" : undefined}
                  />
                </button>
                <button className="flex items-center gap-2 hover:text-primary hover:bg-primary/10 p-2 rounded-full transition-colors">
                  <Share size={16} />
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
