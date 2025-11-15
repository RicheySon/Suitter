import { useState, useEffect } from 'react'
import { Search, User, FileText, Loader2 } from 'lucide-react'
import { MinimalHeader } from '../../components/minimal-header'
import { AppSidebar } from '../../components/app-sidebar'
import { SuiProvider } from '../../components/sui-context'
import { ComposeModal } from '../../components/compose-modal'
import { TrendingSidebar } from '../../components/trending-sidebar'
import { SuitCard } from '../../components/suit-card'
import { useSearch, SearchResult } from '../../hooks/useSearch'
import { truncateAddress } from '@/lib/utils'

interface Category {
  name: string
  description: string
  postCount: number
}

const CATEGORIES: Category[] = [
  { name: 'Technology', description: 'Latest tech innovations and development', postCount: 1200000 },
  { name: 'Business', description: 'Entrepreneurship and market insights', postCount: 892000 },
  { name: 'Science', description: 'Scientific research and discoveries', postCount: 456000 },
  { name: 'Web3', description: 'Blockchain and decentralized systems', postCount: 678000 },
  { name: 'Development', description: 'Software development best practices', postCount: 1100000 },
  { name: 'Design', description: 'UI/UX and creative design', postCount: 923000 },
]

function ExploreContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchFilter, setSearchFilter] = useState<'all' | 'users' | 'posts'>('all')
  const [isSearchActive, setIsSearchActive] = useState(false)
  const { search, isSearching } = useSearch()
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearchActive(true)
        const filters = {
          users: searchFilter === 'all' || searchFilter === 'users',
          posts: searchFilter === 'all' || searchFilter === 'posts',
        }
        const results = await search(searchQuery, filters)
        setSearchResults(results)
      } else {
        setIsSearchActive(false)
        setSearchResults([])
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchFilter, search])

  const handleLike = (id: string) => {
    console.log('Like post:', id)
  }

  const handleBookmark = (id: string, isBookmarked: boolean) => {
    setBookmarks(prev => {
      const newBookmarks = new Set(prev)
      if (isBookmarked) {
        newBookmarks.add(id)
      } else {
        newBookmarks.delete(id)
      }
      return newBookmarks
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

        <main className="flex-1 overflow-hidden max-w-2xl w-full mx-auto border-r border-border">
          <div className="h-full flex flex-col overflow-y-auto">
            {/* Search Header */}
            <div className="sticky top-0 bg-background/80 backdrop-blur border-b border-border p-4 z-10">
              <div className="flex items-center gap-3 bg-muted rounded-full px-4 py-2">
                <Search size={20} className="text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for users, posts, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent flex-1 text-foreground placeholder-muted-foreground focus:outline-none"
                />
                {isSearching && (
                  <Loader2 size={20} className="text-muted-foreground animate-spin" />
                )}
              </div>

              {/* Search Filters */}
              {searchQuery.trim().length > 0 && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setSearchFilter('all')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      searchFilter === 'all'
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSearchFilter('users')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                      searchFilter === 'users'
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <User size={16} />
                    Users
                  </button>
                  <button
                    onClick={() => setSearchFilter('posts')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                      searchFilter === 'posts'
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <FileText size={16} />
                    Posts
                  </button>
                </div>
              )}
            </div>

            {/* Search Results or Categories */}
            {isSearchActive ? (
              <div className="p-4">
                {isSearching ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={32} className="text-muted-foreground animate-spin" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground">
                      Search Results ({searchResults.length})
                    </h2>
                    <div className="space-y-3">
                      {searchResults.map((result) => {
                        if (result.type === 'user') {
                          return (
                            <div
                              key={result.id}
                              className="p-4 card-base border border-border hover:bg-muted transition-all cursor-pointer"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                                  {result.username?.charAt(0).toUpperCase() || result.address?.slice(2, 4).toUpperCase() || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <User size={16} className="text-muted-foreground" />
                                    <span className="font-semibold text-foreground">
                                      {result.username || truncateAddress(result.address || '')}
                                    </span>
                                  </div>
                                  {result.bio && (
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                      {result.bio}
                                    </p>
                                  )}
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {truncateAddress(result.address || '')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        } else {
                          // Post result
                          return (
                            <div
                              key={result.id}
                              className="border-b border-border"
                            >
                              <SuitCard
                                id={result.id}
                                author={truncateAddress(result.creator || '')}
                                handle={truncateAddress(result.creator || '', 4, 4)}
                                avatar={result.creator?.slice(-2).toUpperCase() || '??'}
                                content={result.content || ''}
                                timestamp={result.createdAt || Date.now()}
                                likes={result.likeCount || 0}
                                replies={result.commentCount || 0}
                                reposts={result.retweetCount || 0}
                                liked={false}
                                reposted={false}
                                isNFT={true}
                                nftValue={0}
                                currentBid={0}
                                isEncrypted={false}
                                media={
                                  result.mediaUrls && result.mediaUrls.length > 0
                                    ? {
                                        type: 'image' as const,
                                        url: result.mediaUrls[0],
                                      }
                                    : undefined
                                }
                                onLike={handleLike}
                                onBookmark={handleBookmark}
                                bookmarked={bookmarks.has(result.id)}
                              />
                            </div>
                          )
                        }
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-semibold text-foreground">No results found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Try searching for something else
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4">
                <h2 className="text-2xl font-bold mb-6 text-foreground">Explore</h2>
                <div className="space-y-3">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category.name}
                      className="w-full p-4 card-base border border-border hover:bg-muted transition-all text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:underline">{category.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">{(category.postCount / 1000).toFixed(0)}K posts</p>
                        </div>
                        <div className="text-2xl font-bold text-muted ml-4">{category.name.charAt(0)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        <TrendingSidebar />
      </div>

      <ComposeModal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} />
    </div>
  )
}

export default function ExplorePage() {
  return (
    <SuiProvider>
      <ExploreContent />
    </SuiProvider>
  )
}

