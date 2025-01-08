import { Context, Markup } from "telegraf";

import { readFileSync } from "./utils/formatText";

export const onStart = (context: Context) => {
  const message = readFileSync("./src/bot/locales/en/start.md", "utf-8");
  return context.replyWithMarkdownV2(
    message,
    Markup.inlineKeyboard([
      [
        Markup.button.callback("🥵 Undress", "generate"),
        Markup.button.callback("Face Swap", "swap"),
      ],
      [Markup.button.callback("Video (Coming Soon)", "video")],
    ])
  );
};
