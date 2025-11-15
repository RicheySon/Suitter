import { MapPin, LinkIcon, Calendar, ArrowLeft, Mail, MoreHorizontal, Share } from 'lucide-react'
import { MinimalHeader } from '../../components/minimal-header'
import { AppSidebar } from '../../components/app-sidebar'
import { SuiProvider } from '../../components/sui-context'
import { ComposeModal } from '../../components/compose-modal'
import { TrendingSidebar } from '../../components/trending-sidebar'
import { useSui } from '../../components/sui-context'
import { useState } from 'react'

function ProfileContent() {
  const { address } = useSui()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'suits' | 'media' | 'likes' | 'replies'>('suits')
  const [isFollowing, setIsFollowing] = useState(false)

  const userProfile = {
    name: 'Gabby',
    handle: 'gabby',
    bio: 'Building decentralized social platforms on Sui | Web3 Enthusiast | Creating the future of social media 🚀',
    location: 'San Francisco, CA',
    website: 'gabby.sui',
    joinedDate: 'March 2024',
    followers: 5678,
    following: 1234,
    suitsCount: 342,
    walletAddress: address || '0x1234...5678',
  }

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
            {/* Header with Back Button */}
            {/* <div className="sticky top-0 bg-background/80 backdrop-blur border-b border-border px-4 py-3 z-10 flex items-center gap-4">
              <button className="p-2 hover:bg-muted rounded-full transition-colors" aria-label="Back">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="font-bold text-lg text-foreground">{userProfile.name}</h2>
                <p className="text-xs text-muted-foreground">Profile</p>
              </div>
            </div> */}

            {/* Cover Image */}
            <div className="relative h-48 bg-muted border-b border-border">
              <div className="absolute inset-0 bg-linear-to-br from-muted-foreground/5 to-muted-foreground/10" />
            </div>

            {/* Profile Info */}
            <div className="border-b border-border mt-24">
              <div className="px-4 pb-4">
                <div className="flex justify-between items-start -mt-16 mb-3">
                  <div className="w-32 h-32 rounded-full bg-muted border-4 border-background flex items-center justify-center text-5xl font-bold">
                    👤
                  </div>
                  <div className="flex gap-2 mt-16">
                    {address !== userProfile.walletAddress ? (
                      <>
                        <button
                          className="p-2 border border-border rounded-full hover:bg-muted transition-colors"
                          aria-label="More options"
                        >
                          <MoreHorizontal size={20} />
                        </button>
                        <button
                          className="px-4 py-2 border border-border rounded-full hover:bg-muted transition-colors font-semibold flex items-center gap-2"
                          aria-label="Message"
                        >
                          <Mail size={18} />
                        </button>
                        <button
                          onClick={() => setIsFollowing(!isFollowing)}
                          className={`px-4 py-2 font-semibold rounded-full transition-all ${
                            isFollowing
                              ? 'border border-border text-foreground hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400'
                              : 'bg-foreground text-background hover:bg-foreground/90'
                          }`}
                        >
                          {isFollowing ? 'Unfollow' : 'Follow'}
                        </button>
                      </>
                    ) : (
                      <button
                        className="px-4 py-2 border border-border rounded-full hover:bg-muted transition-colors font-semibold"
                      >
                        Edit profile
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center gap-1">
                    <h1 className="text-xl font-bold text-foreground">{userProfile.name}</h1>
                    <svg className="w-5 h-5 text-blue-500 fill-current" viewBox="0 0 22 22">
                      <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/>
                    </svg>
                  </div>
                  <p className="text-muted-foreground">@{userProfile.handle}</p>
                </div>

                <p className="text-foreground mb-3 leading-normal">{userProfile.bio}</p>

                <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3 text-sm text-muted-foreground">
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

                <div className="flex gap-4 text-sm">
                  <button className="hover:underline">
                    <span className="font-semibold text-foreground">{userProfile.following.toLocaleString()}</span>
                    <span className="text-muted-foreground ml-1">Following</span>
                  </button>
                  <button className="hover:underline">
                    <span className="font-semibold text-foreground">{userProfile.followers.toLocaleString()}</span>
                    <span className="text-muted-foreground ml-1">Followers</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border sticky top-[57px] bg-background z-10">
              <div className="flex">
                {(['suits', 'replies', 'media', 'likes'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 font-semibold capitalize text-sm transition-colors relative hover:bg-muted/50 ${
                      activeTab === tab ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1">
              {activeTab === 'suits' && (
                <div className="divide-y divide-border">
                  {/* Sample Posts */}
                  <article className="p-4 hover:bg-muted/30 transition-colors cursor-pointer">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full shrink-0 flex items-center justify-center font-bold">
                        {userProfile.handle.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-sm mb-1">
                          <span className="font-bold text-foreground hover:underline">{userProfile.name}</span>
                          <svg className="w-4 h-4 text-blue-500 fill-current" viewBox="0 0 22 22">
                            <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/>
                          </svg>
                          <span className="text-muted-foreground">@{userProfile.handle} · 2h</span>
                        </div>
                        <p className="text-foreground mb-3">Just deployed my first dApp on Sui! The speed and developer experience are incredible. Building on blockchain has never been this smooth 🚀</p>
                        <div className="flex gap-12 text-muted-foreground text-sm">
                          <button className="flex items-center gap-2 hover:text-blue-500 transition-colors group">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>24</span>
                          </button>
                          <button className="flex items-center gap-2 hover:text-green-500 transition-colors group">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>12</span>
                          </button>
                          <button className="flex items-center gap-2 hover:text-red-500 transition-colors group">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>156</span>
                          </button>
                          <button className="flex items-center gap-2 hover:text-blue-500 transition-colors group">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>

                  <article className="p-4 hover:bg-muted/30 transition-colors cursor-pointer">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full shrink-0 flex items-center justify-center font-bold">
                        {userProfile.handle.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-sm mb-1">
                          <span className="font-bold text-foreground hover:underline">{userProfile.name}</span>
                          <svg className="w-4 h-4 text-blue-500 fill-current" viewBox="0 0 22 22">
                            <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/>
                          </svg>
                          <span className="text-muted-foreground">@{userProfile.handle} · 5h</span>
                        </div>
                        <p className="text-foreground mb-3">The future of social media is decentralized. No single entity should control our digital lives. That's why we're building Suiter on Sui blockchain 💪</p>
                        <div className="flex gap-12 text-muted-foreground text-sm">
                          <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>89</span>
                          </button>
                          <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>34</span>
                          </button>
                          <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>432</span>
                          </button>
                          <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              )}
              {activeTab !== 'suits' && (
                <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    {activeTab === 'media' && <span className="text-2xl">📷</span>}
                    {activeTab === 'likes' && <span className="text-2xl">❤️</span>}
                    {activeTab === 'replies' && <span className="text-2xl">💬</span>}
                  </div>
                  <h3 className="text-foreground text-xl font-bold mb-2">
                    {activeTab === 'media' && 'No media yet'}
                    {activeTab === 'likes' && 'No likes yet'}
                    {activeTab === 'replies' && 'No replies yet'}
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    {activeTab === 'media' && `When ${userProfile.name} shares photos or videos, they'll show up here.`}
                    {activeTab === 'likes' && `When ${userProfile.name} likes a post, it'll show up here.`}
                    {activeTab === 'replies' && `When ${userProfile.name} replies to posts, they'll show up here.`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        <TrendingSidebar />
      </div>

      <ComposeModal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} />
    </div>
  )
}

export default function ProfilePage() {
  return (
    <SuiProvider>
      <ProfileContent />
    </SuiProvider>
  )
}

