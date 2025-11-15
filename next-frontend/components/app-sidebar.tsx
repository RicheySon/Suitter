import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X, Home, Compass, Heart, Mail, Bookmark, User, Settings, ChevronLeft, ChevronRight, Wallet } from 'lucide-react'

interface AppSidebarProps {
  isOpen: boolean
  onClose: () => void
  onCompose: () => void
}

export function AppSidebar({ isOpen, onClose, onCompose }: AppSidebarProps) {
  const location = useLocation()
  const activePage = location.pathname
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Explore', icon: Compass, href: '/explore' },
    { label: 'Notifications', icon: Heart, href: '/notifications' },
    { label: 'Messages', icon: Mail, href: '/messages' },
    { label: 'Bookmarks', icon: Bookmark, href: '/bookmarks' },
    { label: 'Assets', icon: Wallet, href: '/assets' },
    { label: 'Profile', icon: User, href: '/profile' },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ]

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full bg-background border-r border-border transform transition-all duration-300 z-40 lg:static lg:translate-x-0 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}
      >
        {/* Close button on mobile */}
        <div className="lg:hidden p-4 border-b border-border flex justify-end">
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => {
                  onClose()
                }}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                  activePage === item.href
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-foreground hover:bg-muted/50'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={20} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Controls */}
        <div className="border-t border-border p-4 space-y-3">
          {/* Compose Button */}
          <button
            onClick={() => {
              onCompose()
              onClose()
            }}
            className={`w-full bg-foreground text-background hover:bg-foreground/90 py-3 rounded-full font-semibold transition-colors flex items-center justify-center gap-2 ${
              isCollapsed ? 'px-0' : ''
            }`}
            title={isCollapsed ? 'Post' : undefined}
          >
            {isCollapsed ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            ) : (
              'Post'
            )}
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-full items-center justify-center gap-2 px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {!isCollapsed && <span className="text-sm">Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
