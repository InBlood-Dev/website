"use client";

import { useEffect, useState } from "react";
import { get as apiGet, del } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import Header from "@/components/layout/Header";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { useUIStore } from "@/stores/ui.store";
import { Ban } from "lucide-react";

interface BlockedUser {
  block_id: string;
  user: {
    user_id: string;
    name: string;
    primary_photo: string;
  };
  blocked_at: string;
}

export default function BlockedUsersPage() {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const addToast = useUIStore((s) => s.addToast);

  useEffect(() => {
    (async () => {
      try {
        const response = await apiGet<{ blocks: BlockedUser[] }>(
          ENDPOINTS.BLOCKS.LIST
        );
        setBlockedUsers(response.data.blocks || []);
      } catch {
        // handle
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleUnblock = async (blockId: string) => {
    try {
      await del(ENDPOINTS.BLOCKS.UNBLOCK(blockId));
      setBlockedUsers((prev) => prev.filter((b) => b.block_id !== blockId));
      addToast({ message: "User unblocked", type: "success" });
    } catch {
      addToast({ message: "Failed to unblock", type: "error" });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Header title="Blocked Users" />

      <div className="flex-1 overflow-y-auto p-4">
        {blockedUsers.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Ban className="w-16 h-16 text-text-muted mb-4" />
            <h2 className="text-lg font-bold text-white mb-1">
              No blocked users
            </h2>
            <p className="text-text-secondary text-sm">
              Users you block will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {blockedUsers.map((block) => (
              <div
                key={block.block_id}
                className="flex items-center gap-3 p-3 bg-card rounded-xl"
              >
                <Avatar
                  src={block.user.primary_photo}
                  alt={block.user.name}
                  size="md"
                />
                <span className="flex-1 text-sm font-medium text-white">
                  {block.user.name}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUnblock(block.block_id)}
                >
                  Unblock
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
