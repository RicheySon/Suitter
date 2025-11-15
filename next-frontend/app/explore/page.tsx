'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { MinimalHeader } from '@/components/minimal-header'
import { AppSidebar } from '@/components/app-sidebar'
import { SuiProvider } from '@/components/sui-context'
import { ComposeModal } from '@/components/compose-modal'

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
                  placeholder="Search Suiter"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent flex-1 text-foreground placeholder-muted-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Categories Grid */}
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
          </div>
        </main>
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
