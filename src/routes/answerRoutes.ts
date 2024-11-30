import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  allRoleAuthorization,
  coachAndAdminAuthorization,
} from "../middlewares/authMiddlewares";
import {
  createAnswer,
  deleteAnswer,
  getAllAnswerByQuestionId,
  updateAnswer,
} from "../services/answerService";
import { ApiError, ApiResponse } from "../../types";
import { BadRequestError, NotFoundError } from "openai";
import { answerCreateSchema, answerUpdateSchema } from "../db/schema/answer";

export const answerRoutes = new Hono();

answerRoutes.get("/:questionId", allRoleAuthorization, async (c) => {
  try {
    const questionId = Number.parseInt(c.req.param("questionId"));
    const answers = await getAllAnswerByQuestionId(questionId);

    return c.json(answers);
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

answerRoutes.post(
  "/",
  coachAndAdminAuthorization,
  zValidator("json", answerCreateSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");
      await createAnswer(data);

      return c.json(new ApiResponse(200, "Answer created successfully"));
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

answerRoutes.patch(
  "/:id",
  coachAndAdminAuthorization,
  zValidator("json", answerUpdateSchema),
  async (c) => {
    try {
      const answerId = Number.parseInt(c.req.param("id"));
      const data = c.req.valid("json");
      await updateAnswer(answerId, data);

      return c.json(new ApiResponse(200, "Answer updated successfully"));
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

answerRoutes.delete("/:id", coachAndAdminAuthorization, async (c) => {
  try {
    const answerId = Number.parseInt(c.req.param("id"));
    await deleteAnswer(answerId);

    return c.json(new ApiResponse(200, "Answer deleted successfully"));
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
