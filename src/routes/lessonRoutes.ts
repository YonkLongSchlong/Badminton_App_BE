import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  adminAuthorization,
  allRoleAuthorization,
  coachAndAdminAuthorization,
} from "../middlewares/authMiddlewares";
import {
  ApiError,
  ApiResponse,
  BadRequestError,
  NotFoundError,
} from "../../types";
import {
  freeLessonCreateSchema,
  freeLessonUpdateSchema,
} from "../db/schema/free_lesson";
import {
  createFreeLesson,
  deleteFreeLesson,
  getFreeLessonById,
  updateFreeLesson,
  uploadImageFreeLesson,
  uploadVideoFreeLesson,
} from "../services/lessonService";

export const lessonRoute = new Hono();

/**
 * POST: /lessons/free/image
 */
lessonRoute.patch("/free/image", coachAndAdminAuthorization, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("image") as File;

    const result = await uploadImageFreeLesson(file);

    return c.json(new ApiResponse(200, "Image uploaded successfully", result));
  } catch (error) {
    if (error instanceof BadRequestError) {
      return c.json(new ApiError(400, error.name, error.message), 400);
    }
    if (error instanceof NotFoundError) {
      return c.json(new ApiError(404, error.name, error.message), 404);
    }
    if (error instanceof Error) {
      console.log(error.message);
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});

/**
 * POST: /lessons/free/video
 */
lessonRoute.patch("/free/video", coachAndAdminAuthorization, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("video") as File;

    const result = await uploadVideoFreeLesson(file);

    return c.json(new ApiResponse(200, "Video uploaded successfully", result));
  } catch (error) {
    if (error instanceof BadRequestError) {
      return c.json(new ApiError(400, error.name, error.message), 400);
    }
    if (error instanceof NotFoundError) {
      return c.json(new ApiError(404, error.name, error.message), 404);
    }
    if (error instanceof Error) {
      console.log(error.message);
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});

/**
 * POST: /lessons/free
 */
lessonRoute.post(
  "/free",
  adminAuthorization,
  zValidator("json", freeLessonCreateSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");
      await createFreeLesson(data);

      return c.json(new ApiResponse(200, "Lesson created successfully"));
    } catch (error) {
      if (error instanceof BadRequestError) {
        return c.json(new ApiError(400, error.name, error.message), 400);
      } else if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

/**
 * GET: /lessons/free/:id
 */
lessonRoute.get("/free/:id", allRoleAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const result = await getFreeLessonById(id);

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
 * PATCH: /lessons/free/:id
 */
lessonRoute.patch(
  "/free/:id",
  adminAuthorization,
  zValidator("json", freeLessonUpdateSchema),
  async (c) => {
    try {
      const id = Number.parseInt(c.req.param("id"));
      const data = c.req.valid("json");
      const result = await updateFreeLesson(id, data);

      return c.json(
        new ApiResponse(200, "Free lesson updated successfully", result)
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
 * DELETE: /lessons/free/:id
 */
lessonRoute.delete("/free/:id", adminAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    await deleteFreeLesson(id);

    return c.json(new ApiResponse(200, "Free lesson deleted successfully"));
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(new ApiError(404, error.name, error.message), 404);
    }
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});
