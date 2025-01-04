import "dotenv/config";
import { Telegraf } from "telegraf";
import cors from "@fastify/cors";
import fastify, { type FastifyRequest } from "fastify";

import { regiterBot } from "./bot";
import { telegramAccessToken } from "./env";
import { SeaArtApi } from "lib/seaart";

async function main() {
  new SeaArtApi()
  const bot = new Telegraf(telegramAccessToken);
  const server = fastify({
    logger: true,
    ignoreDuplicateSlashes: true,
    ignoreTrailingSlash: true,
  });

  server.register(cors, {
    origin: [/127.0.0.1/, /localhost/],
  });

  regiterBot(bot);

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
