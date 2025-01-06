import { threadInsertSchema, threadSelectSchema } from "db/zod";
import { Database } from "../../db";
import { threads } from "../../db/schema";
import { eq } from "drizzle-orm";

export const createThread = (
  database: Database,
  values: Zod.infer<typeof threadInsertSchema>
) =>
  database
    .insert(threads)
    .values(values)
    .onConflictDoNothing()
    .returning()
    .execute();

export const getThreadById = (
  database: Database,
  id: Zod.infer<typeof threadSelectSchema>["id"]
) =>
  database.query.threads
    .findFirst({
      where: eq(threads.id, id),
    })
    .execute();
