import { pgTable, text, numeric, boolean, integer } from "drizzle-orm/pg-core";

export const menuItems = pgTable("menu_items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image").notNull(),
  tags: text("tags").array().notNull(),
  available: boolean("available").notNull().default(true),
  ratings: integer("ratings").array().notNull(),
});
