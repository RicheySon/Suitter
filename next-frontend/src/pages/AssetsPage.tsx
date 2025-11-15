import { useState, useEffect } from 'react'
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Copy, ExternalLink, RefreshCw, Image, Package, Coins, Eye, EyeOff } from 'lucide-react'
import { MinimalHeader } from '../../components/minimal-header'
import { AppSidebar } from '../../components/app-sidebar'
import { ComposeModal } from '../../components/compose-modal'
import { TrendingSidebar } from '../../components/trending-sidebar'
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
// import CONFIG from '../../config'

// const PACKAGE_ID = CONFIG.VITE_PACKAGE_ID

interface Bid {
  id: string
  suitName: string
  image: string
  currentBid: number
  myBid: number
  highestBidder: string
  endsIn: string
  status: 'winning' | 'outbid'
}

function AssetsContent() {
  const currentAccount = useCurrentAccount()
  const suiClient = useSuiClient()
  const address = currentAccount?.address
  const isConnected = !!currentAccount
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'suits' | 'nfts' | 'bids'>('suits')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isBalanceHidden, setIsBalanceHidden] = useState(false)
  const [suiBalance, setSuiBalance] = useState<number>(0)
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)
  const [suits, setSuits] = useState<any[]>([])
  const [nfts, setNfts] = useState<any[]>([])
  const [isLoadingSuits, setIsLoadingSuits] = useState(true)

  // Fetch real SUI balance
  const fetchBalance = async () => {
    if (!address) return
    
    setIsLoadingBalance(true)
    try {
      const balance = await suiClient.getBalance({
        owner: address,
      })
      
      // Convert MIST to SUI (1 SUI = 10^9 MIST)
      const suiAmount = Number(balance.totalBalance) / 1_000_000_000
      setSuiBalance(suiAmount)
    } catch (error) {
      console.error('Error fetching balance:', error)
    } finally {
      setIsLoadingBalance(false)
    }
  }

  // Fetch user's suits and NFTs
  const fetchUserAssets = async () => {
    if (!address) return
    
    setIsLoadingSuits(true)
    try {
      // Fetch all owned objects
      const ownedObjects = await suiClient.getOwnedObjects({
        owner: address,
        options: {
          showType: true,
          showContent: true,
          showDisplay: true,
        },
      })

      const userSuits: any[] = []
      const userNfts: any[] = []

      ownedObjects.data.forEach((obj) => {
        const objType = obj.data?.type
        const content = obj.data?.content as any
        const fields = content?.fields

        if (objType?.includes('::suits::Suit')) {
          // It's a Suit
          userSuits.push({
            id: obj.data?.objectId || '',
            name: `Suit #${obj.data?.objectId?.slice(-4)}`,
            description: fields?.content || 'A unique Suit NFT',
            image: '🤵',
            objectId: obj.data?.objectId || '',
            value: 0, // Could calculate based on engagement
            isOwned: true,
            rarity: 'Common',
            creator: fields?.creator || '',
            content: fields?.content || '',
            likes: parseInt(fields?.like_count) || 0,
            createdAt: parseInt(fields?.created_at) || Date.now(),
          })
        } else {
          // It's another NFT
          userNfts.push({
            id: obj.data?.objectId || '',
            name: obj.data?.display?.data?.name || `NFT #${obj.data?.objectId?.slice(-4)}`,
            collection: obj.data?.display?.data?.collection || 'Unknown Collection',
            image: obj.data?.display?.data?.image_url || '🎨',
            objectId: obj.data?.objectId || '',
            description: obj.data?.display?.data?.description || 'A unique NFT',
          })
        }
      })

      setSuits(userSuits)
      setNfts(userNfts)
    } catch (error) {
      console.error('Error fetching assets:', error)
    } finally {
      setIsLoadingSuits(false)
    }
  }

  // Fetch balance on mount and when address changes
  useEffect(() => {
    fetchBalance()
    fetchUserAssets()
  }, [address])

  const walletData = {
    suiBalance: suiBalance,
    suiPrice: 1.85, // You can fetch this from a price API
    totalValue: suiBalance * 1.85,
    change24h: 5.67, // You can fetch this from a price API
  }

  const bids: Bid[] = [
    // Bids will be empty for now - can be implemented later
  ]

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      // TODO: Show toast notification
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([fetchBalance(), fetchUserAssets()])
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const toggleBalanceVisibility = () => {
    setIsBalanceHidden(!isBalanceHidden)
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
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">Total Balance</p>
                        <button
                          onClick={toggleBalanceVisibility}
                          className="p-1 hover:bg-muted rounded transition-colors"
                          aria-label={isBalanceHidden ? "Show balance" : "Hide balance"}
                        >
                          {isBalanceHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      {isLoadingBalance ? (
                        <div className="h-9 w-32 bg-muted animate-pulse rounded" />
                      ) : (
                        <h3 className="text-3xl font-bold">
                          {isBalanceHidden ? '••••••' : `$${walletData.totalValue.toFixed(2)}`}
                        </h3>
                      )}
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                    walletData.change24h >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {walletData.change24h >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span className="text-sm font-semibold">
                      {isBalanceHidden ? '••••' : `${walletData.change24h >= 0 ? '+' : ''}${walletData.change24h.toFixed(2)}%`}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-background/50 rounded-lg p-3 backdrop-blur mb-3">
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

                {/* SUI Balance Display */}
                <div className="bg-background/50 rounded-lg p-3 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                        <Coins size={16} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">SUI Balance</p>
                        {isLoadingBalance ? (
                          <div className="h-5 w-24 bg-muted animate-pulse rounded" />
                        ) : (
                          <p className="font-semibold">
                            {isBalanceHidden ? '••••••' : `${walletData.suiBalance.toFixed(4)} SUI`}
                          </p>
                        )}
                      </div>
                    </div>
                    {!isLoadingBalance && !isBalanceHidden && (
                      <p className="text-xs text-muted-foreground">
                        ≈ ${(walletData.suiBalance * walletData.suiPrice).toFixed(2)}
                      </p>
                    )}
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
              {isLoadingSuits ? (
                <div className="flex items-center justify-center py-16">
                  <RefreshCw size={32} className="text-muted-foreground animate-spin" />
                </div>
              ) : (
                <>
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
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{suit.description}</p>
                            <div className="flex items-center justify-between pt-3 border-t border-border">
                              <div>
                                <p className="text-xs text-muted-foreground">Likes</p>
                                <p className="font-semibold text-lg">{suit.likes}</p>
                              </div>
                              <button
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold"
                              >
                                View Details
                              </button>
                            </div>
                            <div className="mt-2 pt-2 border-t border-border">
                              <p className="text-xs font-mono text-muted-foreground truncate">
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
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{nft.description}</p>
                            <div className="flex items-center justify-between pt-3 border-t border-border">
                              <span className="text-xs font-mono text-muted-foreground truncate">
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
                </>
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
