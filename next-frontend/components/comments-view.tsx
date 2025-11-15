import { useEffect, useState } from "react";
import { X, Loader2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useInteractions } from "../hooks/useInteractions";
import { useProfile } from "../hooks/useProfile";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { formatTime, truncateAddress } from "@/lib/utils";

interface Comment {
  id: string;
  suitId: string;
  commenter: string;
  content: string;
  timestamp: number;
}

interface CommentsViewProps {
  isOpen: boolean;
  onClose: () => void;
  suitId: string;
  suitContent: string;
  suitAuthor: string;
  suitHandle: string;
  suitAvatar?: string;
}

export function CommentsView({
  isOpen,
  onClose,
  suitId,
  suitContent,
  suitAuthor,
  suitHandle,
  suitAvatar,
}: CommentsViewProps) {
  const account = useCurrentAccount();
  const address = account?.address;
  const { fetchComments, commentOnSuit, isCommenting } = useInteractions();
  const { fetchProfileByAddress } = useProfile();
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const [commentProfiles, setCommentProfiles] = useState<Record<string, any>>({});

  // Fetch comments when modal opens
  useEffect(() => {
    if (isOpen && suitId) {
      loadComments();
    }
  }, [isOpen, suitId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const fetchedComments = await fetchComments(suitId);
      setComments(fetchedComments);

      // Fetch profiles for commenters
      const profiles: Record<string, any> = {};
      for (const comment of fetchedComments) {
        if (!profiles[comment.commenter]) {
          const profile = await fetchProfileByAddress(comment.commenter);
          profiles[comment.commenter] = profile;
        }
      }
      setCommentProfiles(profiles);
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !address) return;

    setError("");
    try {
      await commentOnSuit(suitId, newComment);
      setNewComment("");
      // Reload comments
      await loadComments();
    } catch (err: any) {
      console.error("Failed to post comment:", err);
      setError(err?.message || "Failed to post comment");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-background border border-border rounded-2xl w-full max-w-2xl max-h-[80vh] shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-lg font-semibold">Comments</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Original Suit */}
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden">
                {suitAvatar && suitAvatar.startsWith("http") ? (
                  <img
                    src={suitAvatar}
                    alt={suitAuthor}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{suitAvatar || suitAuthor.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{suitAuthor}</span>
                  <span className="text-muted-foreground text-sm">
                    @{suitHandle}
                  </span>
                </div>
                <p className="text-foreground mt-1">{suitContent}</p>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No comments yet</p>
                <p className="text-sm mt-1">Be the first to comment!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => {
                  const profile = commentProfiles[comment.commenter];
                  const displayName = profile?.username || truncateAddress(comment.commenter);
                  const displayHandle = profile?.username || truncateAddress(comment.commenter);
                  const avatar = profile?.pfpUrl || displayName.slice(0, 2).toUpperCase();

                  return (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden">
                        {profile?.pfpUrl ? (
                          <img
                            src={profile.pfpUrl}
                            alt={displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          avatar
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {displayName}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            @{displayHandle}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            · {formatTime(comment.timestamp)}
                          </span>
                        </div>
                        <p className="text-foreground mt-1 text-sm">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Comment Input */}
          {address ? (
            <div className="border-t border-border p-4">
              {error && (
                <div className="mb-3 px-3 py-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  {address.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitComment();
                      }
                    }}
                    placeholder="Write a comment..."
                    className="flex-1 px-4 py-2 bg-muted border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isCommenting}
                  />
                  <button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isCommenting}
                    className="px-4 py-2 bg-foreground text-background rounded-full font-semibold hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isCommenting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t border-border p-4 text-center text-muted-foreground">
              <p>Connect your wallet to comment</p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
