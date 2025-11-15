import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, Settings } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { WalletButton } from './wallet-button'

export function NavHeader() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/explore', label: 'Explore', icon: '🔍' },
    { href: '/notifications', label: 'Notifications', icon: '🔔' },
    { href: '/messages', label: 'Messages', icon: '💬' },
    { href: '/bookmarks', label: 'Bookmarks', icon: '🔖' },
  ]

  return (
    <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center">
              <span className="text-background font-mono text-xs font-bold">S</span>
            </div>
            <span className="hidden sm:inline font-mono">suiter</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors hover:bg-muted/50 text-foreground"
              >
                <span className="hidden lg:inline">{item.label}</span>
                <span className="lg:hidden">{item.icon}</span>
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <WalletButton />
            
            {/* Settings & Menu */}
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/settings"
                className="p-2 hover:bg-muted rounded-full transition-colors"
                aria-label="Settings"
              >
                <Settings size={20} />
              </Link>
            </div>
            
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-full transition-colors"
              aria-label="Toggle menu"
            >
              {mobileNavOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileNavOpen && (
          <nav className="md:hidden pb-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileNavOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-muted/50 text-foreground"
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <Link
              to="/settings"
              onClick={() => setMobileNavOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-muted/50 text-foreground"
            >
              <span className="mr-2">⚙️</span>
              Settings
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
