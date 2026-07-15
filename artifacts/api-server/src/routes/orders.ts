import { Router, type IRouter } from "express";
import { z } from "zod";

const router: IRouter = Router();

interface BulkOrder {
  id: string;
  name: string;
  email: string;
  phone: string;
  items: { itemId: string; name: string; quantity: number }[];
  pickupDate: string;
  notes: string;
  createdAt: string;
  status: "pending" | "confirmed";
}

interface CateringRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  requirements: string;
  budget: string;
  createdAt: string;
  status: "pending" | "confirmed";
}

// In-memory stores
const bulkOrders: BulkOrder[] = [];
const cateringRequests: CateringRequest[] = [];

// --- Bulk Orders ---
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
      }),
    )
    .min(1),
  pickupDate: z.string().min(1),
  notes: z.string().optional().default(""),
});

router.post("/orders/bulk", (req, res) => {
  const parsed = BulkOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid order data", details: parsed.error.issues });
    return;
  }

  const order: BulkOrder = {
    id: `BO-${Date.now()}`,
    ...parsed.data,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  bulkOrders.push(order);

  res.status(201).json({
    success: true,
    orderId: order.id,
    message:
      "Your bulk order has been received! We'll contact you within 24 hours to confirm.",
  });
});

router.get("/orders/bulk", (_req, res) => {
  res.json({ orders: bulkOrders });
});

// --- Catering Requests ---
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

  const request: CateringRequest = {
    id: `CAT-${Date.now()}`,
    ...parsed.data,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  cateringRequests.push(request);

  res.status(201).json({
    success: true,
    requestId: request.id,
    message:
      "Your catering request has been received! Our events team will reach out within 48 hours.",
  });
});

export default router;
