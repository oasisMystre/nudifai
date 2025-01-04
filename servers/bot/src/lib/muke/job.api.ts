import FormData from "form-data";
import { ReadStream } from "fs";

import { ApiImpl } from "../apiImpl";
import type { Job } from "./models";

export class JobAPI extends ApiImpl {
  protected path = "https://api.muke.ai/api/muke/sexy-portrait/";

  createJob(
    args: {
      image_file: File | ReadStream;
      style_name: string;
      negative_prompt: string;
      num_steps: number;
      style_strength_ratio: number;
      num_outputs: number;
      guidance_scale: number;
      width: number;
      height: number;
      prompt: string;
    }[]
  ) {
    const formData = new FormData();
    for (const arg of args)
      for (const [key, value] of Object.entries(arg))
        formData.append(
          key,
          value instanceof File || value instanceof ReadStream
            ? value
            : String(value)
        );
    formData.append("style_strength_ratio", "50");
    formData.append("width", 512);
    formData.append("height", 1024);

    return this.axios.post<{
      code: number;
      result: Omit<Job["result"], "output_image_url">;
      message: Job["message"];
    }>(this.buildPath("create-job"), formData, {
      headers: { ...formData.getHeaders() },
    });
  }

  getJob(id: string) {
    return this.axios.get<Job>(this.buildPath("get-job", id));
  }
}
