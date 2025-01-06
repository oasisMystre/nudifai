import { Context, Scenes, session, type Telegraf } from "telegraf";

import { db } from "../db";
import type { userSelectSchema } from "../db/zod";

import { onStart } from "./onStart";
import { onSocials } from "./onSocials";
import { createSwapScene } from "./swapScene";
import { createGenerateScene } from "./generateScene";
import { getOrCreateUser } from "../modules/users/user.controller";

export const regiterBot = function (bot: Telegraf<any>) {
  const scenes = [createGenerateScene(), createSwapScene()];
  const stage = new Scenes.Stage<any>(scenes);

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
  bot.use(stage.middleware());

  bot.start(onStart);
  bot.action("generate", (context) => context.scene.enter("generate"));
  bot.command("generate", (context) => context.scene.enter("generate"));
  bot.action("swap", (context) => context.scene.enter("swap"));
  bot.command("swap", (context) => context.scene.enter("swap"));
  bot.command("socials", onSocials);

  bot.catch(console.error);
};
