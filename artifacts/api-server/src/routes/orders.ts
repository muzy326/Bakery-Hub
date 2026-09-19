import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { db } from "@workspace/db";
import {
  bulkOrders as bulkOrdersTable,
  cateringRequests as cateringRequestsTable,
  menuItems as menuItemsTable,
  users as usersTable,
} from "@workspace/db";

const router = Router();

export interface BulkOrder {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string;
  items: { itemId: string; name: string; quantity: number }[];
  pickupDate: string;
  notes: string;
  createdAt: string;
  status:
    | "pending"
    | "confirmed"
    | "ready"
    | "completed"
    | "cancelled";
  discountApplied: boolean;
  discountPercent: number;
  subtotal: number;
  total: number;
}

export interface CateringRequest {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  requirements: string;
  budget: string;
  createdAt: string;
  status:
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled";
}

function mapBulkOrder(
  order: typeof bulkOrdersTable.$inferSelect,
): BulkOrder {
  return {
    id: order.id,
    userId: order.userId,
    name: order.name,
    email: order.email,
    phone: order.phone,
    items: order.items as {
      itemId: string;
      name: string;
      quantity: number;
    }[],
    pickupDate: order.pickupDate,
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    status: order.status as BulkOrder["status"],
    discountApplied: order.discountApplied,
    discountPercent: Number(order.discountPercent),
    subtotal: Number(order.subtotal),
    total: Number(order.total),
  };
}

function mapCateringRequest(
  request: typeof cateringRequestsTable.$inferSelect,
): CateringRequest {
  return {
    id: request.id,
    userId: request.userId,
    name: request.name,
    email: request.email,
    phone: request.phone,
    eventType: request.eventType,
    eventDate: request.eventDate,
    guestCount: request.guestCount,
    requirements: request.requirements,
    budget: request.budget,
    createdAt: request.createdAt.toISOString(),
    status: request.status as CateringRequest["status"],
  };
}

async function getUserOrderCount(
  userId: string | null,
): Promise<number> {
  if (!userId) return 999;

  const orders = await db
    .select()
    .from(bulkOrdersTable)
    .where(eq(bulkOrdersTable.userId, userId));

  return orders.length;
}

const BulkOrderSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  items: z
    .array(
      z.object({
        itemId: z.string(),
        name: z.string(),
        quantity: z.number().int().min(1),
        price: z.number().optional(),
      }),
    )
    .min(1),
  pickupDate: z.string().min(1),
  notes: z.string().optional().default(""),
  subtotal: z.number().min(0).optional(),
});

// POST /api/orders/bulk
router.post(
  "/orders/bulk",
  async (req: Request, res: Response) => {
    try {
      const parsed = BulkOrderSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          error: "Invalid order data",
          details: parsed.error.issues,
        });
        return;
      }

      const userId = req.session?.userId ?? null;

      const isFirstOrder =
        userId !== null &&
        (await getUserOrderCount(userId)) === 0;

      const catalogItems = await Promise.all(
        parsed.data.items.map(async (item) => {
          const results = await db
            .select()
            .from(menuItemsTable)
            .where(eq(menuItemsTable.id, item.itemId));

          return {
            requestItem: item,
            catalogItem: results[0],
          };
        }),
      );

      const unavailableItem = catalogItems.find(
        ({ catalogItem }) =>
          !catalogItem || !catalogItem.available,
      );

      if (unavailableItem) {
        res.status(400).json({
          error:
            "One or more selected items are unavailable.",
        });
        return;
      }

      const subtotal = catalogItems.reduce(
        (sum, { requestItem, catalogItem }) =>
          sum +
          Number(catalogItem!.price) *
            requestItem.quantity,
        0,
      );

      const discountPercent = isFirstOrder ? 50 : 0;
      const total = isFirstOrder
        ? subtotal * 0.5
        : subtotal;

      const orderId = `BO-${Date.now()}`;

      const inserted = await db
        .insert(bulkOrdersTable)
        .values({
          id: orderId,
          userId,
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone,
          items: catalogItems.map(
            ({ requestItem, catalogItem }) => ({
              itemId: requestItem.itemId,
              name: catalogItem!.name,
              quantity: requestItem.quantity,
            }),
          ),
          pickupDate: parsed.data.pickupDate,
          notes: parsed.data.notes,
          createdAt: new Date(),
          status: "pending",
          discountApplied: isFirstOrder,
          discountPercent: String(discountPercent),
          subtotal: String(subtotal),
          total: String(total),
        })
        .returning();

      const order = inserted[0];

      if (!order) {
        res.status(500).json({
          error: "Failed to create order",
        });
        return;
      }

      const msg = isFirstOrder
        ? `🎉 First-time order! Your 50% welcome discount has been applied. Total: $${total.toFixed(2)} (was $${subtotal.toFixed(2)}). We'll contact you within 24 hours to confirm!`
        : "Your bulk order has been received! We'll contact you within 24 hours to confirm.";

      res.status(201).json({
        success: true,
        orderId: order.id,
        discountApplied: isFirstOrder,
        discountPercent,
        total,
        message: msg,
      });
    } catch (error) {
      console.error("Failed to create bulk order:", error);

      res.status(500).json({
        error: "Failed to create order",
      });
    }
  },
);

