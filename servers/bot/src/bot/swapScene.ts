import path from "path";
import crypto from "crypto";
import axios from "axios";
import mime from "mime-types";
import { Input, MiddlewareFn, Scenes } from "telegraf";

import { db } from "../db";
import { spawn } from "../spawn";
import { format } from "../lib/utils";
import { seaartHashVal } from "../env";
import { SeaArtApi } from "../lib/seaart";
import { userSelectSchema } from "../db/zod";
import { createJob } from "../modules/job/job.controller";

import { onStart } from "./onStart";
import { cleanText, readFileSync } from "./utils/formatText";
import atomic, { catchRuntimeError } from "./utils/atomic";

type Session = {
  files: string[];
} & Scenes.WizardSessionData;

export type Context = Scenes.WizardContext<Session> & {
  user?: Zod.infer<typeof userSelectSchema>;
};

export const createSwapScene = () => {
  return new Scenes.WizardScene<Context>(
    "swap",
    catchRuntimeError(async (context) => {
      context.scene.session.files = [];

      const message = readFileSync("./src/bot/locales/en/uploadTemplate.md");
      await context.replyWithMarkdownV2(message);

      return context.wizard.next();
    }),
    catchRuntimeError(async (context) => {
      const message = context.message;
      if (message && "photo" in message) {
        const [photo] = await Promise.all(
          message.photo
            .slice(message.photo.length - 1)
            .map((photo) => context.telegram.getFileLink(photo))
        );
        context.scene.session.files.push(photo.toString());

        await context.replyWithMarkdownV2(
          readFileSync("./src/bot/locales/en/uploadFace.md")
        );
        return context.wizard.next();
      }
    }),
    catchRuntimeError<Context, MiddlewareFn<Context>>(async (context, next) => {
      const message = context.message;
      if (message && "photo" in message) {
        await atomic(async () => {
          const [photo] = await Promise.all(
            message.photo
              .slice(message.photo.length - 1)
              .map((photo) => context.telegram.getFileLink(photo))
          );
          context.scene.session.files.push(photo.toString());

          const files = await Promise.all(
            context.scene.session.files.map((file) => {
              const mime_type = mime.contentType(path.extname(file));
              const content_type = mime_type ? mime_type : "image/jpg";

              return axios.get(file, { responseType: "arraybuffer" }).then(
                ({ data }) =>
                  new File([data], file.split(/\//).pop()!, {
                    type: content_type,
                  })
              );
            })
          );

          const seaart = new SeaArtApi();

          const [template, face] = await Promise.all(
            files.map(async (file) => {
              const { data } = await seaart.upload
                .uploadImageByPreSign({
                  content_type: file.type,
                  category: 16,
                  file_name: file.name,
                  file_size: file.size,
                  hash_val: crypto.randomBytes(32).toString("hex"),
                })
                .then(({ data }) => data);
              if ("pre_sign" in data) {
                const { pre_sign, file_id } = data;
                await seaart.upload.uploadImage(pre_sign, file);

                const {
                  data: { url },
                } = await seaart.upload
                  .confirmImageUploadedByPreSign({
                    category: 16,
                    file_id,
                  })
                  .then(({ data }) => data);

                return url;
              } else return data.img_url;
            })
          );

          const task = await seaart.create
            .create({
              action: 22,
              meta: {
                exchange_face: {
                  face_distance: 1.5,
                  source_uri: face,
                  target_uri: template,
                },
              },
              source: 17100,
              template_id: "",
            })
            .then(({ data }) => data);

          await createJob(db, {
            uuid: task.data.id,
            user: context.user!.id,
            result: null,
          });

          const results = await spawn<string[]>({ task_ids: [task.data.id] });

          for (const result of results)
            await context.replyWithPhoto(Input.fromURL(result));

          return seaart.task.delete({ ids: [task.data.id] });
        })(context, next).catch(async (error) => {
          console.error(error);
          return context.replyWithMarkdownV2(
            format("`%`", cleanText(String(error)))
          );
        });
      }

      await context.scene.leave();

      return onStart(context);
    })
  );
};
