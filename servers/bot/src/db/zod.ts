import { array, string } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { jobs, users } from "./schema";

export const userSelectSchema = createSelectSchema(users);
export const userInsertSchema = createInsertSchema(users).omit({
  createdAt: true,
  id: true,
});

export const jobSelectSchema = createSelectSchema(jobs);
export const jobInsertSchema = createInsertSchema(jobs, {
  result: array(string()).nullable(),
});
