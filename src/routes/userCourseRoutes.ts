import { Hono } from "hono";
import {
  ApiError,
  ApiResponse,
  BadRequestError,
  NotFoundError,
  type Variables,
} from "../../types";
import {
  allRoleAuthorization,
  coachAndAdminAuthorization,
  coachAuthorization,
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
import {
  userCourseCreateSchema,
  userCourseUpdateSchema,
} from "../db/schema/user_course";
import {
  createUserCourse,
  getUserCourseByFreeCourseId,
  getUserCourseByPaidCourseId,
  getUserCourseByStatusFinished,
  getUserCourseByStatusOngoing,
  getUserCourseByUserId,
  updateUserCourseForFreeCourse,
  updateUserCourseForPaidCourse,
} from "../services/userCourseService";

export const userCourseRoutes = new Hono<{ Variables: Variables }>();

/**
 * POST: /user-course
 */
userCourseRoutes.post(
  "",
  allRoleAuthorization,
  zValidator("json", userCourseCreateSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");
      await createUserCourse(data);

      return c.json(new ApiResponse(200, "User course created successfully"));
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
 * GET: /user-course/user/:userId
 */
userCourseRoutes.get("/user/:userId", allRoleAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("userId"));
    const result = await getUserCourseByUserId(id);

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
 * GET: /user-course/free-course/:id
 */
userCourseRoutes.get("/free-course/:id", userAuthorization, async (c) => {
  try {
    const course_id = Number.parseInt(c.req.param("id"));
    const result = await getUserCourseByFreeCourseId(course_id);

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
 * GET: /user-course/paid-course/:id
 */
userCourseRoutes.get("/paid-course/:id", userAuthorization, async (c) => {
  try {
    const course_id = Number.parseInt(c.req.param("id"));
    const result = await getUserCourseByPaidCourseId(course_id);

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
 * GET: /user-course/finished/:userId
 */
userCourseRoutes.get("/finished/:id", userAuthorization, async (c) => {
  try {
    const course_id = Number.parseInt(c.req.param("id"));
    const result = await getUserCourseByStatusFinished(course_id);

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
 * GET: /user-course/ogoing/:userId
 */
userCourseRoutes.get("/ogoing/:id", userAuthorization, async (c) => {
  try {
    const course_id = Number.parseInt(c.req.param("id"));
    const result = await getUserCourseByStatusOngoing(course_id);

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
 * PATCH: /user-course/paid-course
 */
userCourseRoutes.patch(
  "/paid-course",
  userAuthorization,
  zValidator("json", userCourseUpdateSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");
      const result = await updateUserCourseForPaidCourse(data);

      return c.json(
        new ApiResponse(200, "User course updated successfully", result)
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
 * PATCH: /user-course/free-course
 */
userCourseRoutes.patch(
  "/free-course",
  userAuthorization,
  zValidator("json", userCourseUpdateSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");
      const result = await updateUserCourseForFreeCourse(data);

      return c.json(
        new ApiResponse(200, "User course updated successfully", result)
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
 * DELETE: /paid-lessons/:id
 */
userCourseRoutes.delete("/:id", coachAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    await deletePaidLesson(id);

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
