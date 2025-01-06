import axios from "axios";

import { ApiImpl } from "../apiImpl";
import type { ConfirmedUpload, Response, Upload } from "./models";

export class UploadApi extends ApiImpl {
  protected path: string = "/api/v1/resource/";

  uploadImageByPreSign(args: {
    category: number;
    content_type: string;
    file_name: string;
    file_size: number;
    hash_val: string;
  }) {
    return this.axios.post<Upload>(
      this.buildPath("uploadImageByPreSign"),
      args
    );
  }

  uploadImage(uri: string, file: File | Buffer) {
    const headers = {
      Host: "upload2.api.seaart.me",
      "Content-Type": "image/jpg",
      "Content-Length": file instanceof File ? file.length : file.byteLength,
      "Accept-Encoding": "gzip, deflate, br, zstd",
    };

    return axios.put(uri, file, { headers });
  }

  confirmImageUploadedByPreSign(args: { category: number; file_id: string }) {
    return this.axios.post<Response<ConfirmedUpload>>(
      this.buildPath("confirmImageUploadedByPreSign"),
      args
    );
  }
}
