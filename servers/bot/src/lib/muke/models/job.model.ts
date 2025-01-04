export type Job = {
  code: number;
  result: {
    job_id: string;
    output_image_url: string[];
    input_image_url: string[];
  };
  message: {
    en: string;
    zh: string;
  };
};
