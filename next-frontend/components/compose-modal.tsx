

import { useState } from 'react'
import { X, Image, Smile } from 'lucide-react'
import { useSui } from './sui-context'
import { motion, AnimatePresence } from 'framer-motion'

interface ComposeModalProps {
  isOpen: boolean
  onClose: () => void
}

const CHAR_LIMIT = 280

export function ComposeModal({ isOpen, onClose }: ComposeModalProps) {
  const { address } = useSui()
  const [content, setContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  if (!address) return null

  const handlePost = async () => {
    if (!content.trim() || content.length > CHAR_LIMIT) return

    setIsPosting(true)
    try {
      // Simulate Sui transaction
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Posted on chain:', content)
      setContent('')
      onClose()
    } catch (error) {
      console.error('Failed to post:', error)
    } finally {
      setIsPosting(false)
    }
  }

  const charCount = content.length
  const charPercentage = (charCount / CHAR_LIMIT) * 100
  const charColor = charCount > CHAR_LIMIT ? '#000' : charCount > CHAR_LIMIT * 0.9 ? '#666' : 'transparent'

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-12 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="card-base w-full max-w-2xl shadow-lg overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
              <span className="text-sm text-muted-foreground">Drafts</span>
              <div className="w-8" />
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center text-sm font-mono font-bold flex-shrink-0">
                  {address.slice(-4).toUpperCase()}
                </div>
                <div className="flex-1">
                  <textarea
                    autoFocus
                    value={content}
                    onChange={(e) => setContent(e.target.value.slice(0, CHAR_LIMIT))}
                    placeholder="What's happening!?"
                    className="w-full text-2xl font-light bg-background text-foreground placeholder-muted-foreground focus:outline-none resize-none"
                    rows={6}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border px-4 py-4 flex justify-between items-center">
              <div className="flex gap-2">
                <button className="p-2 text-foreground hover:bg-muted rounded-full transition-colors" aria-label="Add image">
                  <Image size={20} />
                </button>
                <button className="p-2 text-foreground hover:bg-muted rounded-full transition-colors" aria-label="Add emoji">
                  <Smile size={20} />
                </button>
              </div>

              <div className="flex items-center gap-3">
                {charCount > 0 && (
                  <div className="flex items-center gap-2">
                    <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" stroke="rgb(200 200 200)" strokeWidth="2" />
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={`${charPercentage * 1.005} 100`}
                        className="transition-all duration-200"
                      />
                    </svg>
                    <span className={`text-xs font-mono ${charCount > CHAR_LIMIT * 0.9 ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                      {CHAR_LIMIT - charCount}
                    </span>
                  </div>
                )}
                <button
                  onClick={handlePost}
                  disabled={!content.trim() || charCount > CHAR_LIMIT || isPosting}
                  className="btn-base px-6 py-2 bg-primary text-primary-foreground hover:bg-opacity-90 font-semibold disabled:opacity-50"
                >
                  {isPosting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
