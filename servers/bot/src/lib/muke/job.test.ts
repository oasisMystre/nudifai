// import assert from "assert";
// import { createReadStream } from "fs";

// import { MukeApi } from ".";
// import settings from "../../../assets/settings.json";
// import { spawn } from "../../spawn";
// import { XiorError } from "xior";

// describe("test muke api endpoint", () => {
//   let muke: MukeApi = new MukeApi();

//   it("should create a new job", async () => {
//     const image_file = createReadStream("./assets/image.jpg");
//     let data = await muke.job
//       .createJob([
//         {
//           image_file,
//           style_name: settings.defaultStyle,
//           negative_prompt: settings.negativePrompt,
//           num_steps: settings.numSteps,
//           style_strength_ratio: settings.styleStrengthRatio,
//           num_outputs: settings.numOutputs,
//           guidance_scale: settings.guidanceScale,
//           width: 512,
//           height: 1024,
//           prompt: "A woman img. " + settings.scene[0][2].prompt,
//         },
//       ])
//       .then(({ data, request }) => {
//         console.log(request.headers);
//         return data;
//       })
//       .catch((error) => {
//         console.log(error)
//         if (error instanceof XiorError) 
//           console.log(error.response?.data);
        
//         return null;
//       });

//     assert.notEqual(data, null);
//     console.log(data);
//     // if (data) {
//     //   data = await muke.job
//     //     .getJob(data.result.job_id)
//     //     .then(({ data }) => data)
//     //     .catch(() => null);
//     //   assert.notEqual(data, null);
//     // }
//   });

//   // it("should spawn and get a job", async () => {
//   //   spawn({
//   //     jobId: "741d5a1a-1c0b-4a56-b657-f95f9af20855",
//   //     chatId: "",
//   //   }).then(console.log);
//   // });
// });
