import { threadSelectSchema } from "db/zod";
import { Context } from "telegraf";

declare module "telegraf" {
  interface Context {
    thread?: Zod.infer<typeof threadSelectSchema>;
  }
}
