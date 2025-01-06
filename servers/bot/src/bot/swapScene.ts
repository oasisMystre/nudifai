import path from "path";
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
        // const chat = await context.replyWithAnimation(
        //   Input.fromLocalFile("./assets/loading.gif"),
        //   {
        //     caption: "> This might take up to a minute to generate\\.",
        //     parse_mode: "MarkdownV2",
        //   }
        // );

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
              const {
                data: { pre_sign, file_id },
              } = await seaart.upload
                .uploadImageByPreSign({
                  content_type: file.type,
                  category: 16,
                  file_name: file.name,
                  file_size: file.size,
                  hash_val: seaartHashVal,
                })
                .then(({ data }) => data);

              await seaart.upload.uploadImage(pre_sign, file);

              return seaart.upload
                .confirmImageUploadedByPreSign({
                  category: 16,
                  file_id,
                })
                .then(({ data }) => data);
            })
          );

          if (!face.data) return context.reply(face.status.msg);
          if (!template.data) return context.reply(template.status.msg);

          const task = await seaart.create
            .create({
              action: 22,
              meta: {
                exchange_face: {
                  face_distance: 1.5,
                  source_uri: face.data.url,
                  target_uri: template.data.url,
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

          for (const result of results) {
            // await context.deleteMessage(chat.message_id);
            await context.replyWithPhoto(Input.fromURL(result));
          }
        })(context, next).catch(async (error) => {
          console.error(error);
          // await context.deleteMessage(chat.message_id);
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
