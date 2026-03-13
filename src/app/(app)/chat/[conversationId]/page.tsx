"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useChatStore } from "@/stores/chat.store";
import { useMatchesStore } from "@/stores/matches.store";
import Avatar from "@/components/ui/Avatar";
import { cn } from "@/lib/utils/cn";
import { formatMessageTime } from "@/lib/utils/formatters";
import {
  subscribeToMessages,
  sendMessageToFirebase,
  markMessagesAsSeen,
  subscribeToTypingIndicator,
  setTypingIndicator,
  type FirebaseMessage,
} from "@/lib/firebase/messaging";
import {
  ArrowLeft,
  Send,
  Image as ImageIcon,
  MoreVertical,
  Check,
  CheckCheck,
} from "lucide-react";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;
  const { userId } = useAuthStore();
  const { conversations, setMessages, setTyping, typingStates, addUnsubscriber, removeUnsubscriber } = useChatStore();
  const { matches } = useMatchesStore();

  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const messages = conversations.get(conversationId) || [];
  const isOtherTyping = typingStates.get(conversationId) || false;

  // Find the match for this conversation
  const match = matches.find((m) => m.conversation_id === conversationId);
  const otherUser = match?.user;
  const otherUserId = otherUser?.user_id || "";

  // Subscribe to messages
  useEffect(() => {
    if (!conversationId || !userId) return;

    const unsub = subscribeToMessages(conversationId, (msgs) => {
      setMessages(conversationId, msgs);
      markMessagesAsSeen(conversationId, userId).catch(() => {});
    });

    addUnsubscriber(`messages-${conversationId}`, unsub);

    return () => {
      removeUnsubscriber(`messages-${conversationId}`);
    };
  }, [conversationId, userId]);

  // Subscribe to typing
  useEffect(() => {
    if (!conversationId || !otherUserId) return;

    const unsub = subscribeToTypingIndicator(
      conversationId,
      otherUserId,
      (isTyping) => setTyping(conversationId, isTyping)
    );

    addUnsubscriber(`typing-${conversationId}`, unsub);

    return () => {
      removeUnsubscriber(`typing-${conversationId}`);
    };
  }, [conversationId, otherUserId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !userId || !otherUserId || isSending) return;

    const text = inputText.trim();
    setInputText("");
    setIsSending(true);

    // Clear typing indicator
    setTypingIndicator(conversationId, userId, false).catch(() => {});

    try {
      await sendMessageToFirebase(
        conversationId,
        userId,
        otherUserId,
        text
      );
    } catch {
      setInputText(text); // restore on error
    } finally {
      setIsSending(false);
    }
  }, [inputText, userId, otherUserId, conversationId, isSending]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

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
    if (msg.seen_at) return <CheckCheck className="w-3.5 h-3.5 text-info" />;
    if (msg.delivered_at) return <CheckCheck className="w-3.5 h-3.5 text-white/30" />;
    return <Check className="w-3.5 h-3.5 text-white/30" />;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat header */}
      <div className="flex items-center gap-3 h-14 px-4 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl shrink-0">
        <button
          onClick={() => router.push("/matches")}
          className="md:hidden p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {otherUser && (
          <button
            onClick={() => router.push(`/profile/${otherUser.user_id}`)}
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            <Avatar
              src={otherUser.primary_photo}
              alt={otherUser.name}
              size="sm"
              isOnline={otherUser.is_online}
            />
            <div className="text-left min-w-0">
              <p className="font-medium text-white text-sm truncate">
                {otherUser.name}
              </p>
              {isOtherTyping ? (
                <p className="text-xs text-primary">typing...</p>
              ) : otherUser.is_online ? (
                <p className="text-xs text-success">Online</p>
              ) : null}
            </div>
          </button>
        )}

        <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
        {messages
          .filter((msg) => {
            if (msg.sender_id === userId && msg.deleted_for_sender) return false;
            if (msg.receiver_id === userId && msg.deleted_for_receiver)
              return false;
            return true;
          })
          .map((msg) => {
            const isMe = msg.sender_id === userId;
            return (
              <div
                key={msg.id}
                className={cn("flex", isMe ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5",
                    isMe
                      ? "bg-primary text-white rounded-br-md"
                      : "bg-white/[0.06] text-white rounded-bl-md"
                  )}
                >
                  {msg.message_type === "opening_move" && (
                    <p className="text-[10px] text-white/50 mb-1 uppercase tracking-wider">
                      Opening Move
                    </p>
                  )}

                  {msg.media_url && (
                    <div className="mb-2 rounded-xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={msg.media_url}
                        alt="Media"
                        className="max-w-full rounded-xl"
                      />
                    </div>
                  )}

                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>

                  <div
                    className={cn(
                      "flex items-center gap-1 mt-1",
                      isMe ? "justify-end" : "justify-start"
                    )}
                  >
                    <span className="text-[10px] opacity-50">
                      {formatMessageTime(msg.sent_at)}
                    </span>
                    {getStatusIcon(msg)}
                  </div>
                </div>
              </div>
            );
          })}

        {/* Typing indicator */}
        {isOtherTyping && (
          <div className="flex justify-start">
            <div className="bg-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce [animation-delay:0.1s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/[0.06] bg-background/80 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors">
            <ImageIcon className="w-5 h-5" />
          </button>

          <input
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-full px-4 py-2.5 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-primary/50 transition-colors"
          />

          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isSending}
            className={cn(
              "p-2.5 rounded-full transition-all",
              inputText.trim()
                ? "bg-primary text-white hover:bg-primary-dark"
                : "bg-white/[0.04] text-white/20"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
