import { ApiImpl } from "../apiImpl";
import type { Response, Task, TaskArgs } from "./models";

export class TaskApi extends ApiImpl {
  protected path: string = "/api/v1/task/";

  batchProgress(args: TaskArgs) {
    return this.axios.post<Response<Task>>(
      this.buildPath("batch-progress"),
      args
    );
  }
}
