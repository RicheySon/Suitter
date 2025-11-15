import { useState } from 'react'
import { MinimalHeader } from '../../components/minimal-header'
import { AppSidebar } from '../../components/app-sidebar'
import { SuiProvider } from '../../components/sui-context'
import { HomeFeed } from '../../components/home-feed'
import { TrendingSidebar } from '../../components/trending-sidebar'
import { ComposeModal } from '../../components/compose-modal'

export default function HomePage() {
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

          {/* Main Feed */}
          <main className="flex-1 overflow-y-auto border-r border-border max-w-5xl">
            <HomeFeed onCompose={() => setIsComposeOpen(true)} />
          </main>

          <TrendingSidebar />
        </div>

        <ComposeModal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} />
      </div>
    </SuiProvider>
  )
}

