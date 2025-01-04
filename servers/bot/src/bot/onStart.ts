import { Markup, Scenes, type Telegraf } from "telegraf";

import { readFileSync } from "./utils/formatText";

export const onStart = (bot: Telegraf<Scenes.WizardContext>) => {
  bot.start((context) => {
    const message = readFileSync("./src/bot/locales/en/start.md");
    context.replyWithMarkdownV2(
      message,
      Markup.inlineKeyboard([Markup.button.callback("Generate", "generate")])
    );
  });

  bot.action("generate", (context) => context.scene.enter("generate"));
};
