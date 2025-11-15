



import { useState, useRef, useEffect } from 'react'
import { X, Image, Smile, Loader2, Video, XCircle } from 'lucide-react'
import { useSui } from './sui-context'
import { motion, AnimatePresence } from 'framer-motion'
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react'

interface ComposeModalProps {
  isOpen: boolean
  onClose: () => void
}

const CHAR_LIMIT = 280
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

export function ComposeModal({ isOpen, onClose }: ComposeModalProps) {
  const { address } = useSui()
  const [content, setContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [error, setError] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
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

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji
    const newContent = content.slice(0, cursorPosition) + emoji + content.slice(cursorPosition)
    setContent(newContent)
    setCursorPosition(cursorPosition + emoji.length)
    setShowEmojiPicker(false)
    
    // Focus back on textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(cursorPosition + emoji.length, cursorPosition + emoji.length)
      }
    }, 0)
  }

  const handlePost = async () => {
    if (!content.trim() || content.length > CHAR_LIMIT) return
    if (!address) {
      setError('Please connect your wallet first')
      return
    }

    setIsPosting(true)
    setError('')
    try {
      // TODO: Implement actual Sui transaction
      // Upload files to IPFS or decentralized storage first
      let fileUrls: string[] = []
      if (selectedFiles.length > 0) {
        // Simulate file upload
        console.log('Uploading files:', selectedFiles)
        fileUrls = selectedFiles.map(file => URL.createObjectURL(file))
      }

      // This will create a post on the Sui blockchain
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Posted on Sui blockchain:', { 
        content, 
        address,
        files: fileUrls
      })
      
      // Cleanup
      previewUrls.forEach(url => URL.revokeObjectURL(url))
      setContent('')
      setSelectedFiles([])
      setPreviewUrls([])
      onClose()
    } catch (error) {
      console.error('Failed to post:', error)
      setError('Failed to post. Please try again.')
    } finally {
      setIsPosting(false)
    }
  }

  const handleClose = () => {
    if (!isPosting) {
      previewUrls.forEach(url => URL.revokeObjectURL(url))
      setContent('')
      setError('')
      setShowEmojiPicker(false)
      setSelectedFiles([])
      setPreviewUrls([])
      onClose()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    setCursorPosition(e.target.selectionStart)
    setError('')
  }

  const handleTextareaClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)
  }

  if (!isOpen) return null

  const charCount = content.length
  const charPercentage = (charCount / CHAR_LIMIT) * 100
  const isOverLimit = charCount > CHAR_LIMIT
  const isNearLimit = charCount > CHAR_LIMIT * 0.9

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-12 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-background border border-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-visible relative"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <button
              onClick={handleClose}
              disabled={isPosting}
              className="p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <span className="text-sm font-semibold text-foreground">Create Post</span>
            <div className="w-9" />
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                {address ? address.slice(0, 2).toUpperCase() : '?'}
              </div>
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  autoFocus
                  value={content}
                  onChange={handleTextareaChange}
                  onClick={handleTextareaClick}
                  onKeyUp={(e) => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
                  placeholder="What's happening?"
                  className="w-full text-xl bg-transparent text-foreground placeholder-muted-foreground focus:outline-none resize-none min-h-[120px]"
                  disabled={isPosting}
                />
              </div>
            </div>

            {error && (
              <div className="mt-3 px-3 py-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Media Preview */}
            {previewUrls.length > 0 && (
              <div className="mt-3 relative">
                {selectedFiles[0]?.type.startsWith('image/') ? (
                  <div className="relative rounded-2xl overflow-hidden border border-border">
                    <img 
                      src={previewUrls[0]} 
                      alt="Upload preview" 
                      className="w-full max-h-[400px] object-cover"
                    />
                    <button
                      onClick={() => handleRemoveFile(0)}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black/90 rounded-full transition-colors"
                      aria-label="Remove image"
                    >
                      <XCircle size={20} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-border bg-black">
                    <video 
                      src={previewUrls[0]} 
                      controls 
                      className="w-full max-h-[400px]"
                    />
                    <button
                      onClick={() => handleRemoveFile(0)}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black/90 rounded-full transition-colors"
                      aria-label="Remove video"
                    >
                      <XCircle size={20} className="text-white" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            onChange={(e) => handleFileSelect(e, 'image')}
            className="hidden"
          />
          <input
            ref={videoInputRef}
            type="file"
            accept={ACCEPTED_VIDEO_TYPES.join(',')}
            onChange={(e) => handleFileSelect(e, 'video')}
            className="hidden"
          />

          {/* Footer */}
          <div className="border-t border-border px-4 py-3 flex justify-between items-center relative">
            <div className="flex gap-1">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-full transition-colors disabled:opacity-50" 
                aria-label="Add image"
                disabled={isPosting || selectedFiles.length > 0}
              >
                <Image size={20} />
              </button>
              <button 
                onClick={() => videoInputRef.current?.click()}
                className="p-2.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-full transition-colors disabled:opacity-50" 
                aria-label="Add video"
                disabled={isPosting || selectedFiles.length > 0}
              >
                <Video size={20} />
              </button>
              <div className="relative" ref={emojiPickerRef}>
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-2.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-full transition-colors disabled:opacity-50 ${
                    showEmojiPicker ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                  }`}
                  aria-label="Add emoji"
                  disabled={isPosting}
                >
                  <Smile size={20} />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 mb-2 z-[60] shadow-2xl">
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      theme={Theme.AUTO}
                      width={350}
                      height={450}
                      searchPlaceHolder="Search emoji..."
                      previewConfig={{
                        showPreview: false
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {charCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8">
                    <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted" />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.5"
                        fill="none"
                        strokeWidth="2"
                        strokeDasharray={`${Math.min(charPercentage, 100) * 0.974} 100`}
                        strokeLinecap="round"
                        className={`transition-all duration-200 ${
                          isOverLimit ? 'stroke-red-500' : isNearLimit ? 'stroke-yellow-500' : 'stroke-blue-500'
                        }`}
                      />
                    </svg>
                  </div>
                  {isNearLimit && (
                    <span className={`text-xs font-medium ${isOverLimit ? 'text-red-500' : 'text-yellow-600 dark:text-yellow-500'}`}>
                      {isOverLimit ? `+${charCount - CHAR_LIMIT}` : CHAR_LIMIT - charCount}
                    </span>
                  )}
                </div>
              )}
              <button
                onClick={handlePost}
                disabled={!content.trim() || isOverLimit || isPosting || !address}
                className="px-6 py-2 bg-foreground text-background hover:bg-foreground/90 font-semibold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px] justify-center"
              >
                {isPosting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Posting
                  </>
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}