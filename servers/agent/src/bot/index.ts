import { Telegraf } from "telegraf";

import { db } from "../db";
import { onMessage } from "./onMessage";
import { getThreadById } from "../modules/threads/thread.controller";

export const registerBot = (bot: Telegraf) => {
  bot.use(async (context, next) => {
    const thread = await getThreadById(db, String(context.from!.id));
    context.thread = thread;

    next();
  });

  bot.on("message", onMessage);
};
