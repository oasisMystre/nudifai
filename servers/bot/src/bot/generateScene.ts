import axios from "axios";
import crypto from "crypto";
import { Composer, Input, Scenes } from "telegraf";

import { db } from "../db";
import { spawn } from "../spawn";
import { seaartApplyId } from "../env";
import { SeaArtApi } from "../lib/seaart";
import { createJob } from "../modules/job/job.controller";

import { format } from "../lib/utils";
import { cleanText } from "./utils/formatText";
import { readFileSync } from "./utils/formatText";
import atomic, { catchRuntimeError } from "./utils/atomic";

type Session = {} & Scenes.WizardSessionData;

export type Context = Scenes.WizardContext<Session>;

export const createGenerateScene = () => {
  const composer = new Composer<Context>();
  composer.on(
    "photo",
    catchRuntimeError(async (context, next) => {
      const message = context.message;

      await atomic(async () => {
        const [photo] = await Promise.all(
          message.photo
            .slice(message.photo.length - 1)
            .map((photo) => context.telegram.getFile(photo.file_id))
        );

        const link = await context.telegram.getFileLink(photo);
        const blob = await axios
          .get<ArrayBuffer>(link.toString(), { responseType: "arraybuffer" })
          .then(({ data }) => data);

        const file = new File([blob], "image.jpg", { type: "image/jpg" });
        const seaart = new SeaArtApi();
        const {
          data: { data },
        } = await seaart.upload.uploadImageByPreSign({
          category: 20,
          content_type: "image/jpg",
          file_name: "image.jpg",
          file_size: photo.file_size!,
          hash_val: crypto.randomBytes(32).toString("hex"),
        });

        let asset: string;

        if ("pre_sign" in data) {
          const { pre_sign, file_id } = data;
          await seaart.upload.uploadImage(pre_sign, file);

          const response = await seaart.upload
            .confirmImageUploadedByPreSign({
              category: 20,
              file_id,
            })
            .then(({ data }) => data);
          asset = response.data.url;
        } else asset = data.img_url;

        const task = await seaart.generate
          .apply({
            apply_id: seaartApplyId,
            inputs: [
              {
                field: "image",
                node_id: "1",
                node_type: "LoadImage",
                val: asset,
              },
            ],
          })
          .then(({ data }) => data);

        await createJob(db, {
          uuid: task.data.id,
          user: context.user!.id,
          result: null,
        });

        const results = await spawn<string[]>({
          task_ids: [task.data.id],
        });

        for (const result of results)
          await context.replyWithPhoto(Input.fromURL(result));

        return seaart.task.delete({ ids: [task.data.id] });
      })(context, next).catch(async (error) => {
        console.error(error);
        return context.replyWithMarkdownV2(
          format("`%`", cleanText(String(error)))
        );
      });

      await context.scene.leave();
    })
  );

  return new Scenes.WizardScene(
    "generate",
    catchRuntimeError(async (context) => {
      const message = readFileSync("./src/bot/locales/en/uploadImage.md", "utf-8");
      await context.replyWithMarkdownV2(message);
      return context.wizard.next();
    }),
    composer
  );
};