// GET /api/orders/bulk
router.get(
  "/orders/bulk",
  async (_req: Request, res: Response) => {
    try {
      const orders = await db
        .select()
        .from(bulkOrdersTable);

      res.json({
        orders: orders.map(mapBulkOrder),
      });
    } catch (error) {
      console.error("Failed to fetch bulk orders:", error);

      res.status(500).json({
        error: "Failed to fetch bulk orders",
      });
    }
  },
);

// GET /api/orders/my
router.get(
  "/orders/my",
  async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;

      if (!userId) {
        res.status(401).json({
          error: "Not authenticated",
        });
        return;
      }

      const existingUsers = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId));

      if (!existingUsers[0]) {
        res.status(401).json({
          error: "Not found",
        });
        return;
      }

      const myBulk = await db
        .select()
        .from(bulkOrdersTable)
        .where(eq(bulkOrdersTable.userId, userId));

      const myCatering = await db
        .select()
        .from(cateringRequestsTable)
        .where(eq(cateringRequestsTable.userId, userId));

      res.json({
        bulkOrders: myBulk.map(mapBulkOrder),
        cateringRequests: myCatering.map(
          mapCateringRequest,
        ),
      });
    } catch (error) {
      console.error("Failed to fetch user orders:", error);

      res.status(500).json({
        error: "Failed to fetch user orders",
      });
    }
  },
);

const CateringSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  eventType: z.string().min(1),
  eventDate: z.string().min(1),
  guestCount: z.number().int().min(1),
  requirements: z.string().min(1),
  budget: z.string().min(1),
});

// POST /api/orders/catering
router.post(
  "/orders/catering",
  async (req: Request, res: Response) => {
    try {
      const parsed = CateringSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          error: "Invalid catering data",
          details: parsed.error.issues,
        });
        return;
      }

      const userId = req.session?.userId ?? null;

      const requestId = `CAT-${Date.now()}`;

      const inserted = await db
        .insert(cateringRequestsTable)
        .values({
          id: requestId,
          userId,
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone,
          eventType: parsed.data.eventType,
          eventDate: parsed.data.eventDate,
          guestCount: parsed.data.guestCount,
          requirements: parsed.data.requirements,
          budget: parsed.data.budget,
          createdAt: new Date(),
          status: "pending",
        })
        .returning();

      const request = inserted[0];

      if (!request) {
        res.status(500).json({
          error: "Failed to create catering request",
        });
        return;
      }

      res.status(201).json({
        success: true,
        requestId: request.id,
        message:
          "Your catering request has been received! Our events team will reach out within 48 hours.",
      });
    } catch (error) {
      console.error(
        "Failed to create catering request:",
        error,
      );

      res.status(500).json({
        error: "Failed to create catering request",
      });
    }
  },
);

export default router;