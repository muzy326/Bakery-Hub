
import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { db } from "@workspace/db";
import { users as usersTable } from "@workspace/db";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

const router = Router();

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function toSafeUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

// POST /api/auth/register
router.post(
  "/auth/register",
  async (req: Request, res: Response) => {
    try {
      const parsed = RegisterSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          error: "Invalid data",
          details: parsed.error.issues,
        });
        return;
      }

      const {
        name,
        email,
        password,
      } = parsed.data;

      const normalizedEmail = email.toLowerCase();

      // Check if user already exists in Neon
      const existingUsers = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, normalizedEmail));

      if (existingUsers.length > 0) {
        res.status(409).json({
          error: "Email already registered",
        });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const userId = `user-${Date.now()}`;

      const insertedUsers = await db
        .insert(usersTable)
        .values({
          id: userId,
          name,
          email: normalizedEmail,
          passwordHash,
          role: "customer",
          createdAt: new Date(),
        })
        .returning();

      const user = insertedUsers[0];

      if (!user) {
        res.status(500).json({
          error: "Failed to create user",
        });
        return;
      }

      req.session.userId = user.id;

      res.status(201).json({
        user: toSafeUser(user),
      });
    } catch (error) {
      console.error("Registration error:", error);

      res.status(500).json({
        error: "Failed to register user",
      });
    }
  },
);

// POST /api/auth/login
router.post(
  "/auth/login",
  async (req: Request, res: Response) => {
    try {
      const parsed = LoginSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          error: "Invalid credentials",
        });
        return;
      }

      const {
        email,
        password,
      } = parsed.data;

      const normalizedEmail = email.toLowerCase();

      // Find user in Neon
      const foundUsers = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, normalizedEmail));

      const user = foundUsers[0];

      if (!user) {
        res.status(401).json({
          error: "Invalid email or password",
        });
        return;
      }

      const valid = await bcrypt.compare(
        password,
        user.passwordHash,
      );

      if (!valid) {
        res.status(401).json({
          error: "Invalid email or password",
        });
        return;
      }

      req.session.userId = user.id;

      res.json({
        user: toSafeUser(user),
      });
    } catch (error) {
      console.error("Login error:", error);

      res.status(500).json({
        error: "Failed to login",
      });
    }
  },
);
// POST /api/auth/change-password
router.post(
  "/auth/change-password",
  async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;

      if (!userId) {
        res.status(401).json({
          error: "Not authenticated",
        });
        return;
      }

      const { newPassword } = req.body;

      if (
        typeof newPassword !== "string" ||
        newPassword.length < 6
      ) {
        res.status(400).json({
          error: "Password must be at least 6 characters",
        });
        return;
      }

      const passwordHash = await bcrypt.hash(
        newPassword,
        10,
      );

      const updatedUsers = await db
        .update(usersTable)
        .set({
          passwordHash,
        })
        .where(eq(usersTable.id, userId))
        .returning();

      if (!updatedUsers[0]) {
        res.status(404).json({
          error: "User not found",
        });
        return;
      }

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error(
        "Change password error:",
        error,
      );

      res.status(500).json({
        error: "Failed to change password",
      });
    }
  },
);
// PATCH /api/auth/profile
router.patch(
  "/auth/profile",
  async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;

      if (!userId) {
        res.status(401).json({
          error: "Not authenticated",
        });
        return;
      }

      const ProfileSchema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6).optional(),
      });

      const parsed = ProfileSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          error: "Invalid profile data",
          details: parsed.error.issues,
        });
        return;
      }

      const {
        name,
        email,
        password,
      } = parsed.data;

      const normalizedEmail = email.toLowerCase();

      const existingUsers = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, normalizedEmail));

      const existingUser = existingUsers[0];

      if (
        existingUser &&
        existingUser.id !== userId
      ) {
        res.status(409).json({
          error: "Email already registered",
        });
        return;
      }

      const updateData: {
        name: string;
        email: string;
        passwordHash?: string;
      } = {
        name,
        email: normalizedEmail,
      };

      if (password) {
        updateData.passwordHash =
          await bcrypt.hash(password, 10);
      }

      const updatedUsers = await db
        .update(usersTable)
        .set(updateData)
        .where(eq(usersTable.id, userId))
        .returning();

      const updatedUser = updatedUsers[0];

      if (!updatedUser) {
        res.status(404).json({
          error: "User not found",
        });
        return;
      }

      res.json({
        user: toSafeUser(updatedUser),
      });
    } catch (error) {
      console.error(
        "Profile update error:",
        error,
      );

      res.status(500).json({
        error: "Failed to update profile",
      });
    }
  },
);
// POST /api/auth/logout
router.post(
  "/auth/logout",
  (req: Request, res: Response) => {
    req.session.destroy((error) => {
      if (error) {
        console.error("Logout error:", error);

        res.status(500).json({
          error: "Failed to logout",
        });
        return;
      }

      res.json({
        success: true,
      });
    });
  },
);

// GET /api/auth/me
router.get(
  "/auth/me",
  async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;

      if (!userId) {
        res.status(401).json({
          error: "Not authenticated",
        });
        return;
      }

      // Find user in Neon
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

      res.json({
        user: toSafeUser(user),
      });
    } catch (error) {
      console.error("Auth me error:", error);

      res.status(500).json({
        error: "Failed to get user",
      });
    }
  },
);

export default router;
