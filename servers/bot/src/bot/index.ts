import { type Context, Scenes, session, type Telegraf } from "telegraf";

import { db } from "../db";
import type { userSelectSchema } from "../db/zod";

import { onStart } from "./onStart";
import { createSwapScene } from "./swapScene";
import { catchRuntimeError } from "./utils/atomic";
import { createGenerateScene } from "./generateScene";
import { getOrCreateUser } from "../modules/users/user.controller";

export const registerBot = function (bot: Telegraf<Scenes.WizardContext>) {
  const scenes = [createGenerateScene(), createSwapScene()];
  scenes.map((scene) =>
    scene.command("cancel", async (context: any) => {
      await onStart(context);
      return context.scene.leave();
    })
  );
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

  bot.start(catchRuntimeError(onStart));
  bot.action("generate", (context) => context.scene.enter("generate"));
  bot.command("generate", (context) => context.scene.enter("generate"));
  bot.action("swap", (context) => context.scene.enter("swap"));
  bot.command("swap", (context) => context.scene.enter("swap"));

  bot.catch(console.error);
};
