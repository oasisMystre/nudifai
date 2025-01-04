import { AxiosError } from "axios";
import { parentPort, workerData } from "worker_threads";

import { db } from "./db";
import { sleep } from "./lib/utils";
import { SeaArtApi } from "./lib/seaart";
import { updateJobByUuid } from "./modules/job/job.controller";

export type Job = {
  task_ids: string[];
};

async function worker({
  job: { task_ids },
  options,
}: {
  job: Job;
  options?: { maxRetries?: number; retryInterval?: number };
}) {
  const defaultOptions = { maxRetries: Infinity, retryInterval: 10000 };
  const { maxRetries, retryInterval } = { ...defaultOptions, ...options };

  const seaart = new SeaArtApi();

  const job = async (retryCount = 0) => {
    if (retryCount > maxRetries) return null;

    const data = await seaart.task
      .batchProgress({ task_ids })
      .then(({ data }) => data)
      .catch((error) => {
        if (error instanceof AxiosError) return null;
        return Promise.reject(error);
      });

    if (data) return data;
    else {
      await sleep(retryInterval / 2);
      return job(retryCount + 1);
    }
  };

  while (true) {
    const data = await job().catch((error) => {
      parentPort?.postMessage({ error, data: null });
      return null;
    });

    const allResolved = data?.data?.items.every((item) => item.img_uris);

    if (data && allResolved) {
      const result = await Promise.all(
        data.data.items
          .map(async (items) =>
            updateJobByUuid(db, items.task_id, {
              result: items.img_uris?.map((uri) => uri.url),
            })
          )
          .flat()
      );

      return parentPort?.postMessage({
        result: result
          .flat()
          .flatMap((result) => result.result)
          .filter(Boolean),
      });
    } else if (data === null) return;

    await sleep(retryInterval);
  }
}

worker(workerData);
