// @ts-expect-error
import cookie from "cookie-parse";
import axios, { type AxiosInstance } from "axios";

import { TaskApi } from "./task.api";
import { GenerateApi } from "./generate.api";
import { UploadApi } from "./upload.api";

export class SeaArtApi {
  axios: AxiosInstance;
  readonly task: TaskApi;
  readonly upload: UploadApi;
  readonly generate: GenerateApi;

  constructor(args?: { Cookie: string }) {
    const defaultArgs = {
      Cookie: process.env.SEAART_COOKIE!,
    };
    const { Cookie } = { ...defaultArgs, ...args };

    const parse = cookie.parse(Cookie);

    this.axios = axios.create({
      baseURL: "https://www.seaart.ai/",
      headers: {
        Cookie: Cookie,
        Token: parse.T,
        host: "www.seaart.ai",
        "X-Timezone": "Africa/Lagos",
        origin: "https://www.seaart.ai",
        "X-App-Id": "web_global_seaart",
        "X-Device-Id": parse.deviceId,
        "X-Browser-Id": parse.browserId,
        "X-Eyes": true,
        "X-Page-Id": parse.pageId,
        "X-Request-Id": parse.requestid,
      },
    });

    this.task = new TaskApi(this.axios);
    this.upload = new UploadApi(this.axios);
    this.generate = new GenerateApi(this.axios);
  }
}
