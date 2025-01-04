import { eq } from "drizzle-orm";

import { jobs } from "../../db/schema";
import type { Database } from "../../db";
import type { jobInsertSchema, jobSelectSchema } from "../../db/zod";

export const createJob = (
  database: Database,
  values: Zod.infer<typeof jobInsertSchema>
) => database.insert(jobs).values(values).returning().execute();

export const updateJobByUuid = (
  database: Database,
  uuid: Zod.infer<typeof jobSelectSchema>["uuid"],
  values: Partial<Zod.infer<typeof jobInsertSchema>>
) =>
  database
    .update(jobs)
    .set(values)
    .where(eq(jobs.uuid, uuid))
    .returning()
    .execute();

export const getJob = (
  database: Database,
  id: Zod.infer<typeof jobSelectSchema>["id"]
) =>
  database.query.jobs
    .findFirst({
      where: eq(jobs.id, id),
    })
    .execute();

export const getJobsByUser = (
  database: Database,
  user: Zod.infer<typeof jobSelectSchema>["user"]
) => database.query.jobs.findFirst({ where: eq(jobs.user, user) });
