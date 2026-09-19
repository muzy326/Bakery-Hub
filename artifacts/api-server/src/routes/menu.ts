import { Router, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@workspace/db";
import { menuItems as menuItemsTable } from "@workspace/db";

const router = Router();

function withStats(item: typeof menuItemsTable.$inferSelect) {
  const ratings = item.ratings ?? [];

  return {
    ...item,
    price: Number(item.price),
    averageRating:
      ratings.length > 0
        ? Math.round(
            (ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10,
          ) / 10
        : null,
    ratingCount: ratings.length,
  };
}

// GET /api/menu - list all menu items
router.get("/menu", async (_req: Request, res: Response) => {
  try {
    const items = await db.select().from(menuItemsTable);

    res.json({
      items: items.map(withStats),
    });
  } catch (error) {
    console.error("Failed to fetch menu:", error);
    res.status(500).json({
      error: "Failed to fetch menu",
    });
  }
});

// GET /api/menu/:id - get a single item
router.get("/menu/:id", async (req: Request, res: Response) => {
  try {
    const items = await db
      .select()
      .from(menuItemsTable)
      .where(eq(menuItemsTable.id, String(req.params.id)));

    const item = items[0];

    if (!item) {
      res.status(404).json({
        error: "Item not found",
      });
      return;
    }

    res.json(withStats(item));
  } catch (error) {
    console.error("Failed to fetch menu item:", error);
    res.status(500).json({
      error: "Failed to fetch menu item",
    });
  }
});

// POST /api/menu/:id/rate - rate a menu item
const RateSchema = z.object({
  rating: z.number().int().min(1).max(5),
});

router.post(
  "/menu/:id/rate",
  async (req: Request, res: Response) => {
    try {
      const parsed = RateSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          error: "Invalid rating. Must be 1-5.",
        });
        return;
      }

      const items = await db
        .select()
        .from(menuItemsTable)
        .where(eq(menuItemsTable.id, String(req.params.id)));

      const item = items[0];

      if (!item) {
        res.status(404).json({
          error: "Item not found",
        });
        return;
      }

      const ratings = [...(item.ratings ?? []), parsed.data.rating];

      const updated = await db
        .update(menuItemsTable)
        .set({ ratings })
        .where(eq(menuItemsTable.id, String(req.params.id)))
        .returning();

      const updatedItem = updated[0];
      const averageRating =
        ratings.length > 0
          ? Math.round(
              (ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10,
            ) / 10
          : null;

      res.json({
        success: true,
        averageRating,
        ratingCount: ratings.length,
        item: updatedItem ? withStats(updatedItem) : null,
      });
    } catch (error) {
      console.error("Failed to rate menu item:", error);
      res.status(500).json({
        error: "Failed to rate menu item",
      });
    }
  },
);

export default router;
