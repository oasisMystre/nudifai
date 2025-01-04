import axios from "axios";
import { Context, Input, Telegraf } from "telegraf";

import { db } from "../db";
import { spawn } from "../spawn";
import atomic from "./utils/atomic";
import { SeaArtApi } from "../lib/seaart";
import { userSelectSchema } from "../db/zod";
import { seaartHashVal, seaartApplyId } from "../env";
import { createJob } from "../modules/job/job.controller";

import { cleanText } from "./utils/formatText";
import { uploadImageMessage } from "./generateScene";

export const onPhoto = (
  bot: Telegraf<Context & { user?: Zod.infer<typeof userSelectSchema> }>
) => {
  bot.on("photo", async (context, next) => {
    const message = context.message;

    if (message && "photo" in message) {
      const chat = await context.replyWithAnimation(
        Input.fromLocalFile("./assets/loading.gif"),
        {
          caption: "> This might take up to a minute to generate\\.",
          parse_mode: "MarkdownV2",
        }
      );

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
          await context.deleteMessage(chat.message_id);
          await context.replyWithPhoto(Input.fromURL(result));
        }
      })(context, next).catch(async (error) => {
        console.error(error);
        await context.deleteMessage(chat.message_id);
        return context.replyWithMarkdownV2(cleanText(String(error)));
      });
    }

    return uploadImageMessage(context);
  });
};
