import type { StatusCode } from "hono/utils/http-status";

export type ApiResponse = {
  status: StatusCode;
  data?: Object | Object[];
  msg?: Error | string;
};
