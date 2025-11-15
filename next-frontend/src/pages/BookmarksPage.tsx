import { Bookmark } from 'lucide-react'
import { Heart, MessageCircle, Repeat2, Share } from 'lucide-react'
import { MinimalHeader } from '../../components/minimal-header'
import { AppSidebar } from '../../components/app-sidebar'
import { SuiProvider } from '../../components/sui-context'
import { ComposeModal } from '../../components/compose-modal'
import { TrendingSidebar } from '../../components/trending-sidebar'
import { useState } from 'react'

interface BookmarkedPost {
  id: string
  author: string
  handle: string
  content: string
  timestamp: number
  likes: number
  replies: number
  reposts: number
  liked: boolean
}

const SAMPLE_BOOKMARKS: BookmarkedPost[] = [
  {
    id: '1',
    author: 'Sui Foundation',
    handle: 'suifoundation',
    content: 'Suiter represents the future of decentralized social networks. No censorship, pure connection.',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    likes: 1234,
    replies: 342,
    reposts: 856,
    liked: false,
  },
  {
    id: '2',
    author: 'Developer Daily',
    handle: 'devdaily',
    content: 'Building with React and TypeScript on Sui feels incredible. The performance is unmatched.',
    timestamp: Date.now() - 4 * 60 * 60 * 1000,
    likes: 892,
    replies: 156,
    reposts: 423,
    liked: false,
  },
  {
    id: '3',
    author: 'Web3 Daily',
    handle: 'web3daily',
    content: 'Monochrome elegance meets blockchain. Suiter proves that minimalism and functionality go hand in hand.',
    timestamp: Date.now() - 6 * 60 * 60 * 1000,
    likes: 2156,
    replies: 678,
    reposts: 1245,
    liked: false,
  },
]

function BookmarksContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [bookmarks, setBookmarks] = useState<BookmarkedPost[]>(SAMPLE_BOOKMARKS)

  const toggleLike = (id: string) => {
    setBookmarks(bookmarks.map(post =>
      post.id === id
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ))
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

        {/* Main Feed */}
        <main className="flex-1 overflow-y-auto border-r border-border max-w-2xl">
        <div className="h-full flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-background/80 backdrop-blur border-b border-border px-4 py-3 z-10 flex items-center gap-3">
            <Bookmark size={20} className="text-foreground" />
            <h2 className="text-xl font-bold text-foreground">Bookmarks</h2>
          </div>

          {/* Bookmarks List */}
          {bookmarks.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>You haven't bookmarked any posts yet</p>
            </div>
          ) : (
            bookmarks.map((post) => (
              <article
                key={post.id}
                className="border-b border-border p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {post.handle.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Author Info */}
                    <div className="flex items-center gap-1 text-sm">
                      <span className="font-semibold text-foreground hover:underline">{post.author}</span>
                      <span className="text-muted-foreground">@{post.handle}</span>
                    </div>

                    {/* Content */}
                    <p className="mt-2 text-foreground break-words">{post.content}</p>

                    {/* Engagement Stats */}
                    <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                      <span className="hover:underline cursor-pointer">{post.replies} replies</span>
                      <span className="hover:underline cursor-pointer">{post.reposts} reposts</span>
                      <span className="hover:underline cursor-pointer">{post.likes} likes</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-3 flex justify-between text-muted-foreground max-w-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="flex items-center gap-2 p-2 rounded-full hover:bg-muted transition-colors">
                        <MessageCircle size={16} />
                      </button>
                      <button className="flex items-center gap-2 p-2 rounded-full hover:bg-muted transition-colors">
                        <Repeat2 size={16} />
                      </button>
                      <button
                        onClick={() => toggleLike(post.id)}
                        className="flex items-center gap-2 p-2 rounded-full hover:bg-muted transition-colors"
                      >
                        <Heart
                          size={16}
                          fill={post.liked ? 'currentColor' : 'none'}
                          color={post.liked ? '#000' : 'currentColor'}
                        />
                      </button>
                      <button className="flex items-center gap-2 p-2 rounded-full hover:bg-muted transition-colors">
                        <Share size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
        </main>

        <TrendingSidebar />
      </div>

      <ComposeModal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} />
    </div>
  )
}

export default function BookmarksPage() {
  return (
    <SuiProvider>
      <BookmarksContent />
    </SuiProvider>
  )
}

