import { users } from "../../db/schema";
import type { Database } from "../../db";
import type { userInsertSchema } from "../../db/zod";

export const getOrCreateUser = (
  database: Database,
  values: Zod.infer<typeof userInsertSchema>
) =>
  database
    .insert(users)
    .values(values)
    .onConflictDoUpdate({ target: [users.uuid], set: values })
    .returning();
