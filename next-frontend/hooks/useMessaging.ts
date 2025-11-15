import {
  useSignAndExecuteTransaction,
  useCurrentAccount,
  useSuiClient,
} from "@mysten/dapp-kit";
import { useState, useCallback, useEffect, useMemo } from "react";
import { Transaction } from "@mysten/sui/transactions";
import CONFIG from "../config";
import { useProfile } from "./useProfile";

// Types for our custom messaging contract
interface Message {
  sender: string;
  encrypted_message: number[];
  content_hash: number[];
  sent_timestamp: string;
  is_read: boolean;
}

interface Chat {
  id: { id: string };
  participant_1: string;
  participant_2: string;
  messages: Message[];
  created_at: string;
}

interface ChatWithMetadata {
  id: string;
  participant_1: string;
  participant_2: string;
  lastMessage?: {
    text: string;
    sender: string;
    timestamp: number;
  };
  unreadCount: number;
  created_at: number;
}

export const useMessaging = () => {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { fetchProfileByAddress } = useProfile();

  // Chat state
  const [chats, setChats] = useState<ChatWithMetadata[]>([]);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isFetchingChats, setIsFetchingChats] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Current chat state
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Username cache for participants
  const [usernameCache, setUsernameCache] = useState<Record<string, string>>(
    {}
  );

  // Start chat function
  const startChat = useCallback(
    async (otherUserAddress: string) => {
      if (!currentAccount) {
        setChatError("Account not connected");
        return null;
      }

      setIsCreatingChat(true);
      setChatError(null);

      try {
        const tx = new Transaction();

        tx.moveCall({
          target: `${CONFIG.VITE_PACKAGE_ID}::messaging::start_chat`,
          arguments: [
            tx.pure.address(otherUserAddress),
            tx.object(CONFIG.CHAT_REGISTRY),
            tx.object("0x6"), // Clock object
          ],
        });

        const { digest } = await signAndExecute({ transaction: tx });

        // Wait for transaction
        const result = await suiClient.waitForTransaction({
          digest,
          options: { showObjectChanges: true, showEvents: true },
        });

        // Get the created chat ID from events
        const chatCreatedEvent = result.events?.find((e) =>
          e.type.endsWith("::messaging::ChatCreated")
        );

        const chatId = (chatCreatedEvent?.parsedJson as any)?.chat_id;

        // Refresh chats list
        await fetchChats();

        return { chatId };
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to start chat";
        setChatError(errorMsg);
        console.error("Error starting chat:", err);
        return null;
      } finally {
        setIsCreatingChat(false);
      }
    },
    [currentAccount, signAndExecute, suiClient]
  );

  // Fetch all chats for current user by querying ChatCreated events
  const fetchChats = useCallback(
    async (silent = false) => {
      if (!currentAccount) {
        console.log("No current account, skipping fetch");
        return;
      }

      console.log("Fetching chats for:", currentAccount.address);
      console.log("Using PACKAGE_ID:", CONFIG.VITE_PACKAGE_ID);

      if (!silent) {
        setIsFetchingChats(true);
      }
      setChatError(null);

      try {
        // Query ChatCreated events to find all chats
        const events = await suiClient.queryEvents({
          query: {
            MoveEventType: `${CONFIG.VITE_PACKAGE_ID}::messaging::ChatCreated`,
          },
          limit: 50,
        });

        console.log("ChatCreated events:", events);

        if (!events.data || events.data.length === 0) {
          console.log("No ChatCreated events found");
          setChats([]);
          if (!silent) {
            setIsFetchingChats(false);
          }
          return;
        }

        // Fetch all chat objects from events
        const chatObjects = await Promise.all(
          events.data.map(async (event) => {
            try {
              const eventData = event.parsedJson as any;
              const chatId = eventData.chat_id;

              console.log("Processing chat ID:", chatId);

              // Get the actual chat object
              const chatObj = await suiClient.getObject({
                id: chatId,
                options: { showContent: true },
              });

              console.log("Chat object:", chatObj);

              if (chatObj.data?.content?.dataType === "moveObject") {
                const fields = (chatObj.data.content as any).fields;

                console.log("Chat fields:", fields);
                console.log("Participant 1:", fields.participant_1);
                console.log("Participant 2:", fields.participant_2);
                console.log("Current user:", currentAccount.address);

                // Only return chats where current user is a participant
                if (
                  fields.participant_1 === currentAccount.address ||
                  fields.participant_2 === currentAccount.address
                ) {
                  console.log("User is participant, including chat");

                  // Transform messages to extract fields if nested
                  const messages = (fields.messages || []).map((msg: any) => {
                    if (msg.fields) {
                      return {
                        sender: msg.fields.sender,
                        encrypted_message: msg.fields.encrypted_message,
                        content_hash: msg.fields.content_hash,
                        sent_timestamp: msg.fields.sent_timestamp,
                        is_read: msg.fields.is_read,
                      };
                    }
                    return msg;
                  });

                  return {
                    id: chatId,
                    participant_1: fields.participant_1,
                    participant_2: fields.participant_2,
                    messages: messages,
                    created_at: parseInt(fields.created_at),
                  };
                } else {
                  console.log("User is not participant, skipping chat");
                }
              }
              return null;
            } catch (err) {
              console.error("Error fetching chat:", err);
              return null;
            }
          })
        );

        // Filter out nulls and transform to ChatWithMetadata
        const validChats = chatObjects.filter((c): c is any => c !== null);

        console.log("Valid chats count:", validChats.length);
        console.log("Valid chats:", validChats);

        const chatsWithMetadata: ChatWithMetadata[] = validChats.map((chat) => {
          const lastMsg = chat.messages[chat.messages.length - 1];

          // Extract message fields if nested
          const lastMsgFields = lastMsg?.fields || lastMsg;

          return {
            id: chat.id,
            participant_1: chat.participant_1,
            participant_2: chat.participant_2,
            lastMessage: lastMsgFields
              ? {
                  text: new TextDecoder().decode(
                    new Uint8Array(lastMsgFields.encrypted_message)
                  ),
                  sender: lastMsgFields.sender,
                  timestamp: parseInt(lastMsgFields.sent_timestamp),
                }
              : undefined,
            unreadCount: chat.messages.filter((m: any) => {
              const msgFields = m.fields || m;
              return (
                msgFields.sender !== currentAccount.address &&
                !msgFields.is_read
              );
            }).length,
            created_at: chat.created_at,
          };
        });

        console.log("Chats with metadata:", chatsWithMetadata);

        // Merge with existing chats to prevent flickering
        setChats((prevChats) => {
          if (prevChats.length === 0) return chatsWithMetadata;

          // Create a map of existing chats by ID for quick lookup
          const existingChatsMap = new Map(
            prevChats.map((chat) => [chat.id, chat])
          );

          // Merge new data with existing, preserving order
          const mergedChats = chatsWithMetadata.map((newChat) => {
            const existingChat = existingChatsMap.get(newChat.id);

            // Only update if data actually changed
            if (existingChat) {
              const hasChanged =
                existingChat.lastMessage?.timestamp !==
                  newChat.lastMessage?.timestamp ||
                existingChat.unreadCount !== newChat.unreadCount;

              return hasChanged ? newChat : existingChat;
            }

            return newChat;
          });

          // Add any new chats that weren't in the previous list
          const newChatIds = new Set(chatsWithMetadata.map((c) => c.id));
          const keptOldChats = prevChats.filter(
            (chat) => !newChatIds.has(chat.id)
          );

          return [...mergedChats, ...keptOldChats];
        });
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to fetch chats";
        setChatError(errorMsg);
        console.error("Error fetching chats:", err);
      } finally {
        if (!silent) {
          setIsFetchingChats(false);
        }
      }
    },
    [currentAccount, suiClient]
  ); // Get chat by ID
  const getChatById = useCallback(
    async (chatId: string) => {
      if (!currentAccount) {
        return null;
      }

      setChatError(null);

      try {
        const chatObj = await suiClient.getObject({
          id: chatId,
          options: { showContent: true },
        });

        if (chatObj.data?.content?.dataType === "moveObject") {
          const fields = (chatObj.data.content as any).fields;

          // Transform messages to flatten nested fields structure
          const transformedMessages = (fields.messages || []).map(
            (msg: any) => {
              // If message has nested fields, extract them
              if (msg.fields) {
                return {
                  encrypted_message: msg.fields.encrypted_message,
                  sender: msg.fields.sender,
                  sent_timestamp: msg.fields.sent_timestamp,
                  is_read: msg.fields.is_read,
                  content_hash: msg.fields.content_hash,
                };
              }
              // Otherwise return as-is
              return msg;
            }
          );

          const chat: Chat = {
            id: { id: fields.id.id },
            participant_1: fields.participant_1,
            participant_2: fields.participant_2,
            messages: transformedMessages,
            created_at: fields.created_at,
          };
          setCurrentChat(chat);
          return chat;
        }
        return null;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to fetch chat";
        setChatError(errorMsg);
        console.error("Error fetching chat:", err);
        return null;
      }
    },
    [currentAccount, suiClient]
  );

  // Fetch messages for a chat
  const fetchMessages = useCallback(
    async (chatId: string, silent = false) => {
      if (!currentAccount) {
        return;
      }

      console.log("Fetching messages for chat:", chatId);
      if (!silent) {
        setIsFetchingMessages(true);
      }
      setChatError(null);

      try {
        const chat = await getChatById(chatId);
        console.log("Fetched chat:", chat);

        if (chat) {
          console.log("Setting messages:", chat.messages);
          console.log("Message count:", chat.messages.length);
          setMessages(chat.messages);
        } else {
          console.log("No chat found");
          setMessages([]);
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to fetch messages";
        setChatError(errorMsg);
        console.error("Error fetching messages:", err);
      } finally {
        if (!silent) {
          setIsFetchingMessages(false);
        }
      }
    },
    [currentAccount, getChatById]
  );

  // Send message function
  const sendMessage = useCallback(
    async (chatId: string, message: string) => {
      if (!currentAccount) {
        setChatError("Account not connected");
        return null;
      }

      setIsSendingMessage(true);
      setChatError(null);

      // Optimistically add message to UI immediately
      const optimisticMessage: Message = {
        sender: currentAccount.address,
        encrypted_message: Array.from(new TextEncoder().encode(message)),
        content_hash: Array.from(
          new TextEncoder().encode(`hash_${Date.now()}`)
        ),
        sent_timestamp: Date.now().toString(),
        is_read: false,
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        const tx = new Transaction();

        // Simple encryption: convert message to bytes
        const messageBytes = new TextEncoder().encode(message);
        const contentHash = new TextEncoder().encode(`hash_${Date.now()}`);

        tx.moveCall({
          target: `${CONFIG.VITE_PACKAGE_ID}::messaging::send_message`,
          arguments: [
            tx.object(chatId),
            tx.pure.vector("u8", Array.from(messageBytes)),
            tx.pure.vector("u8", Array.from(contentHash)),
            tx.object("0x6"), // Clock object
          ],
        });

        const { digest } = await signAndExecute({ transaction: tx });

        // Wait for transaction
        await suiClient.waitForTransaction({
          digest,
          options: { showEffects: true },
        });

        // Refresh messages to get the actual blockchain data
        await fetchMessages(chatId);

        return { digest };
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to send message";
        setChatError(errorMsg);
        console.error("Error sending message:", err);

        // Remove optimistic message on error
        setMessages((prev) =>
          prev.filter(
            (msg) => msg.sent_timestamp !== optimisticMessage.sent_timestamp
          )
        );

        return null;
      } finally {
        setIsSendingMessage(false);
      }
    },
    [currentAccount, signAndExecute, suiClient, fetchMessages]
  );

  // Mark message as read
  const markAsRead = useCallback(
    async (chatId: string, messageIndex: number) => {
      if (!currentAccount) {
        return null;
      }

      try {
        const tx = new Transaction();

        tx.moveCall({
          target: `${CONFIG.VITE_PACKAGE_ID}::messaging::mark_as_read`,
          arguments: [
            tx.object(chatId),
            tx.pure.u64(messageIndex),
            tx.object("0x6"), // Clock object
          ],
        });

        const { digest } = await signAndExecute({ transaction: tx });

        await suiClient.waitForTransaction({
          digest,
          options: { showEffects: true },
        });

        // Refresh messages
        await fetchMessages(chatId);

        return { digest };
      } catch (err) {
        console.error("Error marking message as read:", err);
        return null;
      }
    },
    [currentAccount, signAndExecute, suiClient, fetchMessages]
  );

  // Fetch chats when account changes
  useEffect(() => {
    if (currentAccount) {
      fetchChats();
    }
  }, [currentAccount, fetchChats]);

  // Fetch usernames for chat participants
  useEffect(() => {
    const fetchUsernames = async () => {
      const newCache: Record<string, string> = { ...usernameCache };
      let updated = false;

      for (const chat of chats) {
        const otherUser =
          chat.participant_1 === currentAccount?.address
            ? chat.participant_2
            : chat.participant_1;

        if (!newCache[otherUser]) {
          try {
            const profile = await fetchProfileByAddress(otherUser);
            if (profile?.username) {
              newCache[otherUser] = profile.username;
              updated = true;
            }
          } catch (err) {
            console.error("Error fetching username for", otherUser, err);
          }
        }
      }

      if (updated) {
        setUsernameCache(newCache);
      }
    };

    if (chats.length > 0 && currentAccount) {
      fetchUsernames();
    }
  }, [chats, currentAccount, fetchProfileByAddress]);

  // Listen for new messages in the current chat
  useEffect(() => {
    if (!currentChat || !currentAccount) return;

    const chatId =
      typeof currentChat.id === "object" ? currentChat.id.id : currentChat.id;

    // Poll for new messages every 2 seconds for smoother updates
    const pollInterval = setInterval(async () => {
      try {
        const chatObj = await suiClient.getObject({
          id: chatId,
          options: { showContent: true },
        });

        if (chatObj.data?.content?.dataType === "moveObject") {
          const fields = (chatObj.data.content as any).fields;

          // Transform messages to flatten nested fields structure
          const transformedMessages = (fields.messages || []).map(
            (msg: any) => {
              if (msg.fields) {
                return {
                  encrypted_message: msg.fields.encrypted_message,
                  sender: msg.fields.sender,
                  sent_timestamp: msg.fields.sent_timestamp,
                  is_read: msg.fields.is_read,
                  content_hash: msg.fields.content_hash,
                };
              }
              return msg;
            }
          );

          // Compare messages by content to avoid unnecessary re-renders
          const hasNewMessages = transformedMessages.length !== messages.length;
          const lastMessageChanged =
            messages.length > 0 &&
            transformedMessages.length > 0 &&
            messages[messages.length - 1]?.sent_timestamp !==
              transformedMessages[transformedMessages.length - 1]
                ?.sent_timestamp;

          if (hasNewMessages || lastMessageChanged) {
            // Only update messages that actually changed
            setMessages((prevMessages) => {
              // If lengths are different, definitely update
              if (prevMessages.length !== transformedMessages.length) {
                return transformedMessages;
              }

              // Check if any message content changed
              const hasChanges = transformedMessages.some(
                (msg: any, idx: number) => {
                  const prevMsg = prevMessages[idx];
                  return (
                    !prevMsg || prevMsg.sent_timestamp !== msg.sent_timestamp
                  );
                }
              );

              return hasChanges ? transformedMessages : prevMessages;
            });
          }
        }
      } catch (err) {
        console.error("Error polling for new messages:", err);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [currentChat, currentAccount, suiClient, messages]);

  // Listen for new chats - poll less frequently since new chats are less common
  useEffect(() => {
    if (!currentAccount) return;

    // Poll for new chats every 8 seconds in silent mode
    const pollInterval = setInterval(() => {
      fetchChats(true); // silent = true for background refresh
    }, 8000); // Poll every 8 seconds

    return () => clearInterval(pollInterval);
  }, [currentAccount, fetchChats]);

  // Transform for UI with memoization to prevent flickering
  const transformedChats = useMemo(() => {
    return chats.map((chat) => {
      const otherUser =
        chat.participant_1 === currentAccount?.address
          ? chat.participant_2
          : chat.participant_1;

      const username = usernameCache[otherUser];
      const displayName =
        username || `User ${otherUser.slice(0, 6)}...${otherUser.slice(-4)}`;
      const handle = username || otherUser.slice(0, 8);

      return {
        id: chat.id,
        user: displayName,
        handle: handle,
        lastMsg: chat.lastMessage?.text || "No messages yet",
        timestamp: chat.lastMessage?.timestamp || chat.created_at,
        unread: chat.unreadCount,
      };
    });
  }, [chats, currentAccount, usernameCache]);

  return {
    // State
    chats: transformedChats,
    currentChat,
    messages: messages.map((msg) => {
      let text = "";
      try {
        if (Array.isArray(msg.encrypted_message)) {
          text = new TextDecoder().decode(
            new Uint8Array(msg.encrypted_message)
          );
        } else if (typeof msg.encrypted_message === "string") {
          text = msg.encrypted_message;
        } else {
          text = "[Unable to decode message]";
        }
      } catch (err) {
        console.error("Error decoding message:", err);
        text = "[Error decoding message]";
      }

      return {
        id: msg.sent_timestamp,
        sender: msg.sender,
        text: text,
        timestamp: parseInt(msg.sent_timestamp),
        is_read: msg.is_read,
      };
    }),
    isLoadingChats: isFetchingChats,
    isLoadingMessages: isFetchingMessages,
    isSendingMessage,
    isCreatingChat,
    error: chatError,

    // Actions
    startChat,
    fetchChats,
    getChatById,
    fetchMessages,
    sendMessage,
    markAsRead,
  };
};
