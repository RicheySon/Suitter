import { useEffect, useState, useRef } from "react";
import { X, Image, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useWalrusUpload } from "../hooks/useWalrusUpload";
import { useProfile } from "../hooks/useProfile";
import { useCurrentAccount } from "@mysten/dapp-kit";

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function CreateProfileModal({
  isOpen,
  onClose,
  onCreated,
}: CreateProfileModalProps) {
  const { createProfile } = useProfile();
  const { uploadImage, isUploading, error: uploadError } = useWalrusUpload();
  const account = useCurrentAccount();
  const address = account?.address;

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [pfpFile, setPfpFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setUsername("");
      setBio("");
      setPfpFile(null);
      setPreviewUrl(null);
      setError(null);
    }
  }, [isOpen, previewUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    setError(null);
    setPfpFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!address) {
      setError("Connect wallet first");
      return;
    }
    if (!username.trim()) {
      setError("Username required");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      let pfpUrl = "";
      if (pfpFile) {
        const { url } = await uploadImage(pfpFile);
        pfpUrl = url;
      }
      await createProfile(username.trim(), bio.trim(), pfpUrl);
      if (onCreated) onCreated();
      onClose();
    } catch (e: any) {
      setError(e?.message || "Failed to create profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center pt-12 bg-black/40 backdrop-blur-sm p-4"
        onClick={() => !isSubmitting && !isUploading && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-background border border-border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <button
              onClick={onClose}
              disabled={isSubmitting || isUploading}
              className="p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <span className="text-sm font-semibold">
              Create On-chain Profile
            </span>
            <div className="w-8" />
          </div>

          <div className="p-4 flex flex-col gap-4">
            <div className="flex gap-4 items-start">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="pfp"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">👤</span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 text-sm rounded-full border border-border hover:bg-muted flex items-center gap-2"
                disabled={isSubmitting || isUploading}
              >
                <Image size={18} />
                {previewUrl ? "Change Image" : "Upload Image"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. gabby"
                className="px-3 py-2 rounded-lg bg-muted focus:outline-none text-sm"
                disabled={isSubmitting || isUploading}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the world what you're building"
                rows={4}
                className="px-3 py-2 rounded-lg bg-muted focus:outline-none text-sm resize-none"
                disabled={isSubmitting || isUploading}
              />
            </div>
            {(error || uploadError) && (
              <div className="px-3 py-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-600 dark:text-red-400">
                {error || uploadError}
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-border flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting || isUploading}
              className="px-4 py-2 rounded-full border border-border hover:bg-muted text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isUploading || !username.trim()}
              className="px-5 py-2 rounded-full bg-foreground text-background font-semibold text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {(isSubmitting || isUploading) && (
                <Loader2 size={16} className="animate-spin" />
              )}
              {isSubmitting || isUploading ? "Creating" : "Create Profile"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
