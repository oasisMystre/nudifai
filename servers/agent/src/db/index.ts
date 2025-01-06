import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

export const createDb = (url: string) => drizzle(url, { schema });

export const db = createDb(process.env.DATABASE_URL!);

export type Database = typeof db;
