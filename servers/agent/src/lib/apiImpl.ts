import { joinPath, XiorInstance } from "xior";

import { format } from "./utils";

export abstract class ApiImpl {
  protected abstract path: string;

  constructor(protected readonly xior: XiorInstance) {}

  protected buildPath(...path: (string | number)[]) {
    return joinPath(this.path, path.map(String).reduce(joinPath));
  }

  protected buildPathWithQueryString(path: string, query?: Record<string, any>) {
    const q = new URLSearchParams(query);
    return format("%?%", path, q.toString());
  }
}
