import path from "path";
import { existsSync } from "fs";
import { Worker } from "worker_threads";

import { format } from "./lib/utils";
import type { Job } from "./worker";

export function spawn<T>(job: Job): Promise<T> {
  return new Promise((resolve, reject) => {
    const workerFile = existsSync(path.join(__dirname, "/worker.ts"))
      ? "./worker.ts"
      : "./worker.js";

    const worker = new Worker(path.join(__dirname, workerFile), {
      workerData: { job, options: { maxRetries: 8 } },
    });

    worker.on("message", (result) => {
      if (result.error) reject(result.error);
      else resolve(result.result);
    });

    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code === 0) return;
      reject(new Error(format("worker stopped with exit code %" + code)));
    });
  });
}
