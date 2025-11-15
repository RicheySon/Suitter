import { ChevronRight, Moon, Sun, Lock, Trash2, LogOut, Wallet } from 'lucide-react'
import { MinimalHeader } from '../../components/minimal-header'
import { AppSidebar } from '../../components/app-sidebar'
import { ComposeModal } from '../../components/compose-modal'
import { TrendingSidebar } from '../../components/trending-sidebar'
import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit'
import { useTheme } from '../../components/theme-provider'
import { useState } from 'react'

interface SettingItem {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  action?: () => void
}

function SettingsContent() {
  const currentAccount = useCurrentAccount()
  const { mutate: disconnect } = useDisconnectWallet()
  const address = currentAccount?.address
  const { theme, toggleTheme } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showChangeWallet, setShowChangeWallet] = useState(false)

  const handleLogout = () => {
    disconnect()
  }

  const handleChangeWallet = () => {
    // Disconnect current wallet first
    disconnect()
    // Close the modal
    setShowChangeWallet(false)
    // The ConnectButton in the header will allow user to connect a different wallet
  }

  const handleDeleteAccount = () => {
    console.log('Account deleted')
    setShowDeleteConfirm(false)
    disconnect()
  }

  const privacySettings: SettingItem[] = [
    {
      id: 'private-account',
      label: 'Private Account',
      description: 'Only approved followers can see your posts',
      icon: <Lock size={20} />,
    },
    {
      id: 'message-requests',
      label: 'Allow Messages from Anyone',
      description: 'Let anyone send you direct messages',
      icon: <Lock size={20} />,
    },
  ]

  const accountSettings: SettingItem[] = [
    {
      id: 'change-wallet',
      label: 'Change Wallet',
      description: 'Switch to a different Sui wallet address',
      icon: <Wallet size={20} />,
      action: () => setShowChangeWallet(true),
    },
    {
      id: 'download-data',
      label: 'Download Your Data',
      description: 'Get a copy of your posts and profile data',
      icon: <Lock size={20} />,
    },
    {
      id: 'delete-account',
      label: 'Delete Account',
      description: 'Permanently delete your account and all data',
      icon: <Trash2 size={20} />,
      action: () => setShowDeleteConfirm(true),
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

        <main className="flex-1 overflow-y-auto border-r border-border max-w-2xl">
          <div className="h-full flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-background/80 backdrop-blur border-b border-border px-4 py-3 z-10">
              <h2 className="text-xl font-bold text-foreground">Settings</h2>
            </div>

            {/* Settings Content */}
            <div className="flex-1 divide-y divide-border">
              {/* Display Settings */}
              <section className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-4">Display</h3>
                <div className="space-y-3">
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {theme === 'dark' ? (
                        <Moon size={20} className="text-foreground" />
                      ) : (
                        <Sun size={20} className="text-foreground" />
                      )}
                      <div className="text-left">
                        <div className="font-semibold text-foreground">Theme</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-muted-foreground" />
                  </button>
                </div>
              </section>

              {/* Privacy Settings */}
              <section className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-4">Privacy & Safety</h3>
                <div className="space-y-3">
                  {privacySettings.map((setting) => (
                    <button
                      key={setting.id}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-foreground">{setting.icon}</div>
                        <div className="text-left">
                          <div className="font-semibold text-foreground">{setting.label}</div>
                          <div className="text-sm text-muted-foreground">{setting.description}</div>
                        </div>
                      </div>
                      <div className="w-10 h-6 bg-muted rounded-full relative flex items-center">
                        <div className="w-5 h-5 bg-background rounded-full absolute left-0.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Account Settings */}
              <section className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-4">Account</h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Connected Wallet</div>
                    <div className="font-mono text-sm text-foreground break-all">{address || 'Not connected'}</div>
                  </div>

                  {accountSettings.map((setting) => (
                    <button
                      key={setting.id}
                      onClick={setting.action}
                      className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors ${
                        setting.id === 'delete-account' ? 'hover:bg-destructive/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={setting.id === 'delete-account' ? 'text-destructive' : 'text-foreground'}>
                          {setting.icon}
                        </div>
                        <div className="text-left">
                          <div className={`font-semibold ${setting.id === 'delete-account' ? 'text-destructive' : 'text-foreground'}`}>
                            {setting.label}
                          </div>
                          <div className="text-sm text-muted-foreground">{setting.description}</div>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </section>

              {/* Logout Section */}
              <section className="p-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors text-destructive"
                >
                  <div className="flex items-center gap-3">
                    <LogOut size={20} />
                    <div className="text-left">
                      <div className="font-semibold">Disconnect Wallet</div>
                      <div className="text-sm text-muted-foreground">Sign out from Suitter</div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-muted-foreground" />
                </button>
              </section>

            </div>

            {/* Delete Account Confirmation Modal */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm p-4">
                <div className="card-base w-full max-w-sm p-6">
                  <h3 className="text-lg font-bold text-foreground mb-2">Delete Account?</h3>
                  <p className="text-muted-foreground mb-6">
                    This action cannot be undone. All your posts, followers, and data will be permanently deleted.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 btn-base py-2 bg-muted text-muted-foreground hover:bg-muted/80 rounded-lg font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="flex-1 btn-base py-2 bg-destructive text-destructive-foreground hover:opacity-90 rounded-lg font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Change Wallet Modal */}
            {showChangeWallet && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm p-4">
                <div className="card-base w-full max-w-md p-6">
                  <h3 className="text-lg font-bold text-foreground mb-2">Change Wallet</h3>
                  <p className="text-muted-foreground mb-4">
                    To change your wallet, you'll need to disconnect your current wallet first, then connect a different one.
                  </p>
                  
                  {address && (
                    <div className="mb-6 p-3 rounded-lg bg-muted border border-border">
                      <div className="text-xs text-muted-foreground mb-1">Current Wallet</div>
                      <div className="font-mono text-sm text-foreground break-all">{address}</div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <button
                      onClick={handleChangeWallet}
                      className="w-full btn-base py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold"
                    >
                      Disconnect & Change Wallet
                    </button>
                    <button
                      onClick={() => setShowChangeWallet(false)}
                      className="w-full btn-base py-3 bg-muted text-muted-foreground hover:bg-muted/80 rounded-lg font-semibold"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>Tip:</strong> After disconnecting, use the "Connect Wallet" button in the header to connect a different wallet.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <TrendingSidebar />
      </div>

      <ComposeModal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} />
    </div>
  )
}

export default function SettingsPage() {
  return <SettingsContent />
}

