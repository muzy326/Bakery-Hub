
import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { z 
} from "zod";
import { eq } from "drizzle-orm";

import { db } from "@workspace/db";
import {
  users as usersTable,
  bulkOrders as bulkOrdersTable,
  cateringRequests as cateringRequestsTable,
  menuItems as menuItemsTable,
  categories as categoriesTable,
} from "@workspace/db";



const router = Router();

// --- Admin authentication ---

async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const userId = req.session?.userId;

  if (!userId) {
    res.status(401).json({
      error: "Not authenticated",
    });
    return;
  }

  try {
    const existingUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    const user = existingUsers[0];

    if (!user || user.role !== "admin") {
      res.status(403).json({
        error: "Forbidden",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Admin authentication failed:", error);

    res.status(500).json({
      error: "Authentication check failed",
    });
  }
}

// --- Orders ---

router.get(
  "/admin/orders",
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const bulkOrders = await db
        .select()
        .from(bulkOrdersTable);

      const cateringRequests = await db
        .select()
        .from(cateringRequestsTable);

      res.json({
        bulkOrders: bulkOrders.reverse(),
        cateringRequests: cateringRequests.reverse(),
      });
    } catch (error) {
      console.error("Failed to load admin orders:", error);

      res.status(500).json({
        error: "Failed to load orders",
      });
    }
  },
);

// --- Dashboard analytics ---

