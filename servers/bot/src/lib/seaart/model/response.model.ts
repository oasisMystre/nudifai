export type Response<T> = T & {
  status: {
    code: number;
    msg: string;
    request_id: string;
  };
};
