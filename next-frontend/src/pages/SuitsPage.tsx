import { ArrowLeft } from 'lucide-react'
import { MinimalHeader } from '../../components/minimal-header'
import { AppSidebar } from '../../components/app-sidebar'
import { SuiProvider } from '../../components/sui-context'
import { ComposeModal } from '../../components/compose-modal'
import { TrendingSidebar } from '../../components/trending-sidebar'
import { useSui } from '../../components/sui-context'
import { useState } from 'react'
import { SuitCard } from '../../components/suit-card'

function SuitsContent() {
  const { address } = useSui()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [likedSuits, setLikedSuits] = useState<Set<string>>(new Set())
  const [bookmarkedSuits, setBookmarkedSuits] = useState<Set<string>>(new Set())

  const suits = [
    {
      id: '1',
      author: 'Sui Developer',
      handle: 'sui_dev',
      avatar: 'S',
      content: 'Just created my first NFT suit on Suiter. The blockchain integration is seamless!',
      timestamp: Date.now() - 2 * 60 * 60 * 1000,
      likes: 234,
      replies: 45,
      reposts: 89,
      isNFT: true,
      nftValue: 0.5,
      currentBid: 0.75,
      isEncrypted: true,
    },
    {
      id: '2',
      author: 'Web3 Creator',
      handle: 'web3_creator',
      avatar: 'W',
      content: 'Decentralized fashion on the blockchain. Suits are the future!',
      timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
      likes: 892,
      replies: 156,
      reposts: 423,
      isNFT: true,
      nftValue: 1.2,
      currentBid: 1.5,
      isEncrypted: false,
    },
  ]

  const handleLike = (id: string) => {
    setLikedSuits(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBookmark = (id: string, isBookmarked: boolean) => {
    setBookmarkedSuits(prev => {
      const next = new Set(prev)
      if (!isBookmarked) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <MinimalHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          onCompose={() => setIsComposeOpen(true)}
        />

        <main className="flex-1 overflow-y-auto border-r border-border max-w-2xl">
          <div className="h-full flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-background/80 backdrop-blur border-b border-border px-4 py-3 z-10 flex items-center gap-4">
              <button className="p-2 hover:bg-muted rounded-full transition-colors" aria-label="Back">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="font-bold text-lg text-foreground">Suits Marketplace</h2>
                <p className="text-xs text-muted-foreground">Buy, Sell, and Bid on NFT Suits</p>
              </div>
            </div>

            {/* Suits Feed */}
            <div className="flex-1 divide-y divide-border">
              {suits.map((suit) => (
                <SuitCard
                  key={suit.id}
                  {...suit}
                  liked={likedSuits.has(suit.id)}
                  bookmarked={bookmarkedSuits.has(suit.id)}
                  onLike={handleLike}
                  onBookmark={handleBookmark}
                />
              ))}
            </div>
          </div>
        </main>

        <TrendingSidebar />
      </div>

      <ComposeModal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} />
    </div>
  )
}

export default function SuitsPage() {
  return (
    <SuiProvider>
      <SuitsContent />
    </SuiProvider>
  )
}

