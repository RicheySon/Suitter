'use client'

import { Heart, MessageCircle, Repeat2, User } from 'lucide-react'
import { NavHeader } from '@/components/nav-header'
import { SuiProvider } from '@/components/sui-context'
import { ComposeModal } from '@/components/compose-modal'
import { useState } from 'react'

interface Notification {
  id: string
  user: string
  handle: string
  type: 'like' | 'repost' | 'follow' | 'reply' | 'mention'
  message: string
  timestamp: number
  read: boolean
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    user: 'Sui Foundation',
    handle: 'suifoundation',
    type: 'like',
    message: 'liked your post',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    read: false,
  },
  {
    id: '2',
    user: 'Dev Insights',
    handle: 'devinsights',
    type: 'follow',
    message: 'started following you',
    timestamp: Date.now() - 4 * 60 * 60 * 1000,
    read: false,
  },
  {
    id: '3',
    user: 'Tech Daily',
    handle: 'techdaily',
    type: 'repost',
    message: 'reposted your post',
    timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
    read: true,
  },
  {
    id: '4',
    user: 'Web3 Enthusiast',
    handle: 'web3enthusiast',
    type: 'reply',
    message: 'replied to your post',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    read: true,
  },
]

function NotificationsContent() {
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS)

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <Heart size={18} className="text-foreground" />
      case 'repost':
        return <Repeat2 size={18} className="text-foreground" />
      case 'follow':
        return <User size={18} className="text-foreground" />
      case 'reply':
      case 'mention':
        return <MessageCircle size={18} className="text-foreground" />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <NavHeader />
      
      <main className="flex-1 overflow-hidden max-w-2xl w-full mx-auto border-r border-border">
        <div className="h-full flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-background/80 backdrop-blur border-b border-border px-4 py-3 z-10">
            <h2 className="text-xl font-bold text-foreground">Notifications</h2>
          </div>

          {/* Notifications List */}
          <div>
            {notifications.length === 0 ? (
              <div className="flex items-center justify-center h-96 text-muted-foreground">
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  className={`w-full border-b border-border p-4 hover:bg-muted/30 transition-colors text-left ${
                    !notif.read ? 'bg-muted/10' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Avatar with Badge */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-sm font-bold">
                        {notif.handle.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-foreground text-background rounded-full p-1 flex items-center justify-center">
                        {getNotificationIcon(notif.type)}
                      </div>
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{notif.user}</span>
                        <span className="text-muted-foreground">@{notif.handle}</span>
                      </div>
                      <p className="text-sm text-foreground mt-1">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelativeTime(notif.timestamp)}
                      </p>
                    </div>

                    {!notif.read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </main>

      <ComposeModal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} />
    </div>
  )
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return 'older'
}

export default function NotificationsPage() {
  return (
    <SuiProvider>
      <NotificationsContent />
    </SuiProvider>
  )
}
