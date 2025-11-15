

import { TrendingUp } from 'lucide-react'

interface Trend {
  id: string
  category: string
  title: string
  posts: number
}

const TRENDING_TOPICS: Trend[] = [
  {
    id: '1',
    category: 'Technology',
    title: 'Blockchain Innovation',
    posts: 234500,
  },
  {
    id: '2',
    category: 'Web3',
    title: 'Decentralized Apps',
    posts: 189200,
  },
  {
    id: '3',
    category: 'Development',
    title: 'React 18 Updates',
    posts: 156800,
  },
  {
    id: '4',
    category: 'Cryptocurrency',
    title: 'Sui Ecosystem',
    posts: 145300,
  },
  {
    id: '5',
    category: 'AI',
    title: 'Machine Learning Trends',
    posts: 123400,
  },
]

export function TrendingSidebar() {
  return (
    <aside className="hidden lg:block w-80 border-l border-border bg-background md:flex flex-col h-screen">
      {/* Search Bar */}
      <div className="p-4 sticky top-0 bg-background/80 backdrop-blur border-b border-border z-10">
        <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-full">
          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder-muted-foreground"
          />
        </div>
      </div>

      {/* Trending Section */}
      <div className="flex-1 overflow-y-auto border-b border-border">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-foreground" />
            <h2 className="text-lg font-semibold text-foreground">What's Trending</h2>
          </div>

          <div className="space-y-3">
            {TRENDING_TOPICS.map((trend) => (
              <button
                key={trend.id}
                className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="text-xs text-muted-foreground font-medium mb-1">
                  {trend.category} · Trending
                </div>
                <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {trend.title}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {(trend.posts / 1000).toFixed(0)}K posts
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 text-xs text-muted-foreground space-y-2 border-t border-border">
        <p>Terms of Service · Privacy Policy · Cookie Policy</p>
        <p>© 2025 Suiter. Powered by Sui Blockchain</p>
      </div>
    </aside>
  )
}
