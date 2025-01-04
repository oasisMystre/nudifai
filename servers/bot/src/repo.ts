import { Telegraf } from "telegraf";
import { telegramAccessToken } from "./env";

export const bot = new Telegraf(telegramAccessToken);
