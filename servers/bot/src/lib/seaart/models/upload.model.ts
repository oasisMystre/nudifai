export type Upload = {
  data:
    | {
        img_status: number;
        file_id: string;
        pre_sign: string;
      }
    | { image_status: number; img_url: string };
};

export type ConfirmedUpload = {
  data: {
    file_id: string;
    url: string;
    video_info: null;
  };
};
