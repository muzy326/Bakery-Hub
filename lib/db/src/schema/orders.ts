import { pgTable, text, integer, numeric, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const bulkOrders = pgTable("bulk_orders", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  items: jsonb("items").notNull(),
  pickupDate: text("pickup_date").notNull(),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("pending"),
  discountApplied: boolean("discount_applied").notNull().default(false),
  discountPercent: numeric("discount_percent", { precision: 5, scale: 2 }).notNull().default("0"),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
});

export const cateringRequests = pgTable("catering_requests", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  eventType: text("event_type").notNull(),
  eventDate: text("event_date").notNull(),
  guestCount: integer("guest_count").notNull(),
  requirements: text("requirements").notNull(),
  budget: text("budget").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("pending"),
});
