import { Context } from "telegraf";
import { readFileSync } from "./utils/formatText";

export const uploadImageMessage = (context: Context) => {
  const message = readFileSync("./src/bot/locales/en/uploadImage.md");
  return context.replyWithMarkdownV2(message);
};
