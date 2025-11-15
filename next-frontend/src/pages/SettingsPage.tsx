import { ChevronRight, Moon, Sun, Lock, Trash2, LogOut } from "lucide-react";
import { MinimalHeader } from "../../components/minimal-header";
import { AppSidebar } from "../../components/app-sidebar";
import { SuiProvider } from "../../components/sui-context";
import { ComposeModal } from "../../components/compose-modal";
import { TrendingSidebar } from "../../components/trending-sidebar";
import { useSui } from "../../components/sui-context";
import { useTheme } from "../../components/theme-provider";
import { useEffect, useState } from "react";
import { useProfile } from "../../hooks/useProfile";

interface SettingItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action?: () => void;
}

function SettingsContent() {
  const { disconnect, address } = useSui();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const {
    fetchMyProfile,
    createProfile,
    updateProfile,
    error: profileError,
    isLoading: profileLoading,
  } = useProfile();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [pfpUrl, setPfpUrl] = useState("");
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const prof = await fetchMyProfile();
      if (prof) {
        setProfileId((prof as any).data?.objectId);
        // If the Move object fields are accessible, try to prefill from them (optional, keep blank if not resolvable)
      }
    })();
  }, [fetchMyProfile]);

  const handleLogout = () => {
    disconnect();
  };

  const handleDeleteAccount = () => {
    console.log("Account deleted");
    setShowDeleteConfirm(false);
    disconnect();
  };

  const privacySettings: SettingItem[] = [
    {
      id: "private-account",
      label: "Private Account",
      description: "Only approved followers can see your posts",
      icon: <Lock size={20} />,
    },
    {
      id: "message-requests",
      label: "Allow Messages from Anyone",
      description: "Let anyone send you direct messages",
      icon: <Lock size={20} />,
    },
  ];

  const accountSettings: SettingItem[] = [
    {
      id: "change-wallet",
      label: "Change Wallet",
      description: "Switch to a different Sui wallet address",
      icon: <Lock size={20} />,
    },
    {
      id: "download-data",
      label: "Download Your Data",
      description: "Get a copy of your posts and profile data",
      icon: <Lock size={20} />,
    },
    {
      id: "delete-account",
      label: "Delete Account",
      description: "Permanently delete your account and all data",
      icon: <Trash2 size={20} />,
      action: () => setShowDeleteConfirm(true),
    },
  ];

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
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Display
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {theme === "dark" ? (
                        <Moon size={20} className="text-foreground" />
                      ) : (
                        <Sun size={20} className="text-foreground" />
                      )}
                      <div className="text-left">
                        <div className="font-semibold text-foreground">
                          Theme
                        </div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {theme === "dark" ? "Dark Mode" : "Light Mode"}
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-muted-foreground" />
                  </button>
                </div>
              </section>

              {/* Privacy Settings */}
              <section className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Privacy & Safety
                </h3>
                <div className="space-y-3">
                  {privacySettings.map((setting) => (
                    <button
                      key={setting.id}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-foreground">{setting.icon}</div>
                        <div className="text-left">
                          <div className="font-semibold text-foreground">
                            {setting.label}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {setting.description}
                          </div>
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
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Account
                </h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">
                      Connected Wallet
                    </div>
                    <div className="font-mono text-sm text-foreground break-all">
                      {address || "Not connected"}
                    </div>
                  </div>

                  {/* Profile on-chain settings */}
                  <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-3">
                    <div className="text-sm font-semibold text-foreground">
                      Profile (on-chain)
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        className="w-full px-3 py-2 rounded-md bg-muted text-foreground placeholder-muted-foreground focus:outline-none"
                      />
                      <input
                        type="text"
                        value={pfpUrl}
                        onChange={(e) => setPfpUrl(e.target.value)}
                        placeholder="Profile image URL"
                        className="w-full px-3 py-2 rounded-md bg-muted text-foreground placeholder-muted-foreground focus:outline-none"
                      />
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Bio"
                        className="w-full px-3 py-2 rounded-md bg-muted text-foreground placeholder-muted-foreground focus:outline-none"
                      />
                    </div>
                    {profileError && (
                      <div className="text-xs text-destructive">
                        {profileError}
                      </div>
                    )}
                    <div className="flex gap-2">
                      {!profileId ? (
                        <button
                          disabled={profileLoading}
                          onClick={async () => {
                            await createProfile(username, bio, pfpUrl);
                            const prof = await fetchMyProfile();
                            if (prof)
                              setProfileId((prof as any).data?.objectId);
                          }}
                          className="px-3 py-2 rounded-md bg-foreground text-background hover:opacity-90"
                        >
                          {profileLoading ? "Creating…" : "Create Profile"}
                        </button>
                      ) : (
                        <button
                          disabled={profileLoading}
                          onClick={async () => {
                            await updateProfile(
                              profileId,
                              username,
                              bio,
                              pfpUrl
                            );
                          }}
                          className="px-3 py-2 rounded-md bg-foreground text-background hover:opacity-90"
                        >
                          {profileLoading ? "Updating…" : "Update Profile"}
                        </button>
                      )}
                    </div>
                  </div>

                  {accountSettings.map((setting) => (
                    <button
                      key={setting.id}
                      onClick={setting.action}
                      className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors ${
                        setting.id === "delete-account"
                          ? "hover:bg-destructive/10"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={
                            setting.id === "delete-account"
                              ? "text-destructive"
                              : "text-foreground"
                          }
                        >
                          {setting.icon}
                        </div>
                        <div className="text-left">
                          <div
                            className={`font-semibold ${
                              setting.id === "delete-account"
                                ? "text-destructive"
                                : "text-foreground"
                            }`}
                          >
                            {setting.label}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {setting.description}
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        size={20}
                        className="text-muted-foreground"
                      />
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
                      <div className="text-sm text-muted-foreground">
                        Sign out from Suiter
                      </div>
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
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Delete Account?
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    This action cannot be undone. All your posts, followers, and
                    data will be permanently deleted.
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
          </div>
        </main>

        <TrendingSidebar />
      </div>

      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
      />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <SuiProvider>
      <SettingsContent />
    </SuiProvider>
  );
}
