import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  allRoleAuthorization,
  coachAndAdminAuthorization,
} from "../middlewares/authMiddlewares";

import { ApiError, ApiResponse } from "../../types";
import { BadRequestError, NotFoundError } from "openai";
import {
  createQuestionForFreeLesson,
  createQuestionForPaidLesson,
  deleteQuestion,
  getAllQuestionsByFreeLessonId,
  getAllQuestionsByPaidLessonId,
  getQuestionById,
  updateQuestionForFreeLesson,
  updateQuestionForPaidLesson,
} from "../services/questionService";
import { questionCreateSchema, questionUpdateSchema } from "../db/schema/question";

export const questionRoutes = new Hono();

questionRoutes.get(
  "/paid-lesson/:lessonId",
  allRoleAuthorization,
  async (c) => {
    try {
      const questionId = Number.parseInt(c.req.param("lessonId"));
      const questions = await getAllQuestionsByPaidLessonId(questionId);

      return c.json(questions);
    } catch (error) {
      if (error instanceof BadRequestError) {
        return c.json(new ApiError(400, error.name, error.message), 400);
      }
      if (error instanceof NotFoundError) {
        return c.json(new ApiError(404, error.name, error.message), 404);
      }
      if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

questionRoutes.get(
  "/free-lesson/:lessonId",
  allRoleAuthorization,
  async (c) => {
    try {
      const questionId = Number.parseInt(c.req.param("lessonId"));
      const questions = await getAllQuestionsByFreeLessonId(questionId);

      return c.json(questions);
    } catch (error) {
      if (error instanceof BadRequestError) {
        return c.json(new ApiError(400, error.name, error.message), 400);
      }
      if (error instanceof NotFoundError) {
        return c.json(new ApiError(404, error.name, error.message), 404);
      }
      if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

questionRoutes.get(
  "/:id",
  allRoleAuthorization,
  async (c) => {
    try {
      const questionId = Number.parseInt(c.req.param("id"));
      const question = await getQuestionById(questionId);

      return c.json(question);
    } catch (error) {
      if (error instanceof BadRequestError) {
        return c.json(new ApiError(400, error.name, error.message), 400);
      }
      if (error instanceof NotFoundError) {
        return c.json(new ApiError(404, error.name, error.message), 404);
      }
      if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

questionRoutes.post(
  "/free-lesson",
  coachAndAdminAuthorization,
  zValidator("json", questionCreateSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");
      await createQuestionForFreeLesson(data);

      return c.json(new ApiResponse(200, "Question created successfully"));
    } catch (error) {
      if (error instanceof BadRequestError) {
        return c.json(new ApiError(400, error.name, error.message), 400);
      }
      if (error instanceof NotFoundError) {
        return c.json(new ApiError(404, error.name, error.message), 404);
      }
      if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

questionRoutes.post(
  "/paid-lesson",
  coachAndAdminAuthorization,
  zValidator("json", questionCreateSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");
      await createQuestionForPaidLesson(data);

      return c.json(new ApiResponse(200, "Question created successfully"));
    } catch (error) {
      if (error instanceof BadRequestError) {
        return c.json(new ApiError(400, error.name, error.message), 400);
      }
      if (error instanceof NotFoundError) {
        return c.json(new ApiError(404, error.name, error.message), 404);
      }
      if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

questionRoutes.patch(
  "/free-lesson/:id",
  coachAndAdminAuthorization,
  zValidator("json", questionUpdateSchema),
  async (c) => {
    try {
      const questionId = Number.parseInt(c.req.param("id"));
      const data = c.req.valid("json");
      await updateQuestionForFreeLesson(questionId, data);

      return c.json(new ApiResponse(200, "Question updated successfully"));
    } catch (error) {
      if (error instanceof BadRequestError) {
        return c.json(new ApiError(400, error.name, error.message), 400);
      }
      if (error instanceof NotFoundError) {
        return c.json(new ApiError(404, error.name, error.message), 404);
      }
      if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

questionRoutes.patch(
  "/paid-lesson/:id",
  coachAndAdminAuthorization,
  zValidator("json", questionUpdateSchema),
  async (c) => {
    try {
      const questionId = Number.parseInt(c.req.param("id"));
      const data = c.req.valid("json");
      await updateQuestionForPaidLesson(questionId, data);

      return c.json(new ApiResponse(200, "Question updated successfully"));
    } catch (error) {
      if (error instanceof BadRequestError) {
        return c.json(new ApiError(400, error.name, error.message), 400);
      }
      if (error instanceof NotFoundError) {
        return c.json(new ApiError(404, error.name, error.message), 404);
      }
      if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

questionRoutes.delete("/:id", coachAndAdminAuthorization, async (c) => {
  try {
    const questionId = Number.parseInt(c.req.param("id"));
    await deleteQuestion(questionId);

    return c.json(new ApiResponse(200, "Question deleted successfully"));
  } catch (error) {
    if (error instanceof BadRequestError) {
      return c.json(new ApiError(400, error.name, error.message), 400);
    }
    if (error instanceof NotFoundError) {
      return c.json(new ApiError(404, error.name, error.message), 404);
    }
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});
