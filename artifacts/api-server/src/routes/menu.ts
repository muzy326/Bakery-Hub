import { Router } from "express";
import { z } from "zod";

import { menuItems } from "../data/menu.js";

const router = Router();

// GET /api/menu - list all menu items
router.get("/menu", (_req, res) => {
  const itemsWithStats = menuItems.map((item) => ({
    ...item,
    averageRating:
      item.ratings.length > 0
        ? Math.round(
            (item.ratings.reduce(
              (a, b) => a + b,
              0,
            ) / item.ratings.length) *
              10,
          ) / 10
        : null,
    ratingCount: item.ratings.length,
  }));

  res.json({
    items: itemsWithStats,
  });
});

// GET /api/menu/:id - get a single item
router.get("/menu/:id", (req, res) => {
  const item = menuItems.find(
    (i) => i.id === req.params.id,
  );

  if (!item) {
    res.status(404).json({
      error: "Item not found",
    });
    return;
  }

  res.json({
    ...item,
    averageRating:
      item.ratings.length > 0
        ? Math.round(
            (item.ratings.reduce(
              (a, b) => a + b,
              0,
            ) / item.ratings.length) *
              10,
          ) / 10
        : null,
    ratingCount: item.ratings.length,
  });
});

// POST /api/menu/:id/rate - rate a menu item
const RateSchema = z.object({
  rating: z.number().int().min(1).max(5),
});

router.post(
  "/menu/:id/rate",
  (req, res) => {
    const item = menuItems.find(
      (i) => i.id === req.params.id,
    );

    if (!item) {
      res.status(404).json({
        error: "Item not found",
      });
      return;
    }

    const parsed = RateSchema.safeParse(
      req.body,
    );

    if (!parsed.success) {
      res.status(400).json({
        error:
          "Invalid rating. Must be 1-5.",
      });
      return;
    }

    item.ratings.push(
      parsed.data.rating,
    );

    const avg =
      Math.round(
        (item.ratings.reduce(
          (a, b) => a + b,
          0,
        ) / item.ratings.length) *
          10,
      ) / 10;

    res.json({
      success: true,
      averageRating: avg,
      ratingCount: item.ratings.length,
    });
  },
);

export default router;