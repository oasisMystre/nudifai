// @ts-expect-error
import cookie from "cookie-parse";
import axios, { type AxiosInstance } from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import * as AxiosLogger from "axios-logger";

import { TaskApi } from "./task.api";
import { GenerateApi } from "./generate.api";
import { UploadApi } from "./upload.api";
import { CreateApi } from "./create.api";

export class SeaArtApi {
  axios: AxiosInstance;
  readonly task: TaskApi;
  readonly upload: UploadApi;
  readonly create: CreateApi;
  readonly generate: GenerateApi;

  constructor(args?: { Cookie: string; proxyURL: string }) {
    const defaultArgs = {
      Cookie: process.env.SEAART_COOKIE!,
      proxyURL: process.env.PROXY_URL!,
    };
    const { Cookie, proxyURL } = { ...defaultArgs, ...args };

    const parse = cookie.parse(Cookie);

    const httpsAgent = new HttpsProxyAgent(proxyURL);

    this.axios = axios.create({
      baseURL: "https://www.seaart.ai/",
      httpsAgent,
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

    this.axios.interceptors.response.use(
      AxiosLogger.responseLogger,
      AxiosLogger.errorLogger
    );

    this.task = new TaskApi(this.axios);
    this.upload = new UploadApi(this.axios);
    this.create = new CreateApi(this.axios);
    this.generate = new GenerateApi(this.axios);
  }
}
