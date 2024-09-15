import app from "./app";

Bun.serve({
  port: 3000,
  hostname: "localhost",
  fetch: app.fetch,
});
