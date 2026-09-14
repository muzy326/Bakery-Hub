import { Router, type IRouter } from "express";
import { z } from "zod";
import { users, toSafeUser } from "../data/users.js";
import { bulkOrders, cateringRequests } from "./orders.js";
import { menuItems, type MenuItem } from "../data/menu.js";
import { categories, type Category } from "../data/categories.js";

const router: IRouter = Router();

function requireAdmin(req: any, res: any, next: any) {
  const userId = req.session?.userId;
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const user = users.get(userId);
  if (!user || user.role !== "admin") { res.status(403).json({ error: "Forbidden" }); return; }
  next();
}

// --- Orders ---
router.get("/admin/orders", requireAdmin, (_req, res) => {
  res.json({ bulkOrders: bulkOrders.slice().reverse(), cateringRequests: cateringRequests.slice().reverse() });
});

// --- Dashboard analytics ---
router.get("/admin/dashboard", requireAdmin, (_req, res) => {
  const revenueStatuses = new Set(["confirmed", "ready", "completed"]);
  const categoryLookup = new Map(categories.map((category) => [category.id, category]));
  const productStats = new Map<string, { id: string; name: string; category: string; units: number; revenue: number }>();

  let totalRevenue = 0;
  let totalUnits = 0;
  let totalOrders = 0;

  for (const order of bulkOrders) {
    if (!revenueStatuses.has(order.status)) continue;

    const lines = order.items.map((line) => {
      const product = menuItems.find((item) => item.id === line.itemId);
      return product ? { line, product, grossRevenue: product.price * line.quantity } : null;
    }).filter((line): line is { line: BulkOrder["items"][number]; product: MenuItem; grossRevenue: number } => Boolean(line));
    const grossSubtotal = lines.reduce((sum, line) => sum + line.grossRevenue, 0);
    const netMultiplier = grossSubtotal > 0 ? order.total / grossSubtotal : 0;

    totalOrders += 1;
    totalRevenue += order.total;

    for (const { line, product, grossRevenue } of lines) {
      const revenue = grossRevenue * netMultiplier;
      const existing = productStats.get(product.id) ?? {
        id: product.id,
        name: product.name,
        category: product.category,
        units: 0,
        revenue: 0,
      };
      existing.units += line.quantity;
      existing.revenue += revenue;
      productStats.set(product.id, existing);
      totalUnits += line.quantity;
    }
  }

  const colorPalette = ["#B77E4D", "#D4A017", "#8C5B43", "#6F8C70", "#C9785C", "#7D6B91", "#4F7C8A", "#A68A64"];
  const products = [...productStats.values()]
    .sort((a, b) => b.revenue - a.revenue || b.units - a.units)
    .map((product, index) => ({
      ...product,
      revenue: Number(product.revenue.toFixed(2)),
      color: colorPalette[index % colorPalette.length],
    }));

  const categoryStats = new Map<string, { id: string; label: string; units: number; revenue: number; color: string }>();
  for (const product of products) {
    const category = categoryLookup.get(product.category);
    const existing = categoryStats.get(product.category) ?? {
      id: product.category,
      label: category?.label ?? product.category,
      units: 0,
      revenue: 0,
      color: colorPalette[categoryStats.size % colorPalette.length],
    };
    existing.units += product.units;
    existing.revenue += product.revenue;
    categoryStats.set(product.category, existing);
  }

  const categoriesByUnits = [...categoryStats.values()]
    .sort((a, b) => b.units - a.units)
    .map((category) => ({ ...category, revenue: Number(category.revenue.toFixed(2)) }));
  const categoriesByRevenue = [...categoriesByUnits]
    .sort((a, b) => b.revenue - a.revenue);

  res.json({
    summary: {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalUnits,
      totalOrders,
      activeProducts: menuItems.filter((item) => item.available).length,
      categoryCount: categoryStats.size,
    },
    productDistribution: products
      .slice()
      .sort((a, b) => b.units - a.units || b.revenue - a.revenue)
      .map(({ id, name, category, units, color }) => ({ id, name, category, value: units, color })),
    categorySplit: categoriesByUnits.map(({ id, label, units, color }) => ({ id, label, value: units, color })),
    categoryRevenue: categoriesByRevenue.map(({ id, label, revenue, color }) => ({ id, label, value: revenue, color })),
    productRevenue: products.map(({ id, name, category, revenue, color }) => ({ id, name, category, value: revenue, color })),
  });
});

