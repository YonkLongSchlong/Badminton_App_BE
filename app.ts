import { Hono } from "hono";
import { logger } from "hono/logger";
import { userRoutes } from "./src/routes/userRoutes";
import { coachRotes } from "./src/routes/coachRoutes";
import { adminRoutes } from "./src/routes/adminRoutes";
import { authRoute } from "./src/routes/authRoutes";

const app = new Hono().basePath("/api/v1");

app.use(logger());

app
  .route("/users", userRoutes)
  .route("/coach", coachRotes)
  .route("/admin", adminRoutes)
  .route("/auth", authRoute);

export default app;
