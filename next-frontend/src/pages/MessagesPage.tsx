import { Search, Send, ArrowLeft, Plus } from "lucide-react";
import { MinimalHeader } from "../../components/minimal-header";
import { AppSidebar } from "../../components/app-sidebar";
import { NewChatModal } from "../../components/new-chat-modal";
import { SuiProvider } from "../../components/sui-context";
import { ComposeModal } from "../../components/compose-modal";

import { useState, useEffect } from "react";
import { useMessaging } from "../../hooks/useMessaging";
import { useCurrentAccount } from "@mysten/dapp-kit";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  isSender: boolean;
}

interface Channel {
  id: string;
  name: string;
  members: number;
  messagesCount: number;
  lastMessage: {
    text: string;
    sender: string;
    timestamp: number;
  } | null;
  creator: string;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function MessagesContent() {
  const currentAccount = useCurrentAccount();
  const {
    channels,
    isLoadingChats,
    createChannel,
    sendMessage: sendMsg,
    useMessages,
    isCreatingChannel,
    isSendingMessage,
  } = useMessaging();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [showMobileList, setShowMobileList] = useState(true);

  // Get messages for selected chat
  const { data: chatMessages = [] } = useMessages(selectedChat);

  // Convert SDK messages to UI format
  const messages: Message[] = chatMessages.map((msg: any, index: number) => ({
    id: index.toString(),
    sender: msg.sender,
    text: msg.text || "",
    timestamp: msg.timestamp || Date.now(),
    isSender: msg.sender === currentAccount?.address,
  }));

  const handleStartChat = async (receiverAddress: string) => {
    try {
      await createChannel(receiverAddress);
      setIsNewChatOpen(false);
    } catch (error) {
      console.error("Error creating channel:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedChat) return;

    try {
      await sendMsg({ channelId: selectedChat, content: inputValue });
      setInputValue("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Auto-select first channel if available
  useEffect(() => {
    if (!selectedChat && channels && channels.length > 0) {
      setSelectedChat(channels[0].id);
    }
  }, [channels, selectedChat]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <MinimalHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onCompose={() => setIsComposeOpen(true)}
        />

        <main className="flex-1 overflow-hidden border-r border-border w-full">
          <div className="h-full flex">
            {/* Chat List */}
            <div
              className={`w-full sm:w-80 flex flex-col border-r border-border ${
                !showMobileList ? "hidden sm:flex" : ""
              }`}
            >
              {/* Header */}
              <div className="border-b border-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">
                    Messages
                  </h2>
                  <button
                    onClick={() => setIsNewChatOpen(true)}
                    className="p-2 bg-foreground text-background rounded-full hover:opacity-90 transition-opacity"
                    aria-label="Start new chat"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2">
                  <Search size={18} className="text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search messages"
                    className="bg-transparent flex-1 text-foreground placeholder-muted-foreground focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                {!currentAccount ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Connect your wallet to view messages
                  </div>
                ) : isLoadingChats ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading chats...
                  </div>
                ) : !channels || channels.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No chats yet. Start a new conversation!
                  </div>
                ) : (
                  channels.map((channel: Channel) => {
                    return (
                      <button
                        key={channel.id}
                        onClick={() => {
                          setSelectedChat(channel.id);
                          setShowMobileList(false);
                        }}
                        className={`w-full p-4 border-b border-border hover:bg-muted/30 transition-colors text-left ${
                          selectedChat === channel.id ? "bg-muted/50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                            {channel.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-foreground">
                              {channel.name}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {channel.lastMessage?.text || "No messages yet"}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div
              className={`flex-1 flex flex-col ${
                showMobileList ? "hidden sm:flex" : ""
              }`}
            >
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="border-b border-border p-4 flex items-center gap-3">
                    <button
                      onClick={() => setShowMobileList(true)}
                      className="sm:hidden p-2 hover:bg-muted rounded-full transition-colors"
                      aria-label="Back to messages"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    {channels &&
                      channels.find((c: Channel) => c.id === selectedChat) &&
                      (() => {
                        const channel = channels.find(
                          (c: Channel) => c.id === selectedChat
                        )!;

                        return (
                          <>
                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                              {channel.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">
                                {channel.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                On Sui Network
                              </div>
                            </div>
                          </>
                        );
                      })()}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.isSender ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-2xl ${
                              msg.isSender
                                ? "bg-foreground text-background"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            <p className="text-sm">{msg.text}</p>
                            <div
                              className={`text-xs mt-1 ${
                                msg.isSender
                                  ? "text-background/70"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {formatTime(msg.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="border-t border-border p-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                        className="flex-1 bg-muted text-foreground placeholder-muted-foreground rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-foreground/20 text-sm"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="bg-foreground text-background p-2 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                        aria-label="Send message"
                        disabled={isSendingMessage || !inputValue.trim()}
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <p>Select a chat to start messaging</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* <TrendingSidebar /> */}
      </div>

      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
      />
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onStartChat={handleStartChat}
        isLoading={isCreatingChannel}
      />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <SuiProvider>
      <MessagesContent />
    </SuiProvider>
  );
}
