

import { useSui } from './sui-context'
import { LogOut, Wallet } from 'lucide-react'
import { useState } from 'react'

export function WalletButton() {
  const { isConnected, address, connect, disconnect } = useSui()
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = async () => {
    setIsLoading(true)
    try {
      await connect()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full border border-border text-sm">
          <Wallet className="w-4 h-4" />
          <span className="font-mono text-xs">{address}</span>
        </div>
        <button
          onClick={disconnect}
          className="btn-base px-3 py-2 text-sm bg-muted text-muted-foreground hover:bg-muted/80"
          aria-label="Disconnect wallet"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Disconnect</span>
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isLoading}
      className="btn-base px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-opacity-90 font-medium"
    >
      <Wallet className="w-4 h-4" />
      <span className="hidden sm:inline">{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
      <span className="sm:hidden">{isLoading ? '...' : 'Connect'}</span>
    </button>
  )
}
