import xior, { XiorInstance } from "xior";
import ChatBotApi from "./chatbot.api";

export class AnakinApi {
  private readonly xior: XiorInstance;

  readonly chatbot: ChatBotApi;

  constructor(token: string = process.env.ANAKIN_API_KEY!) {
    this.xior = xior.create({
      baseURL: "https://api.anakin.ai",
      headers: {
        Authorization: "Bearer " + token,
        "X-Anakin-Api-Version": "2024-05-06",
      },
    });

    this.chatbot = new ChatBotApi(this.xior);
  }
}
