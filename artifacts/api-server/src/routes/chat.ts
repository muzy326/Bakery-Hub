import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";

import { z } from "zod";

import {
  chatThreads,
  type ChatMessage,
} from "../data/chat.js";

import { users } from "../data/users.js";

const router = Router();

const MessageSchema = z.object({
  text: z.string().min(1).max(2000),
});

// Get authenticated user ID safely
function getUserId(req: Request): string | null {
  const userId = req.session?.userId;

  return typeof userId === "string"
    ? userId
    : null;
}

// Get route parameter safely
function getParam(
  req: Request,
  name: string,
): string | null {
  const value = req.params[name];

  return typeof value === "string"
    ? value
    : null;
}

// Require auth middleware
function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const userId = getUserId(req);

  if (!userId) {
    res.status(401).json({
      error: "Not authenticated",
    });
    return;
  }

  next();
}

// Require admin middleware
function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const userId = getUserId(req);

  if (!userId) {
    res.status(401).json({
      error: "Not authenticated",
    });
    return;
  }

  const user = users.get(userId);

  if (!user || user.role !== "admin") {
    res.status(403).json({
      error: "Forbidden",
    });
    return;
  }

  next();
}

// GET /api/chat/thread
// Customer gets their own thread
router.get(
  "/chat/thread",
  requireAuth,
  (req, res) => {
    const userId = getUserId(req);

    if (!userId) {
      res.status(401).json({
        error: "Not authenticated",
      });
      return;
    }

    const thread = chatThreads.get(userId);

    res.json({
      messages: thread?.messages ?? [],
      threadId: userId,
    });
  },
);

// POST /api/chat/thread
// Customer sends message
router.post(
  "/chat/thread",
  requireAuth,
  (req, res) => {
    const parsed = MessageSchema.safeParse(
      req.body,
    );

    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid message",
      });
      return;
    }

    const userId = getUserId(req);

    if (!userId) {
      res.status(401).json({
        error: "Not authenticated",
      });
      return;
    }

    const user = users.get(userId);

    if (!user) {
      res.status(401).json({
        error: "Not found",
      });
      return;
    }

    let thread = chatThreads.get(userId);

    if (!thread) {
      thread = {
        userId,
        userName: user.name,
        userEmail: user.email,
        messages: [],
        lastMessageAt:
          new Date().toISOString(),
        unreadByAdmin: 0,
      };

      chatThreads.set(userId, thread);
    }

    const msg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`,
      threadId: userId,
      senderRole: "customer",
      senderId: userId,
      senderName: user.name,
      text: parsed.data.text,
      createdAt:
        new Date().toISOString(),
    };

    thread.messages.push(msg);
    thread.lastMessageAt = msg.createdAt;
    thread.unreadByAdmin += 1;

    res.status(201).json({
      message: msg,
    });
  },
);

// --------------------------------------------------
// Admin
// --------------------------------------------------

// GET /api/chat/admin/threads
// Get all thread summaries
router.get(
  "/chat/admin/threads",
  requireAdmin,
  (_req, res) => {
    const threads = [...chatThreads.values()]
      .map((t) => ({
        userId: t.userId,
        userName: t.userName,
        userEmail: t.userEmail,
        lastMessageAt: t.lastMessageAt,
        unreadByAdmin: t.unreadByAdmin,
        lastMessage:
          t.messages[
            t.messages.length - 1
          ]?.text ?? "",
        messageCount: t.messages.length,
      }))
      .sort(
        (a, b) =>
          new Date(
            b.lastMessageAt,
          ).getTime() -
          new Date(
            a.lastMessageAt,
          ).getTime(),
      );

    res.json({
      threads,
    });
  },
);

// GET /api/chat/admin/threads/:userId
// Admin gets full customer thread
router.get(
  "/chat/admin/threads/:userId",
  requireAdmin,
  (req, res) => {
    const userId = getParam(
      req,
      "userId",
    );

    if (!userId) {
      res.status(400).json({
        error: "Invalid user ID",
      });
      return;
    }

    const thread =
      chatThreads.get(userId);

    if (!thread) {
      res.status(404).json({
        error: "Thread not found",
      });
      return;
    }

    // Mark as read
    thread.unreadByAdmin = 0;

    res.json({
      messages: thread.messages,
      thread: {
        userId: thread.userId,
        userName: thread.userName,
        userEmail: thread.userEmail,
      },
    });
  },
);

// POST /api/chat/admin/threads/:userId
// Admin replies to customer
router.post(
  "/chat/admin/threads/:userId",
  requireAdmin,
  (req, res) => {
    const parsed =
      MessageSchema.safeParse(
        req.body,
      );

    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid message",
      });
      return;
    }

    const adminId = getUserId(req);

    if (!adminId) {
      res.status(401).json({
        error: "Not authenticated",
      });
      return;
    }

    const admin = users.get(adminId);

    if (!admin) {
      res.status(401).json({
        error: "Admin not found",
      });
      return;
    }

    const userId = getParam(
      req,
      "userId",
    );

    if (!userId) {
      res.status(400).json({
        error: "Invalid user ID",
      });
      return;
    }

    const thread =
      chatThreads.get(userId);

    if (!thread) {
      res.status(404).json({
        error: "Thread not found",
      });
      return;
    }

    const msg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`,
      threadId: userId,
      senderRole: "admin",
      senderId: adminId,
      senderName: "Ovenly bekery",
      text: parsed.data.text,
      createdAt:
        new Date().toISOString(),
    };

    thread.messages.push(msg);
    thread.lastMessageAt = msg.createdAt;

    res.status(201).json({
      message: msg,
    });
  },
);

export default router;