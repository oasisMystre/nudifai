import { Scenes, session, type Telegraf } from "telegraf";

import { db } from "../db";
import { onStart } from "./onStart";
import type { userSelectSchema } from "../db/zod";
import { generateScene, type Context } from "./generateScene";
import { getOrCreateUser } from "../modules/users/user.controller";

export const regiterBot = function (bot: Telegraf<any>) {
  const stage = new Scenes.Stage<Context>([generateScene]);

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

 // stage.use(authenticateUser);

  bot.use(session());
  bot.use(authenticateUser);
  bot.use(stage.middleware());

  onStart(bot);
};
