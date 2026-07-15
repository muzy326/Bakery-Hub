export interface ChatMessage {
  id: string;
  threadId: string; // userId of the customer
  senderRole: "customer" | "admin";
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface ChatThread {
  userId: string;
  userName: string;
  userEmail: string;
  messages: ChatMessage[];
  lastMessageAt: string;
  unreadByAdmin: number;
}

// threadId -> ChatThread
export const chatThreads = new Map<string, ChatThread>();
