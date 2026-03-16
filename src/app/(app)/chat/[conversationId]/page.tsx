"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useChatStore } from "@/stores/chat.store";
import { useMatchesStore } from "@/stores/matches.store";
import { cn } from "@/lib/utils/cn";
import { formatMessageTime } from "@/lib/utils/formatters";
import {
  subscribeToMessages,
  sendMessageToFirebase,
  markMessagesAsSeen,
  markMessagesAsDelivered,
  subscribeToTypingIndicator,
  setTypingIndicator,
  deleteMessageForMe,
  deleteMessageForEveryone,
  muteConversation,
  unmuteConversation,
  type FirebaseMessage,
} from "@/lib/firebase/messaging";
import { post } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import {
  ArrowLeft,
  Send,
  MoreVertical,
  Check,
  CheckCheck,
  MessageSquare,
  Ban,
  Flag,
  BellOff,
  BellRing,
  Trash2,
  Clock,
  Loader2,
} from "lucide-react";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;
  const { userId } = useAuthStore();
  const {
    conversations,
    setMessages,
    setTyping,
    typingStates,
    addUnsubscriber,
    removeUnsubscriber,
  } = useChatStore();
  const { matches, conversations: nonMatchedConvs, fetchMatches, fetchConversations } = useMatchesStore();

  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    message: FirebaseMessage;
  } | null>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<
    FirebaseMessage[]
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const messages = conversations.get(conversationId) || [];
  const isOtherTyping = typingStates.get(conversationId) || false;

  // Find the match/conversation for this chat (check both matched and non-matched)
  const match = matches.find((m) => m.conversation_id === conversationId);
  const nonMatchedConv = nonMatchedConvs.find(
    (c) => c.conversation_id === conversationId
  );
  const otherUser = match?.user || nonMatchedConv?.user;
  const otherUserId = otherUser?.user_id || "";

  const [firebaseError, setFirebaseError] = useState(false);

  // Ensure matches data is loaded (in case user navigates directly to chat)
  useEffect(() => {
    if (matches.length === 0) fetchMatches();
    if (nonMatchedConvs.length === 0) fetchConversations(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subscribe to messages + mark as delivered on open (matching app's ChatContext)
  useEffect(() => {
    if (!conversationId || !userId) return;

    try {
      // Mark as delivered immediately when opening conversation (app does this)
      markMessagesAsDelivered(conversationId, userId).catch(() => {});

      const unsub = subscribeToMessages(conversationId, (msgs) => {
        setMessages(conversationId, msgs);
        // Clear optimistic messages once real ones arrive
        setOptimisticMessages([]);
        markMessagesAsSeen(conversationId, userId).catch(() => {});
      });

      addUnsubscriber(`messages-${conversationId}`, unsub);

      return () => {
        removeUnsubscriber(`messages-${conversationId}`);
      };
    } catch {
      setFirebaseError(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, userId]);

  // Subscribe to typing + clean up typing indicator on unmount (matching app)
  useEffect(() => {
    if (!conversationId || !otherUserId || firebaseError) return;

    try {
      const unsub = subscribeToTypingIndicator(
        conversationId,
        otherUserId,
        (isTyping) => setTyping(conversationId, isTyping)
      );

      addUnsubscriber(`typing-${conversationId}`, unsub);

      return () => {
        removeUnsubscriber(`typing-${conversationId}`);
        // Clean up own typing indicator on unmount
        if (userId) {
          setTypingIndicator(conversationId, userId, false).catch(() => {});
        }
      };
    } catch {
      // Firebase not configured
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, otherUserId, firebaseError]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping, optimisticMessages]);

  // Close context menu on click outside
  useEffect(() => {
    if (!contextMenu) return;
    const handler = () => setContextMenu(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [contextMenu]);

  // Optimistic message sending (matching app's ChatContext pattern)
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !userId || !otherUserId || isSending) return;

    const text = inputText.trim();
    setInputText("");
    setIsSending(true);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    // Clear typing indicator
    setTypingIndicator(conversationId, userId, false).catch(() => {});

    // Create optimistic message (show immediately)
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: FirebaseMessage = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: userId,
      receiver_id: otherUserId,
      content: text,
      message_type: "text",
      sent_at: Date.now(),
      status: "sending",
    };
    setOptimisticMessages((prev) => [...prev, optimisticMsg]);

    try {
      await sendMessageToFirebase(
        conversationId,
        userId,
        otherUserId,
        text
      );

      // Push notification (fire-and-forget)
      post(ENDPOINTS.NOTIFICATIONS.MESSAGE_SENT, {
        receiver_id: otherUserId,
        conversation_id: conversationId,
        message_preview:
          text.length > 100 ? text.slice(0, 100) + "..." : text,
      }).catch(() => {});
    } catch {
      // Mark optimistic message as failed
      setOptimisticMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, status: "failed" as const } : m
        )
      );
      setInputText(text);
    } finally {
      setIsSending(false);
    }
  }, [inputText, userId, otherUserId, conversationId, isSending]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";

    if (!userId) return;

    // Set typing indicator
    setTypingIndicator(conversationId, userId, true).catch(() => {});

    // Clear after 3 seconds of no typing
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTypingIndicator(conversationId, userId, false).catch(() => {});
    }, 3000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getStatusIcon = (msg: FirebaseMessage) => {
    if (msg.sender_id !== userId) return null;
    if (msg.status === "sending")
      return <Loader2 className="w-3 h-3 text-white/30 animate-spin" />;
    if (msg.status === "failed")
      return <span className="text-[10px] text-error font-medium">Failed</span>;
    if (msg.seen_at)
      return <CheckCheck className="w-3 h-3 text-primary" />;
    if (msg.delivered_at)
      return <CheckCheck className="w-3 h-3 text-white/30" />;
    return <Check className="w-3 h-3 text-white/30" />;
  };

  // Message deletion handlers (matching app's ChatScreen)
  const handleDeleteForMe = async (msg: FirebaseMessage) => {
    setContextMenu(null);
    try {
      await deleteMessageForMe(conversationId, msg.id, userId!);
    } catch (err) {
      console.error("[Chat] Delete for me failed:", err);
    }
  };

  const handleDeleteForEveryone = async (msg: FirebaseMessage) => {
    setContextMenu(null);
    try {
      await deleteMessageForEveryone(conversationId, msg.id, userId!);
    } catch (err) {
      console.error("[Chat] Delete for everyone failed:", err);
    }
  };

  // Mute/unmute handler
  const handleToggleMute = async () => {
    setShowMenu(false);
    if (!userId) return;
    try {
      if (isMuted) {
        await unmuteConversation(conversationId, userId);
        setIsMuted(false);
      } else {
        await muteConversation(conversationId, userId);
        setIsMuted(true);
      }
    } catch (err) {
      console.error("[Chat] Mute toggle failed:", err);
    }
  };

  // Block handler (POST /blocks matching app)
  const handleBlock = async () => {
    setShowMenu(false);
    if (!otherUserId) return;
    if (!window.confirm(`Block ${otherUser?.name}? They won't be able to contact you.`)) return;
    try {
      await post(ENDPOINTS.BLOCKS.BLOCK, { blocked_user_id: otherUserId });
      router.push("/matches");
    } catch (err) {
      console.error("[Chat] Block failed:", err);
    }
  };

  // Report handler (POST /reports matching app)
  const handleReport = async () => {
    setShowMenu(false);
    if (!otherUserId) return;
    const reason = window.prompt(`Why are you reporting ${otherUser?.name}?`);
    if (!reason) return;
    try {
      await post(ENDPOINTS.REPORTS, {
        reported_user_id: otherUserId,
        reason,
        conversation_id: conversationId,
      });
      alert("Report submitted. Thank you.");
    } catch (err) {
      console.error("[Chat] Report failed:", err);
    }
  };

  // Filter deleted messages and merge with optimistic
  const filteredMessages = messages.filter((msg) => {
    if (msg.sender_id === userId && msg.deleted_for_sender) return false;
    if (msg.receiver_id === userId && msg.deleted_for_receiver) return false;
    return true;
  });

  // Remove optimistic messages that now have real counterparts
  const realIds = new Set(filteredMessages.map((m) => m.id));
  const visibleOptimistic = optimisticMessages.filter(
    (m) => !realIds.has(m.id) && m.status !== undefined
  );
  const allVisibleMessages = [...filteredMessages, ...visibleOptimistic];

  // Determine if timestamp should show (sender change or 5-min gap)
  const shouldShowTimestamp = (index: number) => {
    if (index === 0) return true;
    const current = allVisibleMessages[index];
    const prev = allVisibleMessages[index - 1];
    if (prev.sender_id !== current.sender_id) return true;
    const currentTime = current.sent_at
      ? new Date(current.sent_at).getTime()
      : 0;
    const prevTime = prev.sent_at ? new Date(prev.sent_at).getTime() : 0;
    return currentTime - prevTime > 300000; // 5 minutes
  };

  // Check if message can be deleted for everyone (within 1 hour, only sender)
  const canDeleteForEveryone = (msg: FirebaseMessage) => {
    if (msg.sender_id !== userId) return false;
    return Date.now() - msg.sent_at < 3600000; // 1 hour
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* ─── Header (matching mobile ChatScreen) ─── */}
      <div className="flex items-center gap-2 px-4 py-3 bg-card border-b border-white/[0.06] shrink-0">
        {/* Back button */}
        <button
          onClick={() => router.push("/matches")}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/[0.06] text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Profile info (clickable) */}
        {otherUser && (
          <button
            onClick={() => router.push(`/profile/${otherUser.user_id}`)}
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            <div className="w-11 h-11 rounded-full overflow-hidden bg-card shrink-0">
              {otherUser.primary_photo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={otherUser.primary_photo}
                  alt={otherUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30 text-lg font-bold">
                  {otherUser.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="text-left min-w-0">
              <p className="font-semibold text-white text-base truncate leading-tight">
                {otherUser.name}
              </p>
              {isOtherTyping ? (
                <p className="text-xs text-primary font-medium">typing...</p>
              ) : otherUser.is_online ? (
                <p className="text-xs text-success">Online</p>
              ) : (
                <p className="text-xs text-white/25">Offline</p>
              )}
            </div>
          </button>
        )}

        {/* Menu button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/[0.06] text-white transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-12 z-50 w-56 bg-card rounded-xl border border-white/[0.08] shadow-2xl overflow-hidden">
                <button
                  onClick={handleToggleMute}
                  className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-white/[0.04] transition-colors text-left"
                >
                  {isMuted ? (
                    <>
                      <BellRing className="w-5 h-5 text-white" />
                      <span className="text-sm font-medium text-white">Unmute Notifications</span>
                    </>
                  ) : (
                    <>
                      <BellOff className="w-5 h-5 text-white" />
                      <span className="text-sm font-medium text-white">Mute Notifications</span>
                    </>
                  )}
                </button>
                <div className="h-px bg-white/[0.06]" />
                <button
                  onClick={handleBlock}
                  className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-white/[0.04] transition-colors text-left"
                >
                  <Ban className="w-5 h-5 text-error" />
                  <span className="text-sm font-medium text-error">Block User</span>
                </button>
                <div className="h-px bg-white/[0.06]" />
                <button
                  onClick={handleReport}
                  className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-white/[0.04] transition-colors text-left"
                >
                  <Flag className="w-5 h-5 text-warning" />
                  <span className="text-sm font-medium text-warning">Report User</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── Messages ─── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Firebase error state */}
        {firebaseError && filteredMessages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-card flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-white/15" />
            </div>
            <p className="text-white/30 text-sm">
              Chat is not available right now
            </p>
            <p className="text-white/15 text-xs mt-1">
              Firebase configuration is missing
            </p>
          </div>
        )}

        {/* Empty state */}
        {!firebaseError && allVisibleMessages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-card flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-white/15" />
            </div>
            <p className="text-white/40 text-sm text-center leading-relaxed">
              Say hello to {otherUser?.name || "them"}!
              <br />
              Start a conversation and get to know each other.
            </p>
          </div>
        )}

        {/* Messages list */}
        <div className="space-y-1">
          {allVisibleMessages.map((msg, index) => {
            const isMe = msg.sender_id === userId;
            const showTime = shouldShowTimestamp(index);
            const isDeleted = msg.deleted_for_sender || msg.deleted_for_receiver;
            const isOptimistic = msg.id.startsWith("temp-");

            return (
              <div
                key={msg.id}
                className={cn("my-1", isMe ? "max-w-[80%] ml-auto" : "max-w-[80%]")}
                onContextMenu={(e) => {
                  if (isOptimistic || isDeleted) return;
                  e.preventDefault();
                  setContextMenu({ x: e.clientX, y: e.clientY, message: msg });
                }}
              >
                {/* Opening move card */}
                {msg.message_type === "opening_move" && (
                  <OpeningMoveCard msg={msg} isMe={isMe} inputRef={inputRef} />
                )}

                {/* Regular message bubble */}
                {msg.message_type !== "opening_move" && (
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5",
                      isMe
                        ? "bg-primary text-white rounded-br-sm"
                        : "bg-card text-white rounded-bl-sm",
                      isDeleted && "opacity-60",
                      isOptimistic && "opacity-70"
                    )}
                  >
                    {/* Media */}
                    {msg.media_url && !isDeleted && (
                      <div className="mb-2 rounded-xl overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={msg.media_url}
                          alt="Media"
                          className="max-w-[200px] rounded-xl"
                        />
                      </div>
                    )}

                    {/* Text */}
                    <p
                      className={cn(
                        "text-[15px] leading-5 whitespace-pre-wrap",
                        isDeleted && "italic text-white/40"
                      )}
                    >
                      {isDeleted ? "This message was deleted" : msg.content}
                    </p>
                  </div>
                )}

                {/* Timestamp + status */}
                {showTime && (
                  <div
                    className={cn(
                      "flex items-center gap-1 mt-1 px-1",
                      isMe ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <span className="text-[11px] text-white/25">
                      {formatMessageTime(msg.sent_at)}
                    </span>
                    {isMe && getStatusIcon(msg)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Typing indicator */}
        {isOtherTyping && (
          <div className="my-2 max-w-[80%]">
            <div className="bg-card rounded-2xl rounded-bl-sm px-5 py-3.5 inline-block">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-white/25 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce [animation-delay:0.1s]" />
                <div className="w-2 h-2 rounded-full bg-white/55 animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
            <p className="text-[11px] text-white/25 mt-1 px-1">
              {otherUser?.name} is typing...
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ─── Message Context Menu (right-click) ─── */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 w-52 bg-card rounded-xl border border-white/[0.08] shadow-2xl overflow-hidden"
            style={{
              left: Math.min(contextMenu.x, window.innerWidth - 220),
              top: Math.min(contextMenu.y, window.innerHeight - 150),
            }}
          >
            {/* Delete for me (always available) */}
            <button
              onClick={() => handleDeleteForMe(contextMenu.message)}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/[0.04] transition-colors text-left"
            >
              <Trash2 className="w-4 h-4 text-white/60" />
              <span className="text-sm text-white">Delete for me</span>
            </button>

            {/* Delete for everyone (only sender, within 1 hour) */}
            {canDeleteForEveryone(contextMenu.message) && (
              <>
                <div className="h-px bg-white/[0.06]" />
                <button
                  onClick={() => handleDeleteForEveryone(contextMenu.message)}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/[0.04] transition-colors text-left"
                >
                  <Trash2 className="w-4 h-4 text-error" />
                  <div>
                    <span className="text-sm text-error">Delete for everyone</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-white/20" />
                      <span className="text-[10px] text-white/20">
                        {Math.max(
                          0,
                          Math.floor(
                            (3600000 -
                              (Date.now() - contextMenu.message.sent_at)) /
                              60000
                          )
                        )}{" "}
                        min left
                      </span>
                    </div>
                  </div>
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* ─── Input (matching mobile ChatScreen) ─── */}
      <div className="px-4 pt-2 pb-4 md:pb-4 bg-card border-t border-white/[0.06] shrink-0">
        <div className="flex items-end gap-2">
          {/* Text input */}
          <div className="flex-1 bg-background rounded-2xl px-4 py-1 min-h-[44px] max-h-[120px] flex items-end">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              maxLength={1000}
              rows={1}
              className="flex-1 bg-transparent text-white text-[15px] placeholder:text-white/25 focus:outline-none resize-none py-2.5 leading-5"
              style={{ minHeight: "20px", maxHeight: "100px" }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isSending}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all",
              inputText.trim()
                ? "bg-primary text-white"
                : "bg-card text-white/25"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Opening Move Card ────────────────────────────────────────────

function OpeningMoveCard({
  msg,
  isMe,
  inputRef,
}: {
  msg: FirebaseMessage;
  isMe: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  // Parse opening move content (app's ChatContext parses JSON)
  let question = msg.opening_move_question;
  let answer = msg.opening_move_answer;

  if (!question && !answer) {
    try {
      const parsed = JSON.parse(msg.content);
      question = parsed.question;
      answer = parsed.answer;
    } catch {
      // Fall back to plain content
    }
  }

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden mb-1",
        isMe ? "bg-card opacity-60 p-4" : "bg-card flex"
      )}
    >
      {!isMe && <div className="w-1 bg-primary shrink-0" />}
      <div className={cn(!isMe && "p-4 flex-1")}>
        {isMe && (
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1">
            Your opening move
          </p>
        )}
        {question && (
          <p className="text-sm font-medium text-white/50 italic mb-1">
            {question}
          </p>
        )}
        {answer && (
          <p className="text-sm text-white leading-relaxed">{answer}</p>
        )}
        {!isMe && (
          <button
            onClick={() => inputRef.current?.focus()}
            className="inline-flex items-center gap-1.5 mt-2 px-4 py-1.5 bg-primary rounded-full text-sm font-semibold text-white"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Reply
          </button>
        )}
      </div>
    </div>
  );
}
