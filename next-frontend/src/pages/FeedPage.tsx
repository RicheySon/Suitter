import { useState } from 'react'
import { MinimalHeader } from '../../components/minimal-header'
import { AppSidebar } from '../../components/app-sidebar'
import { SuiProvider } from '../../components/sui-context'
import { FeedVertical } from '../../components/feed-vertical'
import { ComposeModal } from '../../components/compose-modal'
import { TrendingSidebar } from '../../components/trending-sidebar'

export default function FeedPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isComposeOpen, setIsComposeOpen] = useState(false)

  return (
    <SuiProvider>
      <div className="flex flex-col h-screen bg-background">
        <MinimalHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div className="flex flex-1 overflow-hidden">
          <AppSidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)}
            onCompose={() => setIsComposeOpen(true)}
          />

          {/* Vertical Feed */}
          <main className="flex-1 overflow-hidden bg-black">
            <FeedVertical />
          </main>

          <TrendingSidebar />
        </div>

        <ComposeModal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} />
      </div>
    </SuiProvider>
  )
}

