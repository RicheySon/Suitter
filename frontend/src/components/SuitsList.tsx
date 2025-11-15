import { useSuiClientQuery } from "@mysten/dapp-kit";
import { Box, Card, Flex, Text, Button, Spinner } from "@radix-ui/themes";
import { SUIT_REGISTRY_ID, PACKAGE_ID } from "../constants";
import { useLikeSuit } from "../hooks/useLikeSuit";
import { useCommentOnSuit } from "../hooks/useCommentOnSuit";
import { useState } from "react";

interface SuitData {
  id: string;
  creator: string;
  content: string;
  like_count: number;
  comment_count: number;
  retweet_count: number;
  created_at: number;
}

export function SuitsList() {
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  
  const { likeSuit } = useLikeSuit();
  const { commentOnSuit } = useCommentOnSuit();

  // Query the SuitRegistry to get all Suit IDs
  const { data: registry, isLoading: isLoadingRegistry } = useSuiClientQuery(
    "getObject",
    {
      id: SUIT_REGISTRY_ID,
      options: {
        showContent: true,
      },
    }
  );

  // Get Suit IDs from registry
  const suitIds: string[] = [];
  if (registry?.data?.content?.dataType === "moveObject") {
    const fields = registry.data.content.fields as any;
    if (fields?.suit_ids) {
      suitIds.push(...fields.suit_ids);
    }
  }

  // Query all Suits
  const { data: suits, isLoading: isLoadingSuits } = useSuiClientQuery(
    "multiGetObjects",
    {
      ids: suitIds,
      options: {
        showContent: true,
        showOwner: true,
      },
    },
    {
      enabled: suitIds.length > 0,
    }
  );

  const handleLike = (suitId: string) => {
    likeSuit(
      suitId,
      () => {
        console.log("Liked successfully");
        // Refetch suits to update counts
      },
      (error) => {
        console.error("Failed to like:", error);
      }
    );
  };

  const handleComment = (suitId: string) => {
    if (!commentText.trim()) return;

    commentOnSuit(
      suitId,
      commentText,
      () => {
        console.log("Commented successfully");
        setCommentText("");
        setCommentingOn(null);
      },
      (error) => {
        console.error("Failed to comment:", error);
      }
    );
  };

  if (isLoadingRegistry || isLoadingSuits) {
    return (
      <Flex justify="center" p="4">
        <Spinner size="3" />
      </Flex>
    );
  }

  if (!suits || suits.length === 0) {
    return (
      <Box p="4" style={{ background: "var(--gray-a2)", borderRadius: 8 }}>
        <Text>No Suits yet. Be the first to post!</Text>
      </Box>
    );
  }

  return (
    <Flex direction="column" gap="3">
      {suits.map((suit) => {
        if (!suit.data?.content || suit.data.content.dataType !== "moveObject") {
          return null;
        }

        const fields = suit.data.content.fields as any;
        const suitData: SuitData = {
          id: suit.data.objectId,
          creator: fields.creator,
          content: fields.content,
          like_count: parseInt(fields.like_count || "0"),
          comment_count: parseInt(fields.comment_count || "0"),
          retweet_count: parseInt(fields.retweet_count || "0"),
          created_at: parseInt(fields.created_at || "0"),
        };

        return (
          <Card key={suitData.id}>
            <Flex direction="column" gap="3">
              {/* Creator */}
              <Text size="2" color="gray">
                {suitData.creator.slice(0, 6)}...{suitData.creator.slice(-4)}
              </Text>

              {/* Content */}
              <Text size="3">{suitData.content}</Text>

              {/* Stats */}
              <Flex gap="4">
                <Button
                  variant="soft"
                  size="2"
                  onClick={() => handleLike(suitData.id)}
                >
                  ❤️ {suitData.like_count}
                </Button>
                
                <Button
                  variant="soft"
                  size="2"
                  onClick={() => setCommentingOn(
                    commentingOn === suitData.id ? null : suitData.id
                  )}
                >
                  💬 {suitData.comment_count}
                </Button>
                
                <Text size="2" color="gray">
                  🔁 {suitData.retweet_count}
                </Text>
              </Flex>

              {/* Comment Form */}
              {commentingOn === suitData.id && (
                <Flex gap="2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid var(--gray-a6)",
                    }}
                  />
                  <Button size="2" onClick={() => handleComment(suitData.id)}>
                    Send
                  </Button>
                </Flex>
              )}
            </Flex>
          </Card>
        );
      })}
    </Flex>
  );
}
