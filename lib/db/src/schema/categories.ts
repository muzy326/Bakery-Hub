import { pgTable, text } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  label: text("label").notNull(),
  color: text("color").notNull(),
});