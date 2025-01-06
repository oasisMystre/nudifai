export type Apply = {
  data: {
    id: string;
  };
};

export type ApplyArgs = {
  apply_id: string;
  inputs: { field: string; node_id: string; node_type: string; val: string }[];
};
