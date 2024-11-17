import { Hono } from "hono";
import {
  ApiError,
  ApiResponse,
  BadRequestError,
  NotFoundError,
  type Variables,
} from "../../types";
import {
  coachAndAdminAuthorization,
  userAuthorization,
} from "../middlewares/authMiddlewares";
import {
  paidLessonCreateSchema,
  paidLessonUpdateSchema,
} from "../db/schema/paid_lesson";
import { zValidator } from "@hono/zod-validator";
import {
  createPaidLesson,
  deletePaidLesson,
  getPaidLessonById,
  getPaidLessonForUser,
  updatePaidLesson,
  uploadImagePaidLesson,
} from "../services/lessonService";

const paidLessonRoutes = new Hono<{ Variables: Variables }>();

/**
 * POST: /paid-lessons
 */
paidLessonRoutes.post(
  "",
  coachAndAdminAuthorization,
  zValidator("json", paidLessonCreateSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");
      await createPaidLesson(data);

      return c.json(new ApiResponse(200, "Paid lesson created successfully"));
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
 * GET: /paid-lessons/:id
 */
paidLessonRoutes.get("/:id", coachAndAdminAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const coachId = c.get("coachId");
    const result = await getPaidLessonById(id, coachId);

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

/**
 * GET: /paid-lessons/:id/user
 */
paidLessonRoutes.get("/:id/user", userAuthorization, async (c) => {
  try {
    const course_id = Number.parseInt(c.req.param("id"));
    const userId = c.get("userId");
    const result = await getPaidLessonForUser(course_id, userId);

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

/**
 * PATCH: /paid-lessons/:id
 */
paidLessonRoutes.patch(
  "/:id",
  coachAndAdminAuthorization,
  zValidator("json", paidLessonUpdateSchema),
  async (c) => {
    try {
      const id = Number.parseInt(c.req.param("id"));
      const data = c.req.valid("json");
      const coachId = c.get("coachId");
      const result = await updatePaidLesson(id, coachId, data);

      return c.json(
        new ApiResponse(200, "Paid lesson updated successfully", result)
      );
    } catch (error) {
      if (error instanceof NotFoundError) {
        return c.json(new ApiError(404, error.name, error.message), 404);
      }
      if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

/**
 * PATCH: /paid-lessons/image
 */
paidLessonRoutes.patch("/:id/image", coachAndAdminAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const coachId = c.get("coachId");
    const formData = await c.req.formData();
    const file = formData.get("image") as File;

    const result = await uploadImagePaidLesson(id, file, coachId);

    return c.json(
      new ApiResponse(200, "Paid lesson updated successfully", result)
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(new ApiError(404, error.name, error.message), 404);
    }
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});

/**
 * DELETE: /paid-lessons/:id
 */
paidLessonRoutes.delete("/:id", coachAndAdminAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const coachId = c.get("coachId");
    await deletePaidLesson(id, coachId);

    return c.json(new ApiResponse(200, "Paid lesson deleted successfully"));
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(new ApiError(404, error.name, error.message), 404);
    }
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});
