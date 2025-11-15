import { useState, useRef, useEffect } from 'react'
import { X, Image, Smile, Loader2, Video, XCircle } from 'lucide-react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { motion, AnimatePresence } from 'framer-motion'
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react'

interface ReplyModalProps {
  isOpen: boolean
  onClose: () => void
  originalSuit: {
    id: string
    author: string
    handle: string
    avatar: string
    content: string
  }
  onReplySubmit: (suitId: string, replyContent: string) => void
}

const CHAR_LIMIT = 280
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

export function ReplyModal({ isOpen, onClose, originalSuit, onReplySubmit }: ReplyModalProps) {
  const currentAccount = useCurrentAccount()
  const address = currentAccount?.address
  const [content, setContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmojiPicker])

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [previewUrls])

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus()
      // Auto-adjust textarea height
      const textarea = textareaRef.current
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [isOpen, content])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const acceptedTypes = type === 'image' ? ACCEPTED_IMAGE_TYPES : ACCEPTED_VIDEO_TYPES

    if (!acceptedTypes.includes(file.type)) {
      setError(`Please select a valid ${type} file`)
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`)
      return
    }

    // Clear previous files and add new one
    previewUrls.forEach(url => URL.revokeObjectURL(url))
    const newPreviewUrl = URL.createObjectURL(file)
    setSelectedFiles([file])
    setPreviewUrls([newPreviewUrl])
    setError('')

    // Reset input
    event.target.value = ''
  }

  const handleRemoveFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index])
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!content.trim() || !address || isPosting) return

    setIsPosting(true)
    setError('')
    try {
      // TODO: Implement actual reply submission to blockchain
      // Upload files to IPFS or decentralized storage first
      if (selectedFiles.length > 0) {
        console.log('Uploading files:', selectedFiles)
        // fileUrls would be used here when implementing actual file upload
      }

      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      onReplySubmit(originalSuit.id, content)
      
      // Cleanup
      previewUrls.forEach(url => URL.revokeObjectURL(url))
      setContent('')
      setSelectedFiles([])
      setPreviewUrls([])
      onClose()
    } catch (error) {
      console.error('Error posting reply:', error)
      setError('Failed to post reply. Please try again.')
    } finally {
      setIsPosting(false)
    }
  }

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newContent = content.substring(0, start) + emoji + content.substring(end)
    
    setContent(newContent)
    
    // Set cursor position after emoji
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length
      textarea.focus()
    }, 0)
    
    setShowEmojiPicker(false)
  }

  const charCount = content.length
  const isOverLimit = charCount > CHAR_LIMIT
  const charPercentage = (charCount / CHAR_LIMIT) * 100

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-16 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="bg-background border border-border rounded-2xl w-full max-w-xl shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-border flex items-center justify-between">
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors"
              disabled={isPosting}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-semibold text-lg">Reply</h2>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>

          <div className="p-4">
            {/* Original Suit */}
            <div className="flex gap-3 mb-4 pb-4 border-b border-border">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold shrink-0">
                  {originalSuit.avatar}
                </div>
                <div className="w-0.5 bg-border flex-1 my-2" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold truncate">{originalSuit.author}</span>
                  <span className="text-muted-foreground text-sm truncate">@{originalSuit.handle}</span>
                </div>
                <p className="text-foreground wrap-break-word whitespace-pre-wrap">{originalSuit.content}</p>
                <p className="text-muted-foreground text-sm mt-2">
                  Replying to <span className="text-primary">@{originalSuit.handle}</span>
                </p>
              </div>
            </div>

            {/* Reply Input */}
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold shrink-0">
                {address ? address.slice(0, 2).toUpperCase() : 'U'}
              </div>
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Post your reply"
                  className="w-full bg-transparent border-none outline-none resize-none text-lg placeholder:text-muted-foreground min-h-[100px]"
                  disabled={isPosting}
                  maxLength={CHAR_LIMIT + 50} // Allow typing a bit over to show error
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleSubmit()
                    }
                  }}
                />

                {/* File Previews */}
                {previewUrls.length > 0 && (
                  <div className="mt-3 relative">
                    {selectedFiles[0]?.type.startsWith('video/') ? (
                      <div className="relative rounded-2xl overflow-hidden border border-border">
                        <video
                          src={previewUrls[0]}
                          controls
                          className="w-full max-h-96 object-contain bg-black"
                        />
                        <button
                          onClick={() => handleRemoveFile(0)}
                          className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
                          disabled={isPosting}
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative rounded-2xl overflow-hidden border border-border">
                        <img
                          src={previewUrls[0]}
                          alt="Preview"
                          className="w-full max-h-96 object-cover"
                        />
                        <button
                          onClick={() => handleRemoveFile(0)}
                          className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
                          disabled={isPosting}
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-1 relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(',')}
                  onChange={(e) => handleFileSelect(e, 'image')}
                  className="hidden"
                  disabled={isPosting || selectedFiles.length > 0}
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept={ACCEPTED_VIDEO_TYPES.join(',')}
                  onChange={(e) => handleFileSelect(e, 'video')}
                  className="hidden"
                  disabled={isPosting || selectedFiles.length > 0}
                />

                <button
                  className="p-2 hover:bg-primary/10 text-primary rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPosting || selectedFiles.length > 0}
                  title="Add image"
                >
                  <Image className="w-5 h-5" />
                </button>

                <button
                  className="p-2 hover:bg-primary/10 text-primary rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={isPosting || selectedFiles.length > 0}
                  title="Add video"
                >
                  <Video className="w-5 h-5" />
                </button>

                <button
                  className="p-2 hover:bg-primary/10 text-primary rounded-full transition-colors"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  disabled={isPosting}
                  title="Add emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>

                {showEmojiPicker && (
                  <div ref={emojiPickerRef} className="absolute left-0 top-12 z-50">
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      theme={Theme.AUTO}
                      width={320}
                      height={400}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                {charCount > 0 && (
                  <div className="flex items-center gap-2">
                    <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        className="stroke-muted"
                        strokeWidth="3"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        className={`transition-all ${
                          isOverLimit
                            ? 'stroke-red-500'
                            : charPercentage > 90
                            ? 'stroke-yellow-500'
                            : 'stroke-primary'
                        }`}
                        strokeWidth="3"
                        strokeDasharray={`${charPercentage} ${100 - charPercentage}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    {isOverLimit && (
                      <span className="text-red-500 text-sm font-medium">
                        -{charCount - CHAR_LIMIT}
                      </span>
                    )}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!content.trim() || !address || isPosting || isOverLimit}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isPosting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isPosting ? 'Replying...' : 'Reply'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
