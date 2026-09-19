
import {
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const chatMessages = pgTable("chat_messages", {
  id: text("id").primaryKey(),

  threadId: text("thread_id").notNull(),

  senderRole: text("sender_role").notNull(),

  senderId: text("sender_id").notNull(),

  senderName: text("sender_name").notNull(),

  text: text("text").notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).notNull(),
});
