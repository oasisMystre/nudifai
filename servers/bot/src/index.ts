import "dotenv/config";
import { type Scenes, Telegraf } from "telegraf";
import cors from "@fastify/cors";
import fastify, { type FastifyRequest } from "fastify";

import { registerBot } from "./bot";
import { telegramAccessToken } from "./env";

async function main() {
  const bot = new Telegraf<Scenes.WizardContext>(telegramAccessToken);
  const server = fastify({
    logger: true,
    ignoreDuplicateSlashes: true,
    ignoreTrailingSlash: true,
  });

  server.register(cors, {
    origin: [/127.0.0.1/, /localhost/],
  });

  registerBot(bot);

  const tasks = [];

  if ("RENDER_EXTERNAL_HOSTNAME" in process.env) {
    const webhook = await bot.createWebhook({
      domain: process.env.RENDER_EXTERNAL_HOSTNAME!,
    });
    server.post(
      "/telegraf/" + bot.secretPathComponent(),
      webhook as unknown as (request: FastifyRequest) => void
    );
  } else tasks.push(bot.launch());

  tasks.push(
    server.listen({
      host: process.env.HOST,
      port: process.env.PORT ? Number(process.env.PORT!) : undefined,
    })
  );

  process.on("SIGINT", () => {
    bot.stop("SIGINT");
    return server.close();
  });
  process.on("SIGTERM", () => {
    bot.stop("SIGTERM");
    return server.close();
  });

  return await Promise.all(tasks);
}

main();
