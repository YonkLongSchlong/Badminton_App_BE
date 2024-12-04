import { Hono } from "hono";
import type { Variables } from "hono/types";
import { userAuthorization } from "../middlewares/authMiddlewares";
import { ApiError, ApiResponse } from "../../types";
import { BadRequestError, NotFoundError } from "openai";
import {
  createUserFreeLesson,
  createUserPaidLesson,
  getUserLessons,
} from "../services/userLessonService";

export const userLessonRoutes = new Hono<{ Variables: Variables }>();

/**
 * POST: /user-lesson/paid-lesson/:userId/:lessonId
 */
userLessonRoutes.post(
  "/paid-lesson/:userId/:lessonId",
  userAuthorization,
  async (c) => {
    try {
      const lessonId = Number.parseInt(c.req.param("lessonId"));
      const userId = Number.parseInt(c.req.param("userId"));
      await createUserPaidLesson(userId, lessonId);

      return c.json(new ApiResponse(200, "User_lesson created successfully"));
    } catch (error) {
      if (error instanceof BadRequestError) {
        return c.json(new ApiError(400, error.name, error.message), 400);
      }
      if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

/**
 * POST: /user-lesson/free-lesson/:userId/:lessonId
 */
userLessonRoutes.post(
  "/free-lesson/:userId/:lessonId",
  userAuthorization,
  async (c) => {
    try {
      const lessonId = Number.parseInt(c.req.param("lessonId"));
      const userId = Number.parseInt(c.req.param("userId"));
      await createUserFreeLesson(userId, lessonId);

      return c.json(new ApiResponse(200, "User_lesson created successfully"));
    } catch (error) {
      if (error instanceof BadRequestError) {
        return c.json(new ApiError(400, error.name, error.message), 400);
      }
      if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

/**
 * GET: /user-lesson/:userId
 */
userLessonRoutes.get("/:userId/:lessonId", userAuthorization, async (c) => {
  try {
    const userId = Number.parseInt(c.req.param("userId"));
    const lessonId = Number.parseInt(c.req.param("lessonId"));
    const result = await getUserLessons(userId, lessonId);

    return c.json(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(new ApiError(404, error.name, error.message), 404);
    }
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});
