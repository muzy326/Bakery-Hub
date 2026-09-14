import { Router, type IRouter } from "express";
import { z } from "zod";
import { chatThreads, type ChatMessage, type ChatThread } from "../data/chat.js";
import { users } from "../data/users.js";

const router: IRouter = Router();

const MessageSchema = z.object({ text: z.string().min(1).max(2000) });

// Require auth middleware
function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

function requireAdmin(req: any, res: any, next: any) {
  const userId = req.session?.userId;
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const user = users.get(userId);
  if (!user || user.role !== "admin") { res.status(403).json({ error: "Forbidden" }); return; }
  next();
}

// GET /api/chat/thread — customer gets their own thread
router.get("/chat/thread", requireAuth, (req, res) => {
  const userId = req.session!.userId!;
  const thread = chatThreads.get(userId);
  res.json({ messages: thread?.messages ?? [], threadId: userId });
});

// POST /api/chat/thread — customer sends message
router.post("/chat/thread", requireAuth, (req, res) => {
  const parsed = MessageSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid message" }); return; }

  const userId = req.session!.userId!;
  const user = users.get(userId);
  if (!user) { res.status(401).json({ error: "Not found" }); return; }

  let thread = chatThreads.get(userId);
  if (!thread) {
    thread = {
      userId,
      userName: user.name,
      userEmail: user.email,
      messages: [],
      lastMessageAt: new Date().toISOString(),
      unreadByAdmin: 0,
    };
    chatThreads.set(userId, thread);
  }

  const msg: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    threadId: userId,
    senderRole: "customer",
    senderId: userId,
    senderName: user.name,
    text: parsed.data.text,
    createdAt: new Date().toISOString(),
  };

  thread.messages.push(msg);
  thread.lastMessageAt = msg.createdAt;
  thread.unreadByAdmin += 1;

  res.status(201).json({ message: msg });
});

// --- Admin ---

// GET /api/chat/admin/threads — all threads summary
router.get("/chat/admin/threads", requireAdmin, (_req, res) => {
  const threads = [...chatThreads.values()].map((t) => ({
    userId: t.userId,
    userName: t.userName,
    userEmail: t.userEmail,
    lastMessageAt: t.lastMessageAt,
    unreadByAdmin: t.unreadByAdmin,
    lastMessage: t.messages[t.messages.length - 1]?.text ?? "",
    messageCount: t.messages.length,
  })).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  res.json({ threads });
});

// GET /api/chat/admin/threads/:userId — full thread
router.get("/chat/admin/threads/:userId", requireAdmin, (req, res) => {
  const thread = chatThreads.get(req.params.userId);
  if (!thread) { res.status(404).json({ error: "Thread not found" }); return; }
  // Mark as read
  thread.unreadByAdmin = 0;
  res.json({ messages: thread.messages, thread: { userId: thread.userId, userName: thread.userName, userEmail: thread.userEmail } });
});

// POST /api/chat/admin/threads/:userId — admin replies
router.post("/chat/admin/threads/:userId", requireAdmin, (req, res) => {
  const parsed = MessageSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid message" }); return; }

  const adminId = req.session!.userId!;
  const admin = users.get(adminId)!;
  const thread = chatThreads.get(req.params.userId);
  if (!thread) { res.status(404).json({ error: "Thread not found" }); return; }

  const msg: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    threadId: req.params.userId,
    senderRole: "admin",
    senderId: adminId,
    senderName: "Ovenly bekery",
    text: parsed.data.text,
    createdAt: new Date().toISOString(),
  };

  thread.messages.push(msg);
  thread.lastMessageAt = msg.createdAt;

  res.status(201).json({ message: msg });
});

export default router;
