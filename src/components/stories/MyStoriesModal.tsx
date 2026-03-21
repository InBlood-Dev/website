"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { get as apiGet, del as apiDel } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { X, Trash2, Eye, Loader2, Plus } from "lucide-react";
import { formatLastActive } from "@/lib/utils/formatters";
import type { Story } from "@/lib/api/types";

interface MyStoriesModalProps {
  onClose: () => void;
  onAddNew: () => void;
}

export default function MyStoriesModal({
  onClose,
  onAddNew,
}: MyStoriesModalProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMyStories = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await apiGet<any>(ENDPOINTS.STORIES.MY_STORIES);
      setStories(res.data?.stories || res.data || []);
    } catch {
      // non-critical
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyStories();
  }, []);

  const handleDelete = async (storyId: string) => {
    setDeletingId(storyId);
    try {
      await apiDel(ENDPOINTS.STORIES.DELETE(storyId));
      setStories((prev) => prev.filter((s) => s.story_id !== storyId));
    } catch {
      // failed to delete
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] rounded-t-3xl md:rounded-2xl p-5 pb-24 md:pb-5 md:mx-4 animate-in slide-in-from-bottom md:fade-in md:zoom-in-95 duration-300 max-h-[80vh] flex flex-col">
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-white/[0.15] mx-auto mb-4 md:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-medium text-white">My Stories</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onAddNew();
              }}
              className="px-3 py-1.5 bg-primary/20 text-primary text-xs font-medium rounded-full hover:bg-primary/30 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/[0.1] flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>
        </div>

        {/* Stories list */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/30 text-sm">No active stories</p>
              <p className="text-white/15 text-xs mt-1">
                Share a photo or video to your story
              </p>
            </div>
          ) : (
            stories.map((story) => (
              <div
                key={story.story_id}
                className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]"
              >
                {/* Thumbnail */}
                <div className="w-14 h-20 rounded-lg overflow-hidden bg-white/[0.04] shrink-0 relative">
                  {story.media_type === "video" ? (
                    <video
                      src={story.media_url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <Image
                      src={story.thumbnail_url || story.media_url}
                      alt="Story"
                      fill
                      className="object-cover"
                      sizes="56px"
                      unoptimized
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {story.caption && (
                    <p className="text-sm text-white/70 truncate">
                      {story.caption}
                    </p>
                  )}
                  <p className="text-xs text-white/30 mt-1">
                    {formatLastActive(story.created_at)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Eye className="w-3 h-3 text-white/20" />
                    <span className="text-xs text-white/20">
                      {story.view_count} views
                    </span>
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(story.story_id)}
                  disabled={deletingId === story.story_id}
                  className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-red-500/20 transition-colors group"
                >
                  {deletingId === story.story_id ? (
                    <Loader2 className="w-4 h-4 text-white/30 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-white/30 group-hover:text-red-400" />
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
