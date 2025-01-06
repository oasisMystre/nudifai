import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { threads } from "./schema";

export const threadSelectSchema = createSelectSchema(threads);
export const threadInsertSchema = createInsertSchema(threads);
