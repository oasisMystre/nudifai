import { Context, Markup, Scenes, type Telegraf } from "telegraf";

import { readFileSync } from "./utils/formatText";

export const onSocials = (context: Context) => {
  const message = readFileSync("./src/bot/locales/en/socials.md");
  return context.replyWithMarkdownV2(message);
};
