import {
  ref,
  push,
  set,
  update,
  onValue,
  onChildAdded,
  off,
  query,
  orderByChild,
  limitToLast,
  get,
  DataSnapshot,
} from "firebase/database";
import { getFirebaseDatabase } from "./config";

export interface FirebaseMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: "text" | "image" | "video" | "audio" | "opening_move";
  media_url?: string;
  sent_at: number;
  delivered_at?: number;
  seen_at?: number;
  deleted_for_sender?: boolean;
  deleted_for_receiver?: boolean;
  deleted_at?: number;
  status?: "sending" | "sent" | "delivered" | "seen" | "failed";
}

export interface FirebaseLastMessage {
  content: string;
  sender_id: string;
  message_type: string;
  sent_at: number;
}

export const sendMessageToFirebase = async (
  conversationId: string,
  senderId: string,
  receiverId: string,
  content: string,
  messageType: "text" | "image" | "video" | "audio" = "text",
  mediaUrl?: string
): Promise<string> => {
  const db = getFirebaseDatabase();
  const messagesRef = ref(db, `conversations/${conversationId}/messages`);
  const newMessageRef = push(messagesRef);
  const messageId = newMessageRef.key!;

  const messageData: Partial<FirebaseMessage> = {
    id: messageId,
    conversation_id: conversationId,
    sender_id: senderId,
    receiver_id: receiverId,
    content,
    message_type: messageType,
    sent_at: Date.now(),
    ...(mediaUrl && { media_url: mediaUrl }),
  };

  await set(newMessageRef, messageData);

  const lastMessageRef = ref(
    db,
    `conversations/${conversationId}/last_message`
  );
  await set(lastMessageRef, {
    content: messageType === "text" ? content : `Sent a ${messageType}`,
    sender_id: senderId,
    message_type: messageType,
    sent_at: Date.now(),
  });

  const unreadRef = ref(db, `unread/${receiverId}/${conversationId}`);
  const snapshot = await get(unreadRef);
  const currentCount = snapshot.val() || 0;
  await set(unreadRef, currentCount + 1);

  const now = Date.now();
  const senderConvRef = ref(
    db,
    `user_conversations/${senderId}/${conversationId}/last_message_at`
  );
  const receiverConvRef = ref(
    db,
    `user_conversations/${receiverId}/${conversationId}/last_message_at`
  );
  await Promise.all([set(senderConvRef, now), set(receiverConvRef, now)]);

  return messageId;
};

export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: FirebaseMessage[]) => void,
  limit: number = 50
): (() => void) => {
  const db = getFirebaseDatabase();
  const messagesRef = query(
    ref(db, `conversations/${conversationId}/messages`),
    orderByChild("sent_at"),
    limitToLast(limit)
  );

  const listener = onValue(
    messagesRef,
    (snapshot: DataSnapshot) => {
      const messagesData = snapshot.val();
      if (!messagesData) {
        callback([]);
        return;
      }

      const messages: FirebaseMessage[] = Object.values(messagesData)
        .map((msg: unknown) => {
          const m = msg as FirebaseMessage;
          return {
            ...m,
            status: m.seen_at
              ? ("seen" as const)
              : m.delivered_at
                ? ("delivered" as const)
                : ("sent" as const),
          };
        })
        .sort((a, b) => a.sent_at - b.sent_at);

      callback(messages);
    },
    (error) => {
      console.error("[Firebase Messaging] Error:", error);
    }
  );

  return () => {
    off(messagesRef, "value", listener);
  };
};

export const markMessagesAsDelivered = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  const db = getFirebaseDatabase();
  const messagesRef = ref(db, `conversations/${conversationId}/messages`);
  const snapshot = await get(messagesRef);
  const messagesData = snapshot.val();
  if (!messagesData) return;

  const updates: Record<string, number> = {};
  const now = Date.now();

  Object.entries(messagesData).forEach(
    ([messageId, message]: [string, unknown]) => {
      const msg = message as FirebaseMessage;
      if (msg.message_type === "opening_move") return;
      if (msg.receiver_id === userId && !msg.delivered_at) {
        updates[`${messageId}/delivered_at`] = now;
      }
    }
  );

  if (Object.keys(updates).length > 0) {
    await update(messagesRef, updates);
  }
};

