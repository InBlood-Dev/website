"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { postFormData } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { X, ImagePlus, Send, Loader2 } from "lucide-react";
import { posthog } from "@/lib/analytics/posthog";

interface StoryUploadModalProps {
  onClose: () => void;
  onUploaded: () => void;
}

export default function StoryUploadModal({
  onClose,
  onUploaded,
}: StoryUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (!selected) return;

      // Validate file type
      const isImage = selected.type.startsWith("image/");
      const isVideo = selected.type.startsWith("video/");
      if (!isImage && !isVideo) {
        setError("Please select an image or video file");
        return;
      }

      // Validate file size (50MB max)
      if (selected.size > 50 * 1024 * 1024) {
        setError("File size must be under 50MB");
        return;
      }

      setFile(selected);
      setError(null);
      const url = URL.createObjectURL(selected);
      setPreview(url);
    },
    []
  );

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("media", file);
      if (caption.trim()) {
        formData.append("caption", caption.trim());
      }
      formData.append(
        "media_type",
        file.type.startsWith("video/") ? "video" : "photo"
      );

      await postFormData(ENDPOINTS.STORIES.CREATE, formData);
      posthog?.capture("story_created", {
        media_type: file.type.startsWith("video/") ? "video" : "photo",
      });
      onUploaded();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload story"
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      <div className="relative w-full max-w-md mx-4 bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-base font-medium text-white">Add Story</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.1] flex items-center justify-center"
          >
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {!preview ? (
            /* File picker */
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[9/14] rounded-xl border-2 border-dashed border-white/[0.1] bg-white/[0.02] flex flex-col items-center justify-center gap-3 hover:border-white/[0.2] hover:bg-white/[0.04] transition-all"
            >
              <ImagePlus className="w-10 h-10 text-white/20" />
              <div className="text-center">
                <p className="text-sm text-white/40">
                  Tap to select photo or video
                </p>
                <p className="text-xs text-white/20 mt-1">
                  Max 50MB
                </p>
              </div>
            </button>
          ) : (
            /* Preview */
            <div className="relative w-full aspect-[9/14] rounded-xl overflow-hidden bg-black">
              {file?.type.startsWith("video/") ? (
                <video
                  src={preview}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <Image
                  src={preview}
                  alt="Story preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}

              {/* Change file button */}
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setError(null);
                }}
                className="absolute top-3 right-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-xs text-white/80 hover:bg-black/80 transition-colors"
              >
                Change
              </button>

              {/* Caption overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10">
                <input
                  type="text"
                  placeholder="Add a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={200}
                  className="w-full bg-white/[0.1] backdrop-blur-sm text-sm text-white placeholder:text-white/40 px-4 py-2.5 rounded-full outline-none border border-white/[0.1] focus:border-white/[0.2]"
                />
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {error && (
            <p className="text-xs text-red-400 mt-3 text-center">{error}</p>
          )}

          {/* Upload button */}
          {preview && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full mt-4 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Share Story
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
