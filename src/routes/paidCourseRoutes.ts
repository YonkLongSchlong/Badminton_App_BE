import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  adminAuthorization,
  allRoleAuthorization,
  coachAndAdminAuthorization,
  coachAuthorization,
  userAuthorization,
} from "../middlewares/authMiddlewares";
import {
  ApiError,
  ApiResponse,
  BadRequestError,
  NotFoundError,
  type Variables,
} from "../../types";
import {
  paidCourseCreateSchema,
  paidCourseUpdateSchema,
} from "../db/schema/paid_course";
import {
  createPaidCourse,
  deletePaidCourse,
  getAllPaidCourse,
  getPaidCourseByCategoryId,
  getPaidCourseByCoachId,
  getPaidCourseById,
  getPaidCourseForUser,
  updatePaidCourse,
  updatePaidCourseThumbnail,
} from "../services/paidCourseService";
import { coach } from "../db/schema";

export const paidCourseRoutes = new Hono<{ Variables: Variables }>();

/**
 * POST: /paid-courses
 */
paidCourseRoutes.post(
  "",
  coachAuthorization,
  zValidator("json", paidCourseCreateSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");
      await createPaidCourse(data);

      return c.json(new ApiResponse(200, "Paid course created successfully"));
    } catch (error) {
      if (error instanceof BadRequestError) {
        console.log(error);
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
    const result = await getAllPaidCourse();
    return c.json(new ApiResponse(200, `All paid course`, result));
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(new ApiError(404, error.name, error.message), 404);
    }
    if (error instanceof Error) {
      console.log(error);
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
      console.log(error);
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});

/**
 * GET: /paid-courses/category/:id
 */
paidCourseRoutes.get("/category/:id", allRoleAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const result = await getPaidCourseByCategoryId(id);

    return c.json(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(new ApiError(404, error.name, error.message), 404);
    }
    if (error instanceof Error) {
      console.log(error);
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});

/**
 * GET: /paid-courses/coach/:id
 */
paidCourseRoutes.get("/coach/:id", coachAndAdminAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const result = await getPaidCourseByCoachId(id);

    return c.json(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(new ApiError(404, error.name, error.message), 404);
    }
    if (error instanceof Error) {
      console.log(error);
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});

/**
 * GET: /paid-courses/:course_id/user
 */
paidCourseRoutes.get("/:course_id/user", userAuthorization, async (c) => {
  try {
    const course_id = Number.parseInt(c.req.param("course_id"));
    const userId = c.get("userId");
    const result = await getPaidCourseForUser(course_id, userId);

    return c.json(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(new ApiError(404, error.name, error.message), 404);
    }
    if (error instanceof Error) {
      console.log(error);
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});

/**
 * PATCH: /paid-courses/:id
 */
paidCourseRoutes.patch(
  "/:id",
  coachAuthorization,
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
        console.log(error);
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

/**
 * PATCH: /paid-courses/thumbnail/:id
 */
paidCourseRoutes.patch("/thumbnail/:id", coachAuthorization, async (c) => {
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
      console.log(error);
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});

/**
 * DELETE: /paid-courses/:id
 */
paidCourseRoutes.delete("/:id", coachAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    await deletePaidCourse(id);

    return c.json(new ApiResponse(200, "Paid course deleted successfully"));
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(new ApiError(404, error.name, error.message), 404);
    }
    if (error instanceof Error) {
      console.log(error);
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});
