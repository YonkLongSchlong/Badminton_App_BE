import { Hono } from "hono";
import type { Variables } from "hono/types";
import {
  allRoleAuthorization,
  userAuthorization,
} from "../middlewares/authMiddlewares";
import { ApiError, ApiResponse } from "../../types";
import { BadRequestError, NotFoundError } from "openai";
import {
  createUserLessonFreeLesson,
  createUserLessonPaidLesson,
  getUserLessons,
  updateUserLessonFreeLesson,
  updateUserLessonPaidLesson,
} from "../services/userLessonService";
import { zValidator } from "@hono/zod-validator";
import {
  userLessonCreateSchema,
  userLessonUpdateSchema,
} from "../db/schema/user_lesson";

export const userLessonRoutes = new Hono<{ Variables: Variables }>();

/**
 * POST: /user-lesson/paid-lesson
 */
userLessonRoutes.post(
  "/paid-lesson",
  zValidator("json", userLessonCreateSchema),
  userAuthorization,
  async (c) => {
    try {
      const data = c.req.valid("json");
      await createUserLessonPaidLesson(data);

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
 * POST: /user-lesson/free-lesson
 */
userLessonRoutes.post(
  "/free-lesson",
  zValidator("json", userLessonCreateSchema),
  userAuthorization,
  async (c) => {
    try {
      const data = c.req.valid("json");
      await createUserLessonFreeLesson(data);

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
 * PATCH: /user-lesson/free-lesson
 */
userLessonRoutes.patch(
  "/free-lesson",
  zValidator("json", userLessonUpdateSchema),
  userAuthorization,
  async (c) => {
    try {
      const data = c.req.valid("json");
      await updateUserLessonFreeLesson(data);

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
 * PATCH: /user-lesson/paid-lesson
 */
userLessonRoutes.patch(
  "/paid-lesson",
  zValidator("json", userLessonUpdateSchema),
  userAuthorization,
  async (c) => {
    try {
      const data = c.req.valid("json");
      await updateUserLessonPaidLesson(data);

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
 * POST: /user-lesson/:userId
 */
userLessonRoutes.get("/:userId", allRoleAuthorization, async (c) => {
  try {
    const userId = Number.parseInt(c.req.param("userId"));
    const { courseType, courseId } = await c.req.json();

    const result = await getUserLessons(userId, courseId, courseType);

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
