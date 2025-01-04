import randomUserAgent from "random-useragent";
import axios, { type AxiosInstance } from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";

import { JobAPI } from "./job.api";

export class MukeApi {
  private readonly axios: AxiosInstance;

  readonly job: JobAPI;

  constructor(args?: {
    baseURL?: string;
    source?: string;
    referer?: string;
    productCode?: string;
    productSerial?: string;
    TE?: string;
  }) {
    const defaults = {
      baseURL: process.env.MUKE_BASE_URL!,
      source: process.env.MUKE_SOURCE!,
      userAgent: randomUserAgent.getRandom(),
      productCode: process.env.MUKE_PRODUCT_CODE!,
      productSerial: process.env.MUKE_PRODUCT_SERIAL!,
      referer: process.env.MUKE_REFERER!,
      TE: process.env.MUKE_TE,
    };

    const { referer, productCode, productSerial, userAgent, baseURL } = {
      ...defaults,
      ...args,
    };

    const httpsAgent = new HttpsProxyAgent(
      "http://spr4vkheds:gXmb2B09=lb8luHxUa@gate.smartproxy.com:10001"
    );

    this.axios = axios.create({
      httpsAgent,
      headers: {
        referer,
        "User-Agent": userAgent,
        "Product-Code": productCode,
        "Product-Serial": productSerial,
        "X-Forwarded-For": "136.0.147.61",
        "X-Host": "136.0.147.61",
        "X-Originating-IP": "136.0.147.61",
        "X-Client-IP": "136.0.147.61",
        "X-Remote-Addr": "136.0.147.61",
        Host: baseURL.replace(/^(http|https):\/\//, ""),
      },
    });

    this.job = new JobAPI(this.axios);
  }
}
