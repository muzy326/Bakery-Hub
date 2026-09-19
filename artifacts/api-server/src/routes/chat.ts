
import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";

import { z } from "zod";
import { desc, eq } from "drizzle-orm";

import { db } from "@workspace/db";
import {
  chatMessages as chatMessagesTable,
  users as usersTable,
} from "@workspace/db";

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
async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getUserId(req);

    if (!userId) {
      res.status(401).json({
        error: "Not authenticated",
      });
      return;
    }

    const foundUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    const user = foundUsers[0];

    if (!user || user.role !== "admin") {
      res.status(403).json({
        error: "Forbidden",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Admin authentication error:", error);

    res.status(500).json({
      error: "Failed to authenticate admin",
    });
  }
}

// GET /api/chat/thread
// Customer gets their own thread
router.get(
  "/chat/thread",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);

      if (!userId) {
        res.status(401).json({
          error: "Not authenticated",
        });
        return;
      }

      const messages = await db
        .select()
        .from(chatMessagesTable)
        .where(eq(chatMessagesTable.threadId, userId))
        .orderBy(chatMessagesTable.createdAt);

      res.json({
        messages,
        threadId: userId,
      });
    } catch (error) {
      console.error("Failed to fetch chat thread:", error);

      res.status(500).json({
        error: "Failed to fetch chat thread",
      });
    }
  },
);

// POST /api/chat/thread
// Customer sends message
router.post(
  "/chat/thread",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const parsed = MessageSchema.safeParse(req.body);

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

      const foundUsers = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId));

      const user = foundUsers[0];

      if (!user) {
        res.status(401).json({
          error: "User not found",
        });
        return;
      }

      const messageId = `msg-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`;

      const createdAt = new Date();

      const insertedMessages = await db
        .insert(chatMessagesTable)
        .values({
          id: messageId,
          threadId: userId,
          senderRole: "customer",
          senderId: userId,
          senderName: user.name,
          text: parsed.data.text,
          createdAt,
        })
        .returning();

      const message = insertedMessages[0];

      if (!message) {
        res.status(500).json({
          error: "Failed to create message",
        });
        return;
      }

      res.status(201).json({
        message,
      });
    } catch (error) {
      console.error("Failed to send chat message:", error);

      res.status(500).json({
        error: "Failed to send chat message",
      });
    }
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
  async (_req: Request, res: Response) => {
    try {
      const messages = await db
        .select()
        .from(chatMessagesTable)
        .orderBy(desc(chatMessagesTable.createdAt));

      const threadMap = new Map<
        string,
        {
          userId: string;
          userName: string;
          userEmail: string;
          lastMessageAt: Date;
          unreadByAdmin: number;
          lastMessage: string;
          messageCount: number;
        }
      >();

      for (const message of messages) {
        const existing = threadMap.get(message.threadId);

        if (!existing) {
          const customerUsers = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, message.threadId));

          const customer = customerUsers[0];

          if (!customer) {
            continue;
          }

          threadMap.set(message.threadId, {
            userId: message.threadId,
            userName: customer.name,
            userEmail: customer.email,
            lastMessageAt: message.createdAt,
            unreadByAdmin:
              message.senderRole === "customer" ? 1 : 0,
            lastMessage: message.text,
            messageCount: 1,
          });
        } else {
          existing.messageCount += 1;

          if (message.senderRole === "customer") {
            existing.unreadByAdmin += 1;
          }
        }
      }

      res.json({
        threads: [...threadMap.values()],
      });
    } catch (error) {
      console.error("Failed to fetch admin chat threads:", error);

      res.status(500).json({
        error: "Failed to fetch chat threads",
      });
    }
  },
);

// GET /api/chat/admin/threads/:userId
// Admin gets full customer thread
router.get(
  "/chat/admin/threads/:userId",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const userId = getParam(req, "userId");

      if (!userId) {
        res.status(400).json({
          error: "Invalid user ID",
        });
        return;
      }

      const customerUsers = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId));

      const customer = customerUsers[0];

      if (!customer) {
        res.status(404).json({
          error: "User not found",
        });
        return;
      }

      const messages = await db
        .select()
        .from(chatMessagesTable)
        .where(eq(chatMessagesTable.threadId, userId))
        .orderBy(chatMessagesTable.createdAt);

      if (messages.length === 0) {
        res.status(404).json({
          error: "Thread not found",
        });
        return;
      }

      res.json({
        messages,
        thread: {
          userId: customer.id,
          userName: customer.name,
          userEmail: customer.email,
        },
      });
    } catch (error) {
      console.error("Failed to fetch admin chat:", error);

      res.status(500).json({
        error: "Failed to fetch chat thread",
      });
    }
  },
);

// POST /api/chat/admin/threads/:userId
// Admin replies to customer
router.post(
  "/chat/admin/threads/:userId",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const parsed = MessageSchema.safeParse(req.body);

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

      const adminUsers = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, adminId));

      const admin = adminUsers[0];

      if (!admin || admin.role !== "admin") {
        res.status(403).json({
          error: "Admin not found",
        });
        return;
      }

      const userId = getParam(req, "userId");

      if (!userId) {
        res.status(400).json({
          error: "Invalid user ID",
        });
        return;
      }

      const customerUsers = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId));

      if (!customerUsers[0]) {
        res.status(404).json({
          error: "Customer not found",
        });
        return;
      }

      const messageId = `msg-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`;

      const insertedMessages = await db
        .insert(chatMessagesTable)
        .values({
          id: messageId,
          threadId: userId,
          senderRole: "admin",
          senderId: adminId,
          senderName: admin.name,
          text: parsed.data.text,
          createdAt: new Date(),
        })
        .returning();

      const message = insertedMessages[0];

      if (!message) {
        res.status(500).json({
          error: "Failed to create admin message",
        });
        return;
      }

      res.status(201).json({
        message,
      });
    } catch (error) {
      console.error("Failed to send admin chat message:", error);

      res.status(500).json({
        error: "Failed to send admin message",
      });
    }
  },
);

export default router;
