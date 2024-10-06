import app from "./app";
import { redisClient } from "./src/db";

Bun.serve({
  port: 3000,
  hostname: "localhost",
  fetch: app.fetch,
});
