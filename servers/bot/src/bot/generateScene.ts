import axios from "axios";
import { Composer, Input, Scenes } from "telegraf";

import { db } from "../db";
import { spawn } from "../spawn";
import { SeaArtApi } from "../lib/seaart";
import { seaartHashVal, seaartApplyId } from "../env";
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
        await context.sendChatAction("typing");

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
          data: {
            data: { pre_sign, file_id },
          },
        } = await seaart.upload.uploadImageByPreSign({
          category: 20,
          content_type: "image/jpg",
          file_name: "image.jpg",
          file_size: photo.file_size!,
          hash_val: seaartHashVal,
        });

        await seaart.upload.uploadImage(pre_sign, file);

        const asset = await seaart.upload
          .confirmImageUploadedByPreSign({
            category: 20,
            file_id,
          })
          .then(({ data }) => data);

        if (!asset.data) return context.reply(asset.status.msg);

        const task = await seaart.generate
          .apply({
            apply_id: seaartApplyId,
            inputs: [
              {
                field: "image",
                node_id: "1",
                node_type: "LoadImage",
                val: asset.data.url,
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

        for (const result of results) {
          await context.replyWithPhoto(Input.fromURL(result));
        }
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
    async (context) => {
      const message = readFileSync("./src/bot/locales/en/uploadImage.md");
      await context.replyWithMarkdownV2(message);
      return context.wizard.next();
    },
    composer
  );
};
