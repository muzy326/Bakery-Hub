import { Router, type IRouter } from "express";
import { z } from "zod";
import { users } from "../data/users.js";
import { menuItems } from "../data/menu.js";

const router: IRouter = Router();

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
  status: "pending" | "confirmed" | "ready" | "completed" | "cancelled";
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
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

export const bulkOrders: BulkOrder[] = [];
export const cateringRequests: CateringRequest[] = [];

// Seed demo data
const demoDate = new Date();
demoDate.setDate(demoDate.getDate() + 3);
bulkOrders.push({
  id: "BO-DEMO-001",
  userId: null,
  name: "Demo Customer",
  email: "demo@example.com",
  phone: "+1 (555) 000-0001",
  items: [{ itemId: "1", name: "Sourdough Loaf", quantity: 4 }, { itemId: "2", name: "Cinnamon Roll", quantity: 6 }],
  pickupDate: demoDate.toISOString().split("T")[0],
  notes: "Please slice the bread",
  createdAt: new Date(Date.now() - 86400000).toISOString(),
  status: "confirmed",
  discountApplied: false,
  discountPercent: 0,
  subtotal: 61,
  total: 61,
});

// In-memory order-count per user (for first-time discount)
function getUserOrderCount(userId: string | null): number {
  if (!userId) return 999; // guests don't get discount
  return bulkOrders.filter((o) => o.userId === userId).length;
}

const BulkOrderSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  items: z.array(z.object({ itemId: z.string(), name: z.string(), quantity: z.number().int().min(1), price: z.number().optional() })).min(1),
  pickupDate: z.string().min(1),
  notes: z.string().optional().default(""),
  subtotal: z.number().min(0).optional(),
});

router.post("/orders/bulk", (req, res) => {
  const parsed = BulkOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid order data", details: parsed.error.issues });
    return;
  }

  const userId = req.session?.userId ?? null;
  const isFirstOrder = userId ? getUserOrderCount(userId) === 0 : false;
  const catalogItems = parsed.data.items.map((item) => {
    const catalogItem = menuItems.find((menuItem) => menuItem.id === item.itemId);
    return { requestItem: item, catalogItem };
  });
  const unavailableItem = catalogItems.find(({ catalogItem }) => !catalogItem || !catalogItem.available);
  if (unavailableItem) {
    res.status(400).json({ error: "One or more selected items are unavailable." });
    return;
  }

  // Always calculate the subtotal from the server's menu prices. The optional
  // client subtotal is kept only for backwards compatibility with old clients.
  const subtotal = catalogItems.reduce(
    (sum, { requestItem, catalogItem }) => sum + catalogItem!.price * requestItem.quantity,
    0,
  );
  const discountPercent = isFirstOrder ? 50 : 0;
  const total = isFirstOrder ? subtotal * 0.5 : subtotal;

  const order: BulkOrder = {
    id: `BO-${Date.now()}`,
    userId,
    ...parsed.data,
    items: catalogItems.map(({ requestItem, catalogItem }) => ({
      itemId: requestItem.itemId,
      name: catalogItem!.name,
      quantity: requestItem.quantity,
    })),
    subtotal,
    discountPercent,
    discountApplied: isFirstOrder,
    total,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  bulkOrders.push(order);

  const msg = isFirstOrder
    ? `🎉 First-time order! Your 50% welcome discount has been applied. Total: $${total.toFixed(2)} (was $${subtotal.toFixed(2)}). We'll contact you within 24 hours to confirm!`
    : "Your bulk order has been received! We'll contact you within 24 hours to confirm.";

  res.status(201).json({ success: true, orderId: order.id, discountApplied: isFirstOrder, discountPercent, total, message: msg });
});

router.get("/orders/bulk", (_req, res) => {
  res.json({ orders: bulkOrders });
});

// GET /api/orders/my — orders for the logged-in user
router.get("/orders/my", (req, res) => {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const user = users.get(userId);
  if (!user) {
    res.status(401).json({ error: "Not found" });
    return;
  }

  const myBulk = bulkOrders.filter((o) => o.userId === userId);
  const myCatering = cateringRequests.filter((o) => o.userId === userId);

  res.json({ bulkOrders: myBulk, cateringRequests: myCatering });
});

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

router.post("/orders/catering", (req, res) => {
  const parsed = CateringSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid catering data", details: parsed.error.issues });
    return;
  }

  const userId = req.session?.userId ?? null;
  const request: CateringRequest = {
    id: `CAT-${Date.now()}`,
    userId,
    ...parsed.data,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  cateringRequests.push(request);

  res.status(201).json({
    success: true,
    requestId: request.id,
    message: "Your catering request has been received! Our events team will reach out within 48 hours.",
  });
});

export default router;
