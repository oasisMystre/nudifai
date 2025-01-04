import type { MiddlewareFn } from "telegraf";
import type { Context } from "../generateScene";

export default function atomic<T extends MiddlewareFn<Context>>(callback: T) {
  return async (context: Context, next: () => Promise<void>) =>
    callback(context, next);
}
