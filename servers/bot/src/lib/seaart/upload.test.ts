import crypto from "crypto";
import { SeaArtApi } from ".";

describe("Test seaart upload api", () => {
  const seaart = new SeaArtApi();

  it("should upload a file", async () => {
    const { data } = await seaart.upload.uploadImageByPreSign({
      category: 20,
      content_type: "image/jpg",
      file_name: "file_4.jpg",
      file_size: 25338,
      hash_val: crypto.randomBytes(32).toString("hex"),
    });

    console.log(JSON.stringify(data, undefined, 2));

    //     await seaart.upload
    //       .uploadImage(pre_sign, readFileSync("./assets/file.jpg"))
    //       .catch((error) => {
    //         console.log(error);
    //         if (error instanceof AxiosError) console.log(error.response?.data);
    //       });

    //     console.log(JSON.stringify(args, undefined, 2));
    //   });

    //   it("should fetch a file", async () => {
    //     const data = await seaart.upload
    //       .confirmImageUploadedByPreSign({
    //         category: 20,
    //         file_id: "5d0099a3-f2cb-4437-a55b-654d5f8f88fd",
    //       })
    //    awa   .then(({ data }) => data);

    //     console.log(data);
  });
});
