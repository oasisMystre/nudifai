export type Task = {
  data: {
    items: {
      task_id: string;
      type: number;
      sub_type: number;
      process: number;
      banner: string | null;
      status: number;
      status_desc: "processing";
      pub_artwork_no: string;
      pub_artwork_nos: string | null;
      nsfw: number;
      img_uris:
        | {
            width: number;
            height: number;
            url: string;
            nsfw: boolean;
            is_nsfw_plus: boolean;
            index: number;
            expiration_time: number;
            is_submit: boolean;
            is_saved_personal: boolean;
            rembg_x: number;
            rembg_y: number;
            node_key: string;
            sub_type: number;
          }[]
        | null;
      category: number;
      deduction_detail: {
        is_chargeable: boolean;
        hashrate: number;
        temp_hashrate: number;
        history_hashrate: boolean;
        after_hashrate: number;
        after_temp_hashrate: number;
        daily_task_count: number;
      };
      creativity: {
        id: string;
        type: number;
        name: string;
        node_num: number;
        node_types: null;
        cover: null;
        is_support_retry: false;
      };
      reason: number;
      total_num: number;
      current_num: number;
    }[];
  };
};

export type TaskArgs = {
  task_ids: string[];
};
