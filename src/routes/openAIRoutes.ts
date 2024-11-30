import { Hono } from "hono";
import {
  generateQuizQuestionsForFreeLesson,
  generateQuizQuestionsForPaidLesson,
} from "../services/openAiService";
import {
  coachAndAdminAuthorization,
  coachAuthorization,
} from "../middlewares/authMiddlewares";
import {
  ApiError,
  ApiResponse,
  BadRequestError,
  NotFoundError,
  type Variables,
} from "../../types";

export const openAIRoutes = new Hono<{ Variables: Variables }>();

openAIRoutes.post("/free-lesson/:id/generate-quiz", async (c) => {
  try {
    const lessonId = Number.parseInt(c.req.param("id"));
    await generateQuizQuestionsForFreeLesson(lessonId);

    return c.json(new ApiResponse(200, "Questions created successfully"));
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    return c.json(500);
  }
});

openAIRoutes.post(
  "/paid-lesson/:id/generate-quiz",
  coachAuthorization,
  async (c) => {
    try {
      const lessonId = Number.parseInt(c.req.param("id"));
      const coachId = c.get("coachId");
      await generateQuizQuestionsForPaidLesson(lessonId, coachId);

      return c.json(new ApiResponse(200, "Questions created successfully"));
    } catch (error) {
      console.error("Error generating quiz questions:", error);
      return c.json(500);
    }
  }
);
