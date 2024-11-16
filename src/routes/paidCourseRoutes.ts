import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  allRoleAuthorization,
  coachAndAdminAuthorization,
  userAuthorization,
} from "../middlewares/authMiddlewares";
import {
  ApiError,
  ApiResponse,
  BadRequestError,
  NotFoundError,
} from "../../types";
import {
  paidCourseCreateSchema,
  paidCourseUpdateSchema,
} from "../db/schema/paid_course";
import {
  createPaidCourse,
  deletePaidCourse,
  getPaidCourseById,
  getPaidCourseForUser,
  updatePaidCourse,
  updatePaidCourseThumbnail,
} from "../services/paidCourseService";
import { getAllFreeCourse } from "../services/courseService";

export const paidCourseRoutes = new Hono();

/**
 * POST: /paid-courses
 */
paidCourseRoutes.post(
  "",
  coachAndAdminAuthorization,
  zValidator("json", paidCourseCreateSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");
      await createPaidCourse(data);

      return c.json(new ApiResponse(200, "Paid course created successfully"));
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
 * GET: /paid-courses
 */
paidCourseRoutes.get("", allRoleAuthorization, async (c) => {
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
 * GET: /paid-courses/:id
 */
paidCourseRoutes.get("/:id", coachAndAdminAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const result = await getPaidCourseById(id);

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
 * GET: /paid-courses/:course_id/user/:user_id
 */
paidCourseRoutes.get(
  "/:course_id/user/:user_id",
  userAuthorization,
  async (c) => {
    try {
      const course_id = Number.parseInt(c.req.param("course_id"));
      const user_id = Number.parseInt(c.req.param("user_id"));
      const result = await getPaidCourseForUser(course_id, user_id);

      return c.json(result);
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
 * PATCH: /paid-courses/:id
 */
paidCourseRoutes.patch(
  "/:id",
  coachAndAdminAuthorization,
  zValidator("json", paidCourseUpdateSchema),
  async (c) => {
    try {
      const id = Number.parseInt(c.req.param("id"));
      const data = c.req.valid("json");
      const result = await updatePaidCourse(id, data);

      return c.json(
        new ApiResponse(200, "Paid course updated successfully", result)
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
 * PATCH: /paid-courses/thumbnail/:id
 */
paidCourseRoutes.patch(
  "/thumbnail/:id",
  coachAndAdminAuthorization,
  async (c) => {
    try {
      const id = Number.parseInt(c.req.param("id"));
      const formData = await c.req.formData();
      const file = formData.get("image") as File;

      const result = await updatePaidCourseThumbnail(id, file);

      return c.json(
        new ApiResponse(200, "Paid course updated successfully", result)
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
 * DELETE: /paid-courses/:id
 */
paidCourseRoutes.delete("/:id", coachAndAdminAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    await deletePaidCourse(id);

    return c.json(new ApiResponse(200, "Paid course deleted successfully"));
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(new ApiError(404, error.name, error.message), 404);
    }
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});
