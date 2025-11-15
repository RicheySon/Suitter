import { useCallback, useState } from "react";
import { useSuiClient } from "@mysten/dapp-kit";
import CONFIG from "../config";

const PACKAGE_ID = CONFIG.VITE_PACKAGE_ID;
const SUIT_REGISTRY_ID = CONFIG.SUIT_REGISTRY;

export interface SearchResult {
  type: "user" | "post";
  id: string;
  // User fields
  username?: string;
  bio?: string;
  pfpUrl?: string;
  address?: string;
  // Post fields
  content?: string;
  creator?: string;
  createdAt?: number;
  likeCount?: number;
  commentCount?: number;
  retweetCount?: number;
  mediaUrls?: string[];
}

export function useSearch() {
  const suiClient = useSuiClient();
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readStr = (v: any): string => {
    if (typeof v === "string") return v;
    if (v && typeof v === "object" && typeof v.bytes === "string")
      return v.bytes;
    return "";
  };

  const searchUsers = useCallback(
    async (query: string): Promise<SearchResult[]> => {
      if (!query.trim()) return [];

      try {
        // Get all Profile objects
        const profiles = await suiClient.queryEvents({
          query: {
            MoveEventType: `${PACKAGE_ID}::profile::ProfileCreated`,
          },
          limit: 50,
        });

        const userResults: SearchResult[] = [];

        // Fetch profile details for each event
        for (const event of profiles.data) {
          try {
            const parsedJson = event.parsedJson as any;
            const profileId = parsedJson?.profile_id;
            const ownerAddress = parsedJson?.owner;

            if (!profileId) continue;

            const profileObj = await suiClient.getObject({
              id: profileId,
              options: { showContent: true },
            });

            const content = profileObj.data?.content as any;
            const fields = content?.fields;

            if (fields) {
              const username = readStr(fields.username);
              const bio = readStr(fields.bio);
              const pfpUrl = readStr(fields.pfp_url);

              // Check if username or bio matches the search query
              const queryLower = query.toLowerCase();
              if (
                username.toLowerCase().includes(queryLower) ||
                bio.toLowerCase().includes(queryLower) ||
                ownerAddress?.toLowerCase().includes(queryLower)
              ) {
                userResults.push({
                  type: "user",
                  id: profileId,
                  username,
                  bio,
                  pfpUrl,
                  address: ownerAddress,
                });
              }
            }
          } catch (e) {
            console.error("Error fetching profile:", e);
          }
        }

        return userResults;
      } catch (e) {
        console.error("Error searching users:", e);
        return [];
      }
    },
    [suiClient]
  );

  const searchPosts = useCallback(
    async (query: string): Promise<SearchResult[]> => {
      if (!query.trim()) return [];

      try {
        // Get the SuitRegistry to fetch suit IDs
        const registry = await suiClient.getObject({
          id: SUIT_REGISTRY_ID,
          options: { showContent: true },
        });

        const registryContent = registry.data?.content as any;
        const suitIds = registryContent?.fields?.suit_ids || [];

        // Fetch recent suits (limit to 50 for performance)
        const recentSuitIds = suitIds.slice(-50).reverse();

        const postResults: SearchResult[] = [];

        for (const suitId of recentSuitIds) {
          try {
            const suit = await suiClient.getObject({
              id: suitId,
              options: { showContent: true },
            });

            const content = suit.data?.content as any;
            const fields = content?.fields;

            if (fields) {
              const postContent = fields.content || "";
              const creator = fields.creator || "";
              const createdAt = parseInt(fields.created_at) || Date.now();
              const likeCount = parseInt(fields.like_count) || 0;
              const commentCount = parseInt(fields.comment_count) || 0;
              const retweetCount = parseInt(fields.retweet_count) || 0;
              const mediaUrls = fields.media_urls || [];

              // Check if content or creator matches the search query
              const queryLower = query.toLowerCase();
              if (
                postContent.toLowerCase().includes(queryLower) ||
                creator.toLowerCase().includes(queryLower)
              ) {
                postResults.push({
                  type: "post",
                  id: suitId,
                  content: postContent,
                  creator,
                  createdAt,
                  likeCount,
                  commentCount,
                  retweetCount,
                  mediaUrls,
                });
              }
            }
          } catch (e) {
            console.error(`Error fetching suit ${suitId}:`, e);
          }
        }

        return postResults;
      } catch (e) {
        console.error("Error searching posts:", e);
        return [];
      }
    },
    [suiClient]
  );

  const search = useCallback(
    async (
      query: string,
      filters: { users?: boolean; posts?: boolean } = {
        users: true,
        posts: true,
      }
    ): Promise<SearchResult[]> => {
      if (!query.trim()) return [];

      setIsSearching(true);
      setError(null);

      try {
        const results: SearchResult[] = [];

        // Search users if enabled
        if (filters.users !== false) {
          const userResults = await searchUsers(query);
          results.push(...userResults);
        }

        // Search posts if enabled
        if (filters.posts !== false) {
          const postResults = await searchPosts(query);
          results.push(...postResults);
        }

        return results;
      } catch (e: any) {
        setError(e?.message ?? "Search failed");
        console.error("Search error:", e);
        return [];
      } finally {
        setIsSearching(false);
      }
    },
    [searchUsers, searchPosts]
  );

  return {
    search,
    searchUsers,
    searchPosts,
    isSearching,
    error,
  };
}
