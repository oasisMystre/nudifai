import type { Context } from "telegraf";

import { db } from "../db";
import { AnakinApi } from "../lib/anakin";
import { createThread } from "../modules/threads/thread.controller";
import { cleanText } from "./utils/formatText";

export const onMessage = async (
  context: Context,
  next: () => Promise<void>
) => {
  const message = context.message;
  if (message && "text" in message) {
    const isCommand = /^\//.test(message.text);
    if (isCommand) return next();
    console.log(message.text)

    await context.sendChatAction("typing");

    console.log(message.text)

    const anakin = new AnakinApi();
    const { content, threadId, ...data } = await anakin.chatbot
      .sendMessage({
        appId: "36900",
        content: message.text,
        threadId: context.thread?.threadId,
      })
      .then(({ data }) => data);
      console.log(data)


    const [thread] = await createThread(db, {
      id: String(context.from!.id),
      threadId: threadId,
    });

    if (thread) context.thread = thread;

    return context.replyWithMarkdownV2(cleanText(content));
  }
};
 