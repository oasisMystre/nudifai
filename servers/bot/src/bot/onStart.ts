import { Context, Markup, Scenes, type Telegraf } from "telegraf";

import { readFileSync } from "./utils/formatText";

export const onStart = (context: Context) => {
  const message = readFileSync("./src/bot/locales/en/start.md");
  return context.replyWithMarkdownV2(
    message,
    Markup.inlineKeyboard([
      [
        Markup.button.callback("Nudify", "generate"),
        Markup.button.callback("Face Swap", "swap"),
      ],
      [
        Markup.button.url(
          "Naughty 🥵🍆 AI GirlFriend",
          "https://t.me/nudify_ai_girlfriend_bot"
        ),
      ],
      [Markup.button.callback("Video (Coming Soon)", "video")],
    ])
  );
};
