"use client";

import { useEffect, useState } from "react";
import { get as apiGet } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import Avatar from "@/components/ui/Avatar";
import StoryViewer from "./StoryViewer";
import { cn } from "@/lib/utils/cn";
import { Plus } from "lucide-react";
import type { StoryUser } from "@/lib/api/types";

export default function StoryBar() {
  const [storyUsers, setStoryUsers] = useState<StoryUser[]>([]);
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await apiGet<{ stories: StoryUser[] }>(
          ENDPOINTS.STORIES.FEED
        );
        setStoryUsers(response.data.stories || []);
      } catch {
        // non-critical
      }
    })();
  }, []);

  if (storyUsers.length === 0) return null;

  return (
    <>
      <div className="flex gap-3 overflow-x-auto py-3 px-4 scrollbar-none border-b border-border">
        {/* Add story button */}
        <button className="flex flex-col items-center gap-1.5 shrink-0">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-card">
            <Plus className="w-5 h-5 text-text-muted" />
          </div>
          <span className="text-[10px] text-text-muted">Your Story</span>
        </button>

        {storyUsers.map((storyUser, index) => (
          <button
            key={storyUser.user_id}
            onClick={() => setViewingIndex(index)}
            className="flex flex-col items-center gap-1.5 shrink-0"
          >
            <div
              className={cn(
                "p-[2px] rounded-full",
                storyUser.has_unviewed
                  ? "bg-gradient-to-br from-primary to-primary-light"
                  : "bg-border"
              )}
            >
              <div className="p-[2px] bg-background rounded-full">
                <Avatar
                  src={storyUser.user_photo}
                  alt={storyUser.user_name}
                  size="lg"
                />
              </div>
            </div>
            <span className="text-[10px] text-white max-w-[64px] truncate">
              {storyUser.user_name}
            </span>
          </button>
        ))}
      </div>

      {viewingIndex !== null && (
        <StoryViewer
          storyUsers={storyUsers}
          initialIndex={viewingIndex}
          onClose={() => setViewingIndex(null)}
        />
      )}
    </>
  );
}
