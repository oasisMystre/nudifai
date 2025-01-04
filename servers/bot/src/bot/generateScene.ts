import axios from "axios";
import { Input, Scenes } from "telegraf";

import { db } from "../db";
import { spawn } from "../spawn";
import { seaartApplyId, seaartHashVal } from "../env";
import { SeaArtApi } from "../lib/seaart";
import { cleanText, readFileSync } from "./utils/formatText";
import type { userSelectSchema } from "../db/zod";
import { createJob } from "../modules/job/job.controller";
import atomic from "./utils/atomic";

interface Session extends Scenes.WizardSessionData {
  files: File[];
  mode: "male" | "female";
}

export type Context = Scenes.WizardContext<Session> & {
  user?: Zod.infer<typeof userSelectSchema>;
};

export const generateScene = new Scenes.WizardScene<Context>(
  "generate",
  async (context) => {
    const message = readFileSync("./src/bot/locales/en/uploadImage.md");
    await context.replyWithMarkdownV2(message);

    return context.wizard.next();
  },
  async (context, next) => {
    const message = context.message;

    if (message && "photo" in message) {
      const chat = await context.replyWithAnimation(
        Input.fromLocalFile("./assets/loading.gif")
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

        return context.scene.leave();
      })(context, next).catch(async (error) => {
        console.log(error)
        await context.deleteMessage(chat.message_id);
        return context.replyWithMarkdownV2(cleanText(String(error)));
      });
    }
  }
);
