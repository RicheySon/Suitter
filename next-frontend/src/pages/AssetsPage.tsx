import { useState } from 'react'
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Copy, ExternalLink, RefreshCw, Image, Package, Coins } from 'lucide-react'
import { MinimalHeader } from '../../components/minimal-header'
import { AppSidebar } from '../../components/app-sidebar'
import { ComposeModal } from '../../components/compose-modal'
import { TrendingSidebar } from '../../components/trending-sidebar'
import { useCurrentAccount } from '@mysten/dapp-kit'

function AssetsContent() {
  const currentAccount = useCurrentAccount()
  const address = currentAccount?.address
  const isConnected = !!currentAccount
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'suits' | 'nfts' | 'bids'>('suits')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mock data - Replace with actual Sui blockchain queries
  const walletData = {
    totalValue: 1234.56,
    suiBalance: 500.25,
    suiPrice: 1.85,
    change24h: 5.67,
  }

  const suits = [
    {
      id: '1',
      name: 'Premium Business Suit',
      description: 'A sleek NFT suit perfect for professional settings',
      image: '🤵',
      objectId: '0x1234...5678',
      value: 2.5,
      isOwned: true,
      rarity: 'Legendary',
    },
    {
      id: '2',
      name: 'Casual Street Wear',
      description: 'Comfortable and stylish for everyday use',
      image: '👔',
      objectId: '0xabcd...efgh',
      value: 1.2,
      isOwned: true,
      rarity: 'Rare',
    },
    {
      id: '3',
      name: 'Elegant Evening Attire',
      description: 'Perfect for special occasions',
      image: '🎩',
      objectId: '0x9876...5432',
      value: 3.8,
      isOwned: true,
      rarity: 'Epic',
    },
  ]

  const nfts = [
    {
      id: '1',
      name: 'Suit #1234',
      collection: 'Suiter Collection',
      image: '🎨',
      objectId: '0x1234...5678',
      description: 'A unique digital suit NFT',
    },
    {
      id: '2',
      name: 'Sui Punk #567',
      collection: 'Sui Punks',
      image: '👾',
      objectId: '0xabcd...efgh',
      description: 'Collectible Sui Punk avatar',
    },
    {
      id: '3',
      name: 'Ocean Wave',
      collection: 'Sui Art Gallery',
      image: '🌊',
      objectId: '0x9876...5432',
      description: 'Beautiful ocean wave artwork',
    },
  ]

  const bids = [
    {
      id: '1',
      suitName: 'Royal Tuxedo',
      image: '🎭',
      currentBid: 5.5,
      myBid: 5.0,
      highestBidder: '0xabc...def',
      endsIn: '2h 45m',
      status: 'outbid' as const,
    },
    {
      id: '2',
      suitName: 'Digital Armor',
      image: '🛡️',
      currentBid: 3.2,
      myBid: 3.2,
      highestBidder: address || '0x000...000',
      endsIn: '5h 12m',
      status: 'winning' as const,
    },
    {
      id: '3',
      suitName: 'Cyber Ninja Outfit',
      image: '🥷',
      currentBid: 8.0,
      myBid: 7.5,
      highestBidder: '0x123...789',
      endsIn: '23h 8m',
      status: 'outbid' as const,
    },
  ]

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      // TODO: Show toast notification
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // TODO: Implement actual refresh logic
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  if (!isConnected) {
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
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <Wallet size={48} className="text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Connect your Sui wallet to view your assets, tokens, NFTs, and more.
              </p>
            </div>
          </main>

          <TrendingSidebar />
        </div>

        <ComposeModal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} />
      </div>
    )
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

        <main className="flex-1 overflow-y-auto border-r border-border w-full">
          <div className="h-full flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-background/80 backdrop-blur border-b border-border px-4 py-3 z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-muted rounded-full transition-colors lg:hidden" aria-label="Back">
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2 className="font-bold text-lg text-foreground">Assets</h2>
                  <p className="text-xs text-muted-foreground">Your Sui Wallet</p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                className="p-2 hover:bg-muted rounded-full transition-colors"
                aria-label="Refresh"
                disabled={isRefreshing}
              >
                <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
            </div>

            {/* Wallet Overview Card */}
            <div className="p-4 border-b border-border">
              <div className="bg-linear-to-br from-primary/5 to-accent/10 border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Wallet size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Balance</p>
                      <h3 className="text-3xl font-bold">${walletData.totalValue.toLocaleString()}</h3>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                    walletData.change24h >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {walletData.change24h >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span className="text-sm font-semibold">
                      {walletData.change24h >= 0 ? '+' : ''}{walletData.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-background/50 rounded-lg p-3 backdrop-blur">
                  <span className="text-sm font-mono text-muted-foreground">
                    {address?.slice(0, 8)}...{address?.slice(-6)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyAddress}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      aria-label="Copy address"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      aria-label="View on explorer"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('suits')}
                  className={`flex-1 px-4 py-4 font-semibold text-sm transition-colors relative hover:bg-muted/50 ${
                    activeTab === 'suits'
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Package size={18} />
                    Suits
                  </div>
                  {activeTab === 'suits' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('nfts')}
                  className={`flex-1 px-4 py-4 font-semibold text-sm transition-colors relative hover:bg-muted/50 ${
                    activeTab === 'nfts'
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Image size={18} />
                    NFTs
                  </div>
                  {activeTab === 'nfts' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('bids')}
                  className={`flex-1 px-4 py-4 font-semibold text-sm transition-colors relative hover:bg-muted/50 ${
                    activeTab === 'bids'
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Coins size={18} />
                    Bids
                  </div>
                  {activeTab === 'bids' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t" />
                  )}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4">
              {activeTab === 'suits' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suits.map((suit) => (
                    <div
                      key={suit.id}
                      className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      <div className="aspect-square bg-muted flex items-center justify-center text-6xl">
                        {suit.image}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{suit.name}</h4>
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-semibold">
                            {suit.rarity}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{suit.description}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <div>
                            <p className="text-xs text-muted-foreground">Value</p>
                            <p className="font-semibold text-lg">{suit.value} SUI</p>
                          </div>
                          <button
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold"
                          >
                            View Details
                          </button>
                        </div>
                        <div className="mt-2 pt-2 border-t border-border">
                          <p className="text-xs font-mono text-muted-foreground">
                            {suit.objectId}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'nfts' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nfts.map((nft) => (
                    <div
                      key={nft.id}
                      className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      <div className="aspect-square bg-muted flex items-center justify-center text-6xl">
                        {nft.image}
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold mb-1">{nft.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{nft.collection}</p>
                        <p className="text-xs text-muted-foreground mb-3">{nft.description}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <span className="text-xs font-mono text-muted-foreground">
                            {nft.objectId.slice(0, 6)}...{nft.objectId.slice(-4)}
                          </span>
                          <button
                            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                            aria-label="View details"
                          >
                            <ExternalLink size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'bids' && (
                <div className="space-y-3">
                  {bids.map((bid) => (
                    <div
                      key={bid.id}
                      className="bg-card border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center text-4xl shrink-0">
                          {bid.image}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-lg">{bid.suitName}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              bid.status === 'winning' 
                                ? 'bg-green-500/10 text-green-500' 
                                : 'bg-red-500/10 text-red-500'
                            }`}>
                              {bid.status === 'winning' ? '🏆 Winning' : '⚠️ Outbid'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <p className="text-xs text-muted-foreground">Your Bid</p>
                              <p className="font-semibold">{bid.myBid} SUI</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Current Bid</p>
                              <p className="font-semibold text-primary">{bid.currentBid} SUI</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-border">
                            <div>
                              <p className="text-xs text-muted-foreground">Ends in</p>
                              <p className="text-sm font-semibold">{bid.endsIn}</p>
                            </div>
                            <button
                              className={`px-4 py-2 rounded-lg transition-colors text-sm font-semibold ${
                                bid.status === 'winning'
                                  ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
                              }`}
                            >
                              {bid.status === 'winning' ? 'View Auction' : 'Increase Bid'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {((activeTab === 'suits' && suits.length === 0) ||
                (activeTab === 'nfts' && nfts.length === 0) ||
                (activeTab === 'bids' && bids.length === 0)) && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                    {activeTab === 'suits' && <Package size={40} className="text-muted-foreground" />}
                    {activeTab === 'nfts' && <Image size={40} className="text-muted-foreground" />}
                    {activeTab === 'bids' && <Coins size={40} className="text-muted-foreground" />}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No {activeTab} found</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {activeTab === 'suits' && 'You don\'t have any suits in your collection yet.'}
                    {activeTab === 'nfts' && 'You don\'t have any NFTs in your collection yet.'}
                    {activeTab === 'bids' && 'You haven\'t placed any bids yet.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* <TrendingSidebar /> */}
      </div>

      <ComposeModal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} />
    </div>
  )
}

export default function AssetsPage() {
  return <AssetsContent />
}