router.patch("/admin/orders/bulk/:id/status", requireAdmin, (req, res) => {
  const { status } = req.body;
  const order = bulkOrders.find((o) => o.id === req.params.id);
  if (!order) { res.status(404).json({ error: "Not found" }); return; }
  const valid = ["pending", "confirmed", "ready", "completed", "cancelled"];
  if (!valid.includes(status)) { res.status(400).json({ error: "Invalid status" }); return; }
  order.status = status;
  res.json({ order });
});

router.patch("/admin/orders/catering/:id/status", requireAdmin, (req, res) => {
  const { status } = req.body;
  const req2 = cateringRequests.find((o) => o.id === req.params.id);
  if (!req2) { res.status(404).json({ error: "Not found" }); return; }
  const valid = ["pending", "confirmed", "completed", "cancelled"];
  if (!valid.includes(status)) { res.status(400).json({ error: "Invalid status" }); return; }
  req2.status = status;
  res.json({ request: req2 });
});

// --- Categories ---
router.get("/admin/categories", requireAdmin, (_req, res) => {
  res.json({ categories });
});

const CategorySchema = z.object({
  name: z.string().min(1).max(32).regex(/^[a-z0-9-]+$/),
  label: z.string().min(1).max(32),
  color: z.string().min(1),
});

router.post("/admin/categories", requireAdmin, (req, res) => {
  const parsed = CategorySchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid data" }); return; }
  if (categories.find((c) => c.id === parsed.data.name)) { res.status(409).json({ error: "Already exists" }); return; }
  const cat: Category = { id: parsed.data.name, ...parsed.data };
  categories.push(cat);
  res.status(201).json({ category: cat });
});

router.patch("/admin/categories/:id", requireAdmin, (req, res) => {
  const idx = categories.findIndex((c) => c.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
  const parsed = CategorySchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid data" }); return; }
  Object.assign(categories[idx], parsed.data);
  res.json({ category: categories[idx] });
});

router.delete("/admin/categories/:id", requireAdmin, (req, res) => {
  const idx = categories.findIndex((c) => c.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
  categories.splice(idx, 1);
  res.json({ success: true });
});

// --- Products ---
router.get("/admin/products", requireAdmin, (_req, res) => {
  res.json({ products: menuItems.map((item) => ({ ...item, averageRating: item.ratings.length ? item.ratings.reduce((a, b) => a + b, 0) / item.ratings.length : null, ratingCount: item.ratings.length })) });
});

const ProductSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  image: z.string().url(),
  tags: z.array(z.string()).default([]),
  available: z.boolean().default(true),
});

router.post("/admin/products", requireAdmin, (req, res) => {
  const parsed = ProductSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid data", details: parsed.error.issues }); return; }
  const item: MenuItem = { id: `item-${Date.now()}`, ...parsed.data, ratings: [] } as MenuItem;
  menuItems.push(item);
  res.status(201).json({ product: item });
});

router.patch("/admin/products/:id", requireAdmin, (req, res) => {
  const item = menuItems.find((i) => i.id === req.params.id);
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  const parsed = ProductSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid data" }); return; }
  Object.assign(item, parsed.data);
  res.json({ product: item });
});

router.delete("/admin/products/:id", requireAdmin, (req, res) => {
  const idx = menuItems.findIndex((i) => i.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
  menuItems.splice(idx, 1);
  res.json({ success: true });
});

// --- Users ---
router.get("/admin/users", requireAdmin, (_req, res) => {
  const allUsers = [...users.values()].map(toSafeUser);
  res.json({ users: allUsers });
});

export default router;
