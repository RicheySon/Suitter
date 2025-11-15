

import { useState } from 'react'
import { useSui } from './sui-context'
import { SuitCard } from './suit-card'

interface Suit {
  id: string
  author: string
  handle: string
  avatar: string
  content: string
  timestamp: number
  likes: number
  replies: number
  reposts: number
  liked: boolean
  isNFT: boolean
  nftValue: number
  currentBid: number
  isEncrypted: boolean
}

interface HomeFeedProps {
  onCompose: () => void
}

const SAMPLE_SUITS: Suit[] = [
  {
    id: '1',
    author: 'Sui Foundation',
    handle: 'suifoundation',
    avatar: 'S',
    content: 'Introducing Suiter - a production-ready decentralized social network built on Sui blockchain. Every post is an NFT with dynamic value.',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    likes: 1243,
    replies: 342,
    reposts: 856,
    liked: false,
    isNFT: true,
    nftValue: 0.5,
    currentBid: 0.75,
    isEncrypted: true,
  },
  {
    id: '2',
    author: 'Developer Insights',
    handle: 'devinsights',
    avatar: 'D',
    content: 'Building on Sui with React and TypeScript. The performance is incredible. Transactions finalize in milliseconds.',
    timestamp: Date.now() - 4 * 60 * 60 * 1000,
    likes: 892,
    replies: 156,
    reposts: 423,
    liked: false,
    isNFT: true,
    nftValue: 0.3,
    currentBid: 0.4,
    isEncrypted: false,
  },
  {
    id: '3',
    author: 'Web3 Daily',
    handle: 'web3daily',
    avatar: 'W',
    content: 'Monochrome elegance meets decentralization. No distractions, just pure connection on the blockchain.',
    timestamp: Date.now() - 6 * 60 * 60 * 1000,
    likes: 2156,
    replies: 678,
    reposts: 1245,
    liked: false,
    isNFT: true,
    nftValue: 0.8,
    currentBid: 1.2,
    isEncrypted: true,
  },
]

export function HomeFeed({ onCompose }: HomeFeedProps) {
  const { address } = useSui()
  const [suits, setSuits] = useState<Suit[]>(SAMPLE_SUITS)
  const [tab, setTab] = useState<'foryou' | 'following' | 'feed'>('foryou')
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())

  const toggleLike = (id: string) => {
    setSuits(suits.map(suit =>
      suit.id === id
        ? { ...suit, liked: !suit.liked, likes: suit.liked ? suit.likes - 1 : suit.likes + 1 }
        : suit
    ))
  }

  const toggleBookmark = (id: string, isBookmarked: boolean) => {
    const newBookmarks = new Set(bookmarks)
    if (isBookmarked) {
      newBookmarks.add(id)
    } else {
      newBookmarks.delete(id)
    }
    setBookmarks(newBookmarks)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="sticky top-0 bg-background/80 backdrop-blur border-b border-border px-4 py-4 z-10">
        <div className="flex gap-3 justify-center border rounded-2xl p-2 max-w-md mx-auto">
          <button
            onClick={() => setTab('foryou')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              tab === 'foryou' 
                ? 'bg-foreground text-background' 
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            For You
          </button>
          <button
            onClick={() => setTab('following')}
            disabled={!address}
            className={`px-6 py-2 rounded-full font-semibold transition-all disabled:opacity-50 ${
              tab === 'following' 
                ? 'bg-foreground text-background' 
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            Following
          </button>
          <button
            onClick={() => setTab('feed')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              tab === 'feed'
                ? 'bg-foreground text-background' 
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            Feed
          </button>
        </div>
      </div>

      {/* Compose Section */}
      {address && (
        <div className="border-b border-border p-4">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-sm font-mono font-bold flex-shrink-0">
              {address.slice(-4).toUpperCase()}
            </div>
            <div className="flex-1">
              <button
                onClick={onCompose}
                className="w-full text-left text-lg text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/30"
              >
                What's happening!?
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suits Feed using SuitCard component */}
      <div className="flex-1 overflow-y-auto">
        {suits.map((suit) => (
          <SuitCard
            key={suit.id}
            {...suit}
            onLike={toggleLike}
            onBookmark={toggleBookmark}
            bookmarked={bookmarks.has(suit.id)}
          />
        ))}
      </div>
    </div>
  )
}
