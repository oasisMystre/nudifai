import type { Context, MiddlewareFn } from "telegraf";

export default function atomic<T extends MiddlewareFn<Context>>(callback: T) {
  return async (context: Context, next: () => Promise<void>) =>
    callback(context, next);
}
