import type { Context, MiddlewareFn } from "telegraf";
import { userSelectSchema } from "../../db/zod";

export default function atomic<
  T extends MiddlewareFn<
    Context & { user?: Zod.infer<typeof userSelectSchema> }
  >
>(callback: T) {
  return async (context: Context, next: () => Promise<void>) =>
    callback(context, next);
}

export function catchRuntimeError<
  T extends MiddlewareFn<
    Context & { user?: Zod.infer<typeof userSelectSchema> }
  >
>(callback: T) {
  return async (context: Context, next: () => Promise<void>) =>
    Promise.resolve(callback(context, next)).catch((error) =>
      console.error(error)
    );
}
