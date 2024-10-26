import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  allRoleAuthorization,
  coachAndAdminAuthorization,
} from "../middlewares/authMiddlewares";
import {
  freeCourseCreateSchema,
  freeCourseUpdateSchema,
} from "../db/schema/free_course";
import {
  ApiError,
  ApiResponse,
  BadRequestError,
  NotFoundError,
} from "../../types";
import {
  createFreeCourse,
  deleteFreeCourse,
  getAllFreeCourse,
  getFreeCourse,
  updateFreeCourse,
} from "../services/courseService";

export const courseRoutes = new Hono();

/**
 * POST: /courses/free
 */
courseRoutes.post(
  "/free",
  coachAndAdminAuthorization,
  zValidator("json", freeCourseCreateSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");
      await createFreeCourse(data);

      return c.json(new ApiResponse(200, "Free course created successfully"));
    } catch (error) {
      if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

/**
 * GET: /courses/free
 */
courseRoutes.get("/free", allRoleAuthorization, async (c) => {
  try {
    const result = await getAllFreeCourse();
    return c.json(new ApiResponse(200, `All free course`, result));
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
 * GET: /courses/free/:id
 */
courseRoutes.get("/free/:id", allRoleAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const result = await getFreeCourse(id);

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
 * PATCH: /courses/free/:id
 */
courseRoutes.patch(
  "/free/:id",
  coachAndAdminAuthorization,
  zValidator("json", freeCourseUpdateSchema),
  async (c) => {
    try {
      const id = Number.parseInt(c.req.param("id"));
      const data = c.req.valid("json");
      const result = await updateFreeCourse(id, data);

      return c.json(
        new ApiResponse(200, "Free course updated successfully", result)
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
 * DELETE: /courses/free/:id
 */
courseRoutes.delete("/free/:id", coachAndAdminAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    await deleteFreeCourse(id);

    return c.json(new ApiResponse(200, "Free course deleted successfully"));
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(new ApiError(404, error.name, error.message), 404);
    }
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});
