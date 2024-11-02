import { Hono } from "hono";
import { logger } from "hono/logger";
import { userRoutes } from "./src/routes/userRoutes";

import { adminRoutes } from "./src/routes/adminRoutes";
import { authRoute } from "./src/routes/authRoutes";
import { coachRoutes } from "./src/routes/coachRoutes";
import { courseRoutes } from "./src/routes/courseRoutes";
import { categoryRoutes } from "./src/routes/categoryRoutes";
import { lessonRoute } from "./src/routes/lessonRoutes";

const app = new Hono().basePath("/api/v1");

app.use(logger());

app
  .route("/users", userRoutes)
  .route("/coaches", coachRoutes)
  .route("/admin", adminRoutes)
  .route("/auth", authRoute)
  .route("/courses", courseRoutes)
  .route("/lessons", lessonRoute)
  .route("/categories", categoryRoutes);

export default app;
