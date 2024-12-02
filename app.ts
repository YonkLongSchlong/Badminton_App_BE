import { Hono } from "hono";
import { logger } from "hono/logger";
import { userRoutes } from "./src/routes/userRoutes";

import { adminRoutes } from "./src/routes/adminRoutes";
import { authRoute } from "./src/routes/authRoutes";
import { coachRoutes } from "./src/routes/coachRoutes";
import { freeCourseRoutes } from "./src/routes/freeCourseRoutes";
import { categoryRoutes } from "./src/routes/categoryRoutes";
import { lessonRoute } from "./src/routes/lessonRoutes";
import { paidCourseRoutes } from "./src/routes/paidCourseRoutes";
import { orderRoutes } from "./src/routes/orderRoutes";
import { answerRoutes } from "./src/routes/answerRoutes";
import { questionRoutes } from "./src/routes/questionRoutes";
import { openAIRoutes } from "./src/routes/openAIRoutes";
import { reviewRoutes } from "./src/routes/reviewRoutes";

const app = new Hono().basePath("/api/v1");

app.use(logger());

app
  .route("/users", userRoutes)
  .route("/coaches", coachRoutes)
  .route("/admin", adminRoutes)
  .route("/auth", authRoute)
  .route("/free-courses", freeCourseRoutes)
  .route("/lessons", lessonRoute)
  .route("/categories", categoryRoutes)
  .route("/paid-courses", paidCourseRoutes)
  .route("/order", orderRoutes)
  .route("/answers", answerRoutes)
  .route("/questions", questionRoutes)
  .route("/openAI", openAIRoutes)
  .route("/reviews", reviewRoutes);

export default app;
