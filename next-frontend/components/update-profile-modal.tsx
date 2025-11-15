import { useState, useEffect } from "react";
import { X, Loader2, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile } from "../hooks/useProfile";
import { useWalrusUpload } from "../hooks/useWalrusUpload";

interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  currentProfile: {
    profileId: string;
    username: string;
    bio: string;
    pfpUrl: string;
  };
}

export function UpdateProfileModal({
  isOpen,
  onClose,
  onUpdated,
  currentProfile,
}: UpdateProfileModalProps) {
  const { updateProfile, isLoading } = useProfile();
  const { uploadImage, isUploading } = useWalrusUpload();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [pfpUrl, setPfpUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && currentProfile) {
      setUsername(currentProfile.username || "");
      setBio(currentProfile.bio || "");
      setPfpUrl(currentProfile.pfpUrl || "");
      setPreviewUrl(currentProfile.pfpUrl || "");
      setError("");
    }
  }, [isOpen, currentProfile]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  };

  const handleUpdate = async () => {
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    setError("");
    try {
      let finalPfpUrl = pfpUrl;

      // Upload new profile picture if selected
      if (selectedFile) {
        try {
          const { url } = await uploadImage(selectedFile);
          finalPfpUrl = url;
        } catch (uploadError: any) {
          console.error("Failed to upload profile picture:", uploadError);
          setError("Failed to upload profile picture");
          return;
        }
      }

      await updateProfile(currentProfile.profileId, username, bio, finalPfpUrl);
      onUpdated();
      onClose();
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setError(err?.message || "Failed to update profile");
    }
  };

  const handleClose = () => {
    if (!isLoading && !isUploading) {
      if (previewUrl && previewUrl !== currentProfile.pfpUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setUsername("");
      setBio("");
      setPfpUrl("");
      setSelectedFile(null);
      setPreviewUrl("");
      setError("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-background border border-border rounded-2xl w-full max-w-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <button
              onClick={handleClose}
              disabled={isLoading || isUploading}
              className="p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <span className="text-sm font-semibold text-foreground">
              Edit Profile
            </span>
            <div className="w-9" />
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Profile Picture */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">👤</span>
                  )}
                </div>
                <label
                  htmlFor="pfp-upload"
                  className="absolute bottom-0 right-0 p-2 bg-foreground text-background rounded-full cursor-pointer hover:bg-foreground/90 transition-colors"
                >
                  <Upload size={16} />
                </label>
                <input
                  id="pfp-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isLoading || isUploading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Click to upload profile picture (max 5MB)
              </p>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading || isUploading}
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                disabled={isLoading || isUploading}
              />
            </div>

            {error && (
              <div className="px-3 py-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-6 py-4 flex justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={isLoading || isUploading}
              className="px-4 py-2 border border-border rounded-full hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={!username.trim() || isLoading || isUploading}
              className="px-6 py-2 bg-foreground text-background hover:bg-foreground/90 font-semibold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px] justify-center"
            >
              {isLoading || isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {isUploading ? "Uploading" : "Saving"}
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
