export const format = <
  T extends Array<string | number | object | null | undefined>
>(
  delimiter: string,
  ...values: T
) => {
  return String(
    values.reduce(
      (result, value) =>
        String(result).replace(/(%|%d|%s)/, value ? value.toString() : ""),
      delimiter
    )
  );
};

export const sleep = (duration: number) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(void 0), duration);
  });
