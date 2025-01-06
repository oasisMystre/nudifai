export type Upload = {
  data: {
    img_status: number;
    file_id: string;
    pre_sign: string;
  };
};

export type ConfirmedUpload = {
  data: {
    file_id: string;
    url: string;
    video_info: null;
  };
};
