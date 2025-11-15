'use client'

import { MapPin, LinkIcon, Calendar, ArrowLeft } from 'lucide-react'
import { MinimalHeader } from '@/components/minimal-header'
import { AppSidebar } from '@/components/app-sidebar'
import { SuiProvider } from '@/components/sui-context'
import { ComposeModal } from '@/components/compose-modal'
import { useSui } from '@/components/sui-context'
import { useState } from 'react'

interface ProfileProps {
  params: { address?: string }
}

function ProfileContent() {
  const { address } = useSui()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'suits' | 'media' | 'likes' | 'shorts'>('suits')
  const [isFollowing, setIsFollowing] = useState(false)

  const userProfile = {
    name: 'Gabby',
    handle: 'gabby',
    bio: 'Building decentralized social platforms | Web3 Enthusiast | Sui Developer',
    location: 'San Francisco, CA',
    website: 'johndoe.dev',
    joinedDate: 'March 2024',
    followers: 5678,
    following: 1234,
    walletAddress: '0x1234...5678',
  }

  const userPosts = [
    {
      id: '1',
      content: 'Just deployed my first smart contract on Sui. The experience is incredibly smooth.',
      timestamp: Date.now() - 2 * 60 * 60 * 1000,
      likes: 234,
      replies: 45,
      reposts: 89,
    },
    {
      id: '2',
      content: 'Suiter is the future of decentralized social networks. No censorship, pure connection.',
      timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
      likes: 892,
      replies: 156,
      reposts: 423,
    },
  ]

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
            {/* Header with Back Button */}
            <div className="sticky top-0 bg-background/80 backdrop-blur border-b border-border px-4 py-3 z-10 flex items-center gap-4">
              <button className="p-2 hover:bg-muted rounded-full transition-colors" aria-label="Back">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="font-bold text-lg text-foreground">{userProfile.name}</h2>
                <p className="text-xs text-muted-foreground">Profile</p>
              </div>
            </div>

            <div className="h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />

            {/* Profile Info */}
            <div className="px-6 pb-4">
              <div className="flex justify-between items-start -mt-24 mb-4 relative z-10">
                <div className="w-32 h-32 bg-gradient-to-br from-yellow-300 to-yellow-100 rounded-full flex items-center justify-center text-5xl font-mono font-bold border-4 border-background shadow-lg">
                  👤
                </div>
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`px-7 py-2 font-semibold rounded-full transition-all ${
                    isFollowing
                      ? 'bg-muted text-foreground hover:bg-muted/80'
                      : 'bg-foreground text-background hover:opacity-90'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">{userProfile.name}</h1>
                  <span className="text-blue-500">✓</span>
                </div>
                <p className="text-muted-foreground">@{userProfile.handle}</p>
              </div>

              <p className="text-foreground mb-4">{userProfile.bio}</p>

              <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  <span>{userProfile.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <LinkIcon size={16} />
                  <a href="#" className="text-blue-500 hover:underline">{userProfile.website}</a>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>Joined {userProfile.joinedDate}</span>
                </div>
              </div>

              <div className="flex gap-6 mb-4 text-sm">
                <button className="hover:opacity-80 transition-opacity">
                  <span className="font-bold text-foreground">{userProfile.following}</span>
                  <span className="text-muted-foreground ml-1">Following</span>
                </button>
                <button className="hover:opacity-80 transition-opacity">
                  <span className="font-bold text-foreground">{userProfile.followers}</span>
                  <span className="text-muted-foreground ml-1">Followers</span>
                </button>
              </div>

              {/* Wallet Address Badge */}
              <div className="inline-block bg-muted/50 text-muted-foreground px-4 py-2 rounded-lg text-xs font-mono mb-6">
                {userProfile.walletAddress}
              </div>
            </div>

            <div className="border-b border-border sticky top-0 bg-background/80 backdrop-blur">
              <div className="px-6 flex gap-8">
                {(['suits', 'media', 'likes', 'shorts'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 font-semibold capitalize text-sm transition-colors relative ${
                      activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-foreground rounded-full" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 text-center py-8 text-muted-foreground">
              <p>No {activeTab} yet</p>
            </div>
          </div>
        </main>
      </div>

      <ComposeModal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} />
    </div>
  )
}

export default function ProfilePage(props: ProfileProps) {
  return (
    <SuiProvider>
      <ProfileContent />
    </SuiProvider>
  )
}
