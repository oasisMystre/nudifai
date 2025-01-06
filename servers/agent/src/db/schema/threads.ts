import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const threads = pgTable("threads", {
  id: text().unique().primaryKey(),
  threadId: text().unique(),
  createdAt: timestamp().defaultNow().notNull(),
});
