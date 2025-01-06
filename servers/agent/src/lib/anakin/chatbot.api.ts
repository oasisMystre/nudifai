import { ApiImpl } from "../apiImpl";

export default class ChatBotApi extends ApiImpl {
  protected path: string = "/v1/chatbots/";

  sendMessage({
    appId,
    ...args
  }: {
    appId: string;
    content: string;
    threadId?: string | null;
  }) {
    return this.xior.post<{ content: string; threadId: string }>(
      this.buildPath(appId, "messages"),
      { ...args, stream: false }
    );
  }
}
