import { ApiImpl } from "../apiImpl";
import { Response } from "./models";
import { Create, CreateArgs } from "./models/create.model";

export class CreateApi extends ApiImpl {
  protected path: string = "/api/v1/task/";

  create(args: CreateArgs) {
    return this.axios.post<Response<Create>>(this.buildPath("create"), args);
  }
}