export const markMessagesAsSeen = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  const db = getFirebaseDatabase();
  const messagesRef = ref(db, `conversations/${conversationId}/messages`);
  const snapshot = await get(messagesRef);
  const messagesData = snapshot.val();
  if (!messagesData) return;

  const updates: Record<string, number> = {};
  const now = Date.now();

  Object.entries(messagesData).forEach(
    ([messageId, message]: [string, unknown]) => {
      const msg = message as FirebaseMessage;
      if (msg.message_type === "opening_move") return;
      if (msg.receiver_id === userId && !msg.seen_at) {
        updates[`${messageId}/seen_at`] = now;
        if (!msg.delivered_at) {
          updates[`${messageId}/delivered_at`] = now;
        }
      }
    }
  );

  if (Object.keys(updates).length > 0) {
    await update(messagesRef, updates);
    const unreadRef = ref(db, `unread/${userId}/${conversationId}`);
    await set(unreadRef, 0);
  }
};

export const subscribeToTypingIndicator = (
  conversationId: string,
  otherUserId: string,
  callback: (isTyping: boolean) => void
): (() => void) => {
  const db = getFirebaseDatabase();
  const typingRef = ref(
    db,
    `conversations/${conversationId}/typing/${otherUserId}`
  );

  const listener = onValue(typingRef, (snapshot: DataSnapshot) => {
    callback(snapshot.val() || false);
  });

  return () => {
    off(typingRef, "value", listener);
  };
};

export const setTypingIndicator = async (
  conversationId: string,
  userId: string,
  isTyping: boolean
): Promise<void> => {
  const db = getFirebaseDatabase();
  const typingRef = ref(
    db,
    `conversations/${conversationId}/typing/${userId}`
  );
  await set(typingRef, isTyping);
};

export const deleteMessageForMe = async (
  conversationId: string,
  messageId: string,
  userId: string
): Promise<void> => {
  const db = getFirebaseDatabase();
  const messageRef = ref(
    db,
    `conversations/${conversationId}/messages/${messageId}`
  );
  const snapshot = await get(messageRef);
  const message = snapshot.val() as FirebaseMessage;
  if (!message) throw new Error("Message not found");

  const deleteField =
    message.sender_id === userId
      ? "deleted_for_sender"
      : "deleted_for_receiver";

  await update(messageRef, { [deleteField]: true, deleted_at: Date.now() });
};

export const deleteMessageForEveryone = async (
  conversationId: string,
  messageId: string,
  userId: string
): Promise<void> => {
  const db = getFirebaseDatabase();
  const messageRef = ref(
    db,
    `conversations/${conversationId}/messages/${messageId}`
  );
  const snapshot = await get(messageRef);
  const message = snapshot.val() as FirebaseMessage;
  if (!message) throw new Error("Message not found");
  if (message.sender_id !== userId)
    throw new Error("Only sender can delete for everyone");
  if (Date.now() - message.sent_at > 3600000)
    throw new Error("Cannot delete message older than 1 hour");

  await update(messageRef, {
    deleted_for_sender: true,
    deleted_for_receiver: true,
    deleted_at: Date.now(),
    content: "This message was deleted",
  });
};

export const subscribeToUserConversations = (
  userId: string,
  onNewConversation: (conversationId: string, otherUserId: string) => void
): (() => void) => {
  const db = getFirebaseDatabase();
  const userConvsRef = ref(db, `user_conversations/${userId}`);

  const unsubscribe = onChildAdded(
    userConvsRef,
    (snapshot: DataSnapshot) => {
      const conversationId = snapshot.key;
      const data = snapshot.val();
      if (conversationId && data?.other_user_id) {
        onNewConversation(conversationId, data.other_user_id);
      }
    },
    (error: Error) => {
      console.error("[Firebase] User conversations error:", error);
    }
  );

  return unsubscribe;
};

export const subscribeToLastMessage = (
  conversationId: string,
  callback: (lastMessage: FirebaseLastMessage | null) => void
): (() => void) => {
  const db = getFirebaseDatabase();
  const lastMessageRef = ref(
    db,
    `conversations/${conversationId}/last_message`
  );

  const listener = onValue(lastMessageRef, (snapshot: DataSnapshot) => {
    callback(snapshot.val());
  });

  return () => {
    off(lastMessageRef, "value", listener);
  };
};

export const muteConversation = async (
  conversationId: string,
  userId: string,
  muteUntil: number | null = null
): Promise<void> => {
  const db = getFirebaseDatabase();
  const convRef = ref(
    db,
    `user_conversations/${userId}/${conversationId}`
  );
  await update(convRef, { is_muted: true, mute_until: muteUntil });
};

export const unmuteConversation = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  const db = getFirebaseDatabase();
  const convRef = ref(
    db,
    `user_conversations/${userId}/${conversationId}`
  );
  await update(convRef, { is_muted: false, mute_until: null });
};
