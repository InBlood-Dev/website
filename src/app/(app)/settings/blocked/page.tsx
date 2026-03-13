"use client";

import { useEffect, useState } from "react";
import { get as apiGet, del } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import Header from "@/components/layout/Header";
import Avatar from "@/components/ui/Avatar";
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

      <div className="flex-1 overflow-y-auto p-5">
        {blockedUsers.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-14 h-14 rounded-full bg-white/[0.04] flex items-center justify-center mb-5">
              <Ban className="w-6 h-6 text-white/20" />
            </div>
            <h2 className="text-lg font-medium text-white mb-2 tracking-tight">
              No blocked users
            </h2>
            <p className="text-white/30 text-sm">
              Users you block will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {blockedUsers.map((block) => (
              <div
                key={block.block_id}
                className="flex items-center gap-3 p-3.5 bg-white/[0.03] rounded-xl border border-white/[0.06]"
              >
                <Avatar
                  src={block.user.primary_photo}
                  alt={block.user.name}
                  size="md"
                />
                <span className="flex-1 text-sm font-medium text-white">
                  {block.user.name}
                </span>
                <button
                  onClick={() => handleUnblock(block.block_id)}
                  className="px-4 py-2 border border-white/[0.08] text-white/50 hover:text-white hover:border-white/20 transition-all text-xs rounded-full tracking-wide"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
