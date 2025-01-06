import { json, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const jobs = pgTable("jobss", {
  id: uuid().defaultRandom().primaryKey(),
  uuid: text().unique().notNull(),
  user: uuid()
    .references(() => users.id)
    .notNull(),
  result: json().$type<string[]>(),
  createdAt: timestamp().defaultNow().notNull(),
});
