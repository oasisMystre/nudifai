import { Context, session, type Telegraf } from "telegraf";

import { db } from "../db";
import { onStart } from "./onStart";
import { onPhoto } from "./onPhoto";
import type { userSelectSchema } from "../db/zod";
import { getOrCreateUser } from "../modules/users/user.controller";

export const regiterBot = function (bot: Telegraf<any>) {
  const authenticateUser = async (
    context: Context & { user?: Zod.infer<typeof userSelectSchema> },
    next: () => void
  ) => {
    const [user] = await getOrCreateUser(db, {
      uuid: String(context.from!.id),
    });
    context.user = user;

    next();
  };

  bot.use(session());
  bot.use(authenticateUser);

  onStart(bot);
  onPhoto(bot);

  bot.catch(console.error);
};
