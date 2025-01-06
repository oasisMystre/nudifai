import { ApiImpl } from "../apiImpl";
import type { Apply, ApplyArgs, Response } from "./models";

export class GenerateApi extends ApiImpl {
  protected path: string = "api/v1/creativity/generate";

  apply(args: ApplyArgs) {
    return this.axios.post<Response<Apply>>(this.buildPath("apply"), args);
  }
}
