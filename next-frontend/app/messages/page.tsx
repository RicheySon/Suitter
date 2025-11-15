'use client'

import { Search, Send, ArrowLeft } from 'lucide-react'
import { NavHeader } from '@/components/nav-header'
import { SuiProvider } from '@/components/sui-context'
import { ComposeModal } from '@/components/compose-modal'
import { useState } from 'react'

interface Message {
  id: string
  user: string
  text: string
  timestamp: number
  isSender: boolean
}

interface Chat {
  id: string
  user: string
  handle: string
  lastMsg: string
  timestamp: number
  unread: number
}

const SAMPLE_CHATS: Chat[] = [
  {
    id: '1',
    user: 'Sui Foundation',
    handle: 'suifoundation',
    lastMsg: 'Great work on the integration!',
    timestamp: Date.now() - 1 * 60 * 60 * 1000,
    unread: 2,
  },
  {
    id: '2',
    user: 'Developer Daily',
    handle: 'devdaily',
    lastMsg: 'Thanks for sharing the docs',
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
    unread: 0,
  },
]

const SAMPLE_MESSAGES: Message[] = [
  {
    id: '1',
    user: 'Sui Foundation',
    text: 'Hey! How is the Suiter integration going?',
    timestamp: Date.now() - 10 * 60 * 1000,
    isSender: false,
  },
  {
    id: '2',
    user: 'You',
    text: 'Really well! Just finished the monochrome design.',
    timestamp: Date.now() - 8 * 60 * 1000,
    isSender: true,
  },
  {
    id: '3',
    user: 'Sui Foundation',
    text: 'Great work on the integration!',
    timestamp: Date.now() - 1 * 60 * 1000,
    isSender: false,
  },
]

function MessagesContent() {
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [selectedChat, setSelectedChat] = useState<string>('1')
  const [messages, setMessages] = useState<Message[]>(SAMPLE_MESSAGES)
  const [inputValue, setInputValue] = useState('')
  const [showMobileList, setShowMobileList] = useState(true)

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      user: 'You',
      text: inputValue,
      timestamp: Date.now(),
      isSender: true,
    }

    setMessages([...messages, newMessage])
    setInputValue('')
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <NavHeader />
      
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Chat List */}
          <div
            className={`w-full sm:w-80 flex flex-col border-r border-border ${
              !showMobileList ? 'hidden sm:flex' : ''
            }`}
          >
            {/* Header */}
            <div className="border-b border-border p-4">
              <h2 className="text-xl font-bold mb-4 text-foreground">Messages</h2>
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
              {SAMPLE_CHATS.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => {
                    setSelectedChat(chat.id)
                    setShowMobileList(false)
                  }}
                  className={`w-full p-4 border-b border-border hover:bg-muted/30 transition-colors text-left ${
                    selectedChat === chat.id ? 'bg-muted/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {chat.handle.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground">{chat.user}</div>
                      <div className="text-sm text-muted-foreground truncate">{chat.lastMsg}</div>
                    </div>
                    {chat.unread > 0 && (
                      <div className="bg-foreground text-background text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                        {chat.unread}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${showMobileList ? 'hidden sm:flex' : ''}`}>
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
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {SAMPLE_CHATS.find(c => c.id === selectedChat)?.handle.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      {SAMPLE_CHATS.find(c => c.id === selectedChat)?.user}
                    </div>
                    <div className="text-xs text-muted-foreground">Active now</div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isSender ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl ${
                          msg.isSender
                            ? 'bg-foreground text-background'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <div
                          className={`text-xs mt-1 ${
                            msg.isSender ? 'text-background/70' : 'text-muted-foreground'
                          }`}
                        >
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="border-t border-border p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 bg-muted text-foreground placeholder-muted-foreground rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-foreground/20 text-sm"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-foreground text-background p-2 rounded-full hover:opacity-90 transition-opacity"
                      aria-label="Send message"
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

      <ComposeModal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} />
    </div>
  )
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export default function MessagesPage() {
  return (
    <SuiProvider>
      <MessagesContent />
    </SuiProvider>
  )
}