router.get(
  "/admin/dashboard",
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const bulkOrders = await db
        .select()
        .from(bulkOrdersTable);

      const menuItems = await db
        .select()
        .from(menuItemsTable);

      const categories = await db
        .select()
        .from(categoriesTable);

      const revenueStatuses = new Set([
        "confirmed",
        "ready",
        "completed",
      ]);

      const categoryLookup = new Map(
        categories.map((category) => [
          category.id,
          category,
        ]),
      );

      const productLookup = new Map(
        menuItems.map((item) => [
          item.id,
          item,
        ]),
      );

      const productStats = new Map<
        string,
        {
          id: string;
          name: string;
          category: string;
          units: number;
          revenue: number;
        }
      >();

      let totalRevenue = 0;
      let totalUnits = 0;
      let totalOrders = 0;

      for (const order of bulkOrders) {
        if (!revenueStatuses.has(order.status)) {
          continue;
        }

        const orderItems = Array.isArray(order.items)
          ? order.items
          : [];

        const lines = orderItems
          .map((rawLine) => {
            if (
              typeof rawLine !== "object" ||
              rawLine === null
            ) {
              return null;
            }

            const line = rawLine as {
              itemId?: unknown;
              quantity?: unknown;
            };

            const itemId =
              typeof line.itemId === "string"
                ? line.itemId
                : null;

            const quantity =
              typeof line.quantity === "number"
                ? line.quantity
                : Number(line.quantity);

            if (
              !itemId ||
              !Number.isFinite(quantity)
            ) {
              return null;
            }

            const product =
              productLookup.get(itemId);

            if (!product) {
              return null;
            }

            return {
              itemId,
              quantity,
              product,
              grossRevenue:
                Number(product.price) * quantity,
            };
          })
          .filter(
            (
              line,
            ): line is {
              itemId: string;
              quantity: number;
              product: typeof menuItems[number];
              grossRevenue: number;
            } => Boolean(line),
          );

        const grossSubtotal = lines.reduce(
          (sum, line) =>
            sum + line.grossRevenue,
          0,
        );

        const orderTotal = Number(order.total);

        const netMultiplier =
          grossSubtotal > 0
            ? orderTotal / grossSubtotal
            : 0;

        totalOrders += 1;
        totalRevenue += orderTotal;

        for (const {
          quantity,
          product,
          grossRevenue,
        } of lines) {
          const revenue =
            grossRevenue * netMultiplier;

          const existing =
            productStats.get(product.id) ?? {
              id: product.id,
              name: product.name,
              category: product.category,
              units: 0,
              revenue: 0,
            };

          existing.units += quantity;
          existing.revenue += revenue;

          productStats.set(
            product.id,
            existing,
          );

          totalUnits += quantity;
        }
      }

      const colorPalette = [
        "#B77E4D",
        "#D4A017",
        "#8C5B43",
        "#6F8C70",
        "#C9785C",
        "#7D6B91",
        "#4F7C8A",
        "#A68A64",
      ];

      const products = [
        ...productStats.values(),
      ]
        .sort(
          (a, b) =>
            b.revenue - a.revenue ||
            b.units - a.units,
        )
        .map((product, index) => ({
          ...product,
          revenue: Number(
            product.revenue.toFixed(2),
          ),
          color:
            colorPalette[
              index % colorPalette.length
            ],
        }));

      const categoryStats = new Map<
        string,
        {
          id: string;
          label: string;
          units: number;
          revenue: number;
          color: string;
        }
      >();

      for (const product of products) {
        const category =
          categoryLookup.get(
            product.category,
          );

        const existing =
          categoryStats.get(
            product.category,
          ) ?? {
            id: product.category,
            label:
              category?.label ??
              product.category,
            units: 0,
            revenue: 0,
            color:
              colorPalette[
                categoryStats.size %
                  colorPalette.length
              ],
          };

        existing.units += product.units;
        existing.revenue += product.revenue;

        categoryStats.set(
          product.category,
          existing,
        );
      }

      const categoriesByUnits = [
        ...categoryStats.values(),
      ]
        .sort(
          (a, b) => b.units - a.units,
        )
        .map((category) => ({
          ...category,
          revenue: Number(
            category.revenue.toFixed(2),
          ),
        }));

      const categoriesByRevenue = [
        ...categoriesByUnits,
      ].sort(
        (a, b) =>
          b.revenue - a.revenue,
      );

      res.json({
        summary: {
          totalRevenue: Number(
            totalRevenue.toFixed(2),
          ),
          totalUnits,
          totalOrders,

          activeProducts:
            menuItems.filter(
              (item) => item.available,
            ).length,

          categoryCount:
            categories.length,
        },

        productDistribution:
          products
            .slice()
            .sort(
              (a, b) =>
                b.units - a.units ||
                b.revenue - a.revenue,
            )
            .map(
              ({
                id,
                name,
                category,
                units,
                color,
              }) => ({
                id,
                name,
                category,
                value: units,
                color,
              }),
            ),

        categorySplit:
          categoriesByUnits.map(
            ({
              id,
              label,
              units,
              color,
            }) => ({
              id,
              label,
              value: units,
              color,
            }),
          ),

        categoryRevenue:
          categoriesByRevenue.map(
            ({
              id,
              label,
              revenue,
              color,
            }) => ({
              id,
              label,
              value: revenue,
              color,
            }),
          ),

        productRevenue:
          products.map(
            ({
              id,
              name,
              category,
              revenue,
              color,
            }) => ({
              id,
              name,
              category,
              value: revenue,
              color,
            }),
          ),
      });
    } catch (error) {
      console.error(
        "Failed to load dashboard:",
        error,
      );

      res.status(500).json({
        error: "Failed to load dashboard",
      });
    }
  },
);

// --- Bulk order status ---

router.patch(
  "/admin/orders/bulk/:id/status",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const orderId = String(req.params.id);

      const valid = [
        "pending",
        "confirmed",
        "ready",
        "completed",
        "cancelled",
      ];

      if (!valid.includes(status)) {
        res.status(400).json({
          error: "Invalid status",
        });
        return;
      }

      const updatedOrders = await db
        .update(bulkOrdersTable)
        .set({
          status,
        })
        .where(eq(bulkOrdersTable.id, orderId))
        .returning();

      const order = updatedOrders[0];

      if (!order) {
        res.status(404).json({
          error: "Not found",
        });
        return;
      }

      res.json({
        order,
      });
    } catch (error) {
      console.error(
        "Failed to update bulk order:",
        error,
      );

      res.status(500).json({
        error: "Failed to update order",
      });
    }
  },
);

