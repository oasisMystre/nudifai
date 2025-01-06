export type CreateArgs = {
  action: number;
  meta: {
    exchange_face: {
      face_distance: number;
      source_uri: string;
      target_uri: string;
    };
  };
  source: number;
  template_id: string;
};

export type Create = {
  data: {
    id: string;
    type: number;
    process: number;
    artwork_no: string;
    art_model_no: string;
    art_model_name: string;
    art_model_ver_no: string;
    base_model_name: string;
    meta: {
      extra_prompt: "";
      prompt: "";
      width: number;
      height: number;
      steps: 0;
      init_images: null;
      seed: 0;
      lora_models: null;
      hi_res_arg: null;
      smart_edit: null;
      guidance_scale: number;
      left_margin: number;
      up_margin: number;
      image: string;
      images: string[] | null;
      vae: "None";
      exchange_face: {
        face_distance: number;
        source_uri: string;
        target_uri: string;
      };
      refiner_mode: number;
      lcm_mode: number;
      emdeddings: null;
      generate: null;
    };
    local_prompt: string;
    status: number;
    status_dec: string;
    created_at: number;
    img_uris: string[] | null;
    reverse_prompts: null;
    reverse_local_prompts: null;
    channel_id: string;
    category: number;
    deduction_detail: null;
    pub_community: number;
    expiration_time: number;
    speed_type: number;
    banner: null;
    nsfw: number;
    pub_artwork_no: string;
    pub_artwork_nos: null;
    collect: null;
    preprocess_images: null;
  };
};
