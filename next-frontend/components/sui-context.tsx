import React, { createContext, useContext, useState, useEffect } from 'react'

interface SuiContextType {
  isConnected: boolean
  address: string | null
  connect: () => Promise<void>
  disconnect: () => void
}

const SuiContext = createContext<SuiContextType | undefined>(undefined)

export function SuiProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    // Load persisted wallet connection
    const savedAddress = localStorage.getItem('sui_address')
    if (savedAddress) {
      setAddress(savedAddress)
      setIsConnected(true)
    }
  }, [])

  const connect = async () => {
    // Placeholder: Integrate actual Sui wallet connection
    const mockAddress = '0x' + Math.random().toString(16).slice(2, 10) + '...' + Math.random().toString(16).slice(2, 6)
    localStorage.setItem('sui_address', mockAddress)
    setAddress(mockAddress)
    setIsConnected(true)
  }

  const disconnect = () => {
    localStorage.removeItem('sui_address')
    setAddress(null)
    setIsConnected(false)
  }

  return (
    <SuiContext.Provider value={{ isConnected, address, connect, disconnect }}>
      {children}
    </SuiContext.Provider>
  )
}

export function useSui() {
  const context = useContext(SuiContext)
  if (!context) {
    throw new Error('useSui must be used within SuiProvider')
  }
  return context
}