// --- Catering request status ---

router.patch(
  "/admin/orders/catering/:id/status",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const requestId = String(req.params.id);

      const valid = [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
      ];

      if (!valid.includes(status)) {
        res.status(400).json({
          error: "Invalid status",
        });
        return;
      }

      const updatedRequests = await db
        .update(cateringRequestsTable)
        .set({
          status,
        })
        .where(
          eq(
            cateringRequestsTable.id,
            requestId,
          ),
        )
        .returning();

      const request = updatedRequests[0];

      if (!request) {
        res.status(404).json({
          error: "Not found",
        });
        return;
      }

      res.json({
        request,
      });
    } catch (error) {
      console.error(
        "Failed to update catering request:",
        error,
      );

      res.status(500).json({
        error: "Failed to update catering request",
      });
    }
  },
);

// --- Categories ---

router.get(
  "/admin/categories",
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const allCategories = await db
        .select()
        .from(categoriesTable);

      res.json({
        categories: allCategories,
      });
    } catch (error) {
      console.error("Failed to load categories:", error);

      res.status(500).json({
        error: "Failed to load categories",
      });
    }
  },
);

const CategorySchema = z.object({
  name: z
    .string()
    .min(1)
    .max(32)
    .regex(/^[a-z0-9-]+$/),
  label: z.string().min(1).max(32),
  color: z.string().min(1),
});

router.post(
  "/admin/categories",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const parsed = CategorySchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          error: "Invalid data",
        });
        return;
      }

      const existingCategories = await db
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.id, parsed.data.name));

      if (existingCategories.length > 0) {
        res.status(409).json({
          error: "Already exists",
        });
        return;
      }

      const insertedCategories = await db
        .insert(categoriesTable)
        .values({
          id: parsed.data.name,
          name: parsed.data.name,
          label: parsed.data.label,
          color: parsed.data.color,
        })
        .returning();

      const category = insertedCategories[0];

      res.status(201).json({
        category,
      });
    } catch (error) {
      console.error("Failed to create category:", error);

      res.status(500).json({
        error: "Failed to create category",
      });
    }
  },
);

router.patch(
  "/admin/categories/:id",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const categoryId = String(req.params.id);

      const parsed = CategorySchema.partial().safeParse(
        req.body,
      );

      if (!parsed.success) {
        res.status(400).json({
          error: "Invalid data",
        });
        return;
      }

      const updatedCategories = await db
        .update(categoriesTable)
        .set(parsed.data)
        .where(eq(categoriesTable.id, categoryId))
        .returning();

      const category = updatedCategories[0];

      if (!category) {
        res.status(404).json({
          error: "Not found",
        });
        return;
      }

      res.json({
        category,
      });
    } catch (error) {
      console.error("Failed to update category:", error);

      res.status(500).json({
        error: "Failed to update category",
      });
    }
  },
);

router.delete(
  "/admin/categories/:id",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const categoryId = String(req.params.id);

      const deletedCategories = await db
        .delete(categoriesTable)
        .where(eq(categoriesTable.id, categoryId))
        .returning();

      if (deletedCategories.length === 0) {
        res.status(404).json({
          error: "Not found",
        });
        return;
      }

      res.json({
        success: true,
      });
    } catch (error) {
      console.error("Failed to delete category:", error);

      res.status(500).json({
        error: "Failed to delete category",
      });
    }
  },
);

// --- Products ---

router.get(
  "/admin/products",
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const products = await db
        .select()
        .from(menuItemsTable);

      res.json({
        products: products.map((item) => {
          const ratings = item.ratings ?? [];

          return {
            ...item,
            price: Number(item.price),
            averageRating:
              ratings.length > 0
                ? ratings.reduce(
                    (sum, rating) => sum + rating,
                    0,
                  ) / ratings.length
                : null,
            ratingCount: ratings.length,
          };
        }),
      });
    } catch (error) {
      console.error("Failed to load products:", error);

      res.status(500).json({
        error: "Failed to load products",
      });
    }
  },
);

const ProductSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  image: z.string().url(),
  tags: z.array(z.string()).default([]),
  available: z.boolean().default(true),
});

router.post(
  "/admin/products",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const parsed = ProductSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          error: "Invalid data",
          details: parsed.error.issues,
        });
        return;
      }

      const productId = `item-${Date.now()}`;

      const insertedProducts = await db
        .insert(menuItemsTable)
        .values({
          id: productId,
          name: parsed.data.name,
          category: parsed.data.category,
          description: parsed.data.description,
          price: String(parsed.data.price),
          image: parsed.data.image,
          tags: parsed.data.tags,
          available: parsed.data.available,
          ratings: [],
        })
        .returning();

      const product = insertedProducts[0];

      if (!product) {
        res.status(500).json({
          error: "Failed to create product",
        });
        return;
      }

      res.status(201).json({
        product: {
          ...product,
          price: Number(product.price),
          averageRating: null,
          ratingCount: 0,
        },
      });
    } catch (error) {
      console.error("Failed to create product:", error);

      res.status(500).json({
        error: "Failed to create product",
      });
    }
  },
);

router.patch(
  "/admin/products/:id",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const productId = String(req.params.id);

      const parsed = ProductSchema.partial().safeParse(
        req.body,
      );

      if (!parsed.success) {
        res.status(400).json({
          error: "Invalid data",
          details: parsed.error.issues,
        });
        return;
      }

      const updatedProducts = await db
        .update(menuItemsTable)
        .set({
          ...(parsed.data.name !== undefined && {
            name: parsed.data.name,
          }),
          ...(parsed.data.category !== undefined && {
            category: parsed.data.category,
          }),
          ...(parsed.data.description !== undefined && {
            description: parsed.data.description,
          }),
          ...(parsed.data.price !== undefined && {
            price: String(parsed.data.price),
          }),
          ...(parsed.data.image !== undefined && {
            image: parsed.data.image,
          }),
          ...(parsed.data.tags !== undefined && {
            tags: parsed.data.tags,
          }),
          ...(parsed.data.available !== undefined && {
            available: parsed.data.available,
          }),
        })
        .where(eq(menuItemsTable.id, productId))
        .returning();

      const product = updatedProducts[0];

      if (!product) {
        res.status(404).json({
          error: "Not found",
        });
        return;
      }

      const ratings = product.ratings ?? [];

      res.json({
        product: {
          ...product,
          price: Number(product.price),
          averageRating:
            ratings.length > 0
              ? ratings.reduce(
                  (sum, rating) => sum + rating,
                  0,
                ) / ratings.length
              : null,
          ratingCount: ratings.length,
        },
      });
    } catch (error) {
      console.error("Failed to update product:", error);

      res.status(500).json({
        error: "Failed to update product",
      });
    }
  },
);

router.delete(
  "/admin/products/:id",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const productId = String(req.params.id);

      const deletedProducts = await db
        .delete(menuItemsTable)
        .where(eq(menuItemsTable.id, productId))
        .returning();

      if (deletedProducts.length === 0) {
        res.status(404).json({
          error: "Not found",
        });
        return;
      }

      res.json({
        success: true,
      });
    } catch (error) {
      console.error("Failed to delete product:", error);

      res.status(500).json({
        error: "Failed to delete product",
      });
    }
  },
);

// --- Users ---

router.get(
  "/admin/users",
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const allUsers = await db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          role: usersTable.role,
          createdAt: usersTable.createdAt,
        })
        .from(usersTable);

      res.json({
        users: allUsers,
      });
    } catch (error) {
      console.error(
        "Failed to load users:",
        error,
      );

      res.status(500).json({
        error: "Failed to load users",
      });
    }
  },
);

export default router;
