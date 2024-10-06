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
import { ApiError, ApiResponse } from "../../types";
import {
  createFreeCourse,
  deleteFreeCourse,
  getAllFreeCourse,
  getFreeCourse,
  updateFreeCourse,
} from "../services/courseService";

export const courseRoutes = new Hono();

/**
 * POST: /course/free
 */
courseRoutes.post(
  "/free",
  coachAndAdminAuthorization,
  zValidator("json", freeCourseCreateSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");
      const result = await createFreeCourse(data);

      return c.json(
        new ApiResponse(200, "Free course created successfully", result)
      );
    } catch (error) {
      if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

/**
 * GET: /course/free
 */
courseRoutes.get("/free/dfd", coachAndAdminAuthorization, async (c) => {
  try {
    const result = await getAllFreeCourse();
    return c.json(new ApiResponse(200, `All free course`, result));
  } catch (error) {
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});

/**
 * GET: /course/free/:id
 */
courseRoutes.get("/free/:id", coachAndAdminAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const result = await getFreeCourse(id);
    if (result === null) {
      return c.json(
        new ApiResponse(400, `Free course with ${id} not found`),
        400
      );
    }

    return c.json(new ApiResponse(200, `Free course with id ${id}`, result));
  } catch (error) {
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});

/**
 * PATCH: /course/free/:id
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

      if (result === null) {
        return c.json(
          new ApiResponse(400, `Free course with ${id} not found`),
          400
        );
      }

      return c.json(
        new ApiResponse(200, "Free course updated successfully", result)
      );
    } catch (error) {
      if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

/**
 * DELETE: /course/free/:id
 */
courseRoutes.delete("/free/:id", coachAndAdminAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const result = await deleteFreeCourse(id);

    if (result === null) {
      return c.json(
        new ApiResponse(400, `Free course with ${id} not found`),
        400
      );
    }

    return c.json(new ApiResponse(200, "Free course deleted successfully"));
  } catch (error) {
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});
