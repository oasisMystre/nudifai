import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid().defaultRandom().primaryKey(),
  uuid: text().unique().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});
