import { Hono } from "hono";
import { ApiError, ApiResponse, NotFoundError } from "../../types";
import {
  allRoleAuthorization,
  userAuthorization,
} from "../middlewares/authMiddlewares";
import {
  createReview,
  deleteReview,
  getReviewByCourseId,
  updateReview,
} from "../services/reviewService";
import { zValidator } from "@hono/zod-validator";
import { reviewCreateSchema, reviewUpdateSchema } from "../db/schema/review";

export const reviewRoutes = new Hono();

/**
 * GET: /reviews/course/:course_id
 */
reviewRoutes.get("/course/:course_id", allRoleAuthorization, async (c) => {
  try {
    const courseId = Number.parseInt(c.req.param("course_id"));
    const result = await getReviewByCourseId(courseId);

    return c.json(new ApiResponse(200, `All reviews`, result));
  } catch (error) {
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
 * POST: /reviews
 */
reviewRoutes.post(
  "/",
  userAuthorization,
  zValidator("json", reviewCreateSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");
      const result = await createReview(data);

      return c.json(new ApiResponse(200, `Review created`, result));
    } catch (error) {
      if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

/**
 * PATCH: /reviews/:id
 */
reviewRoutes.patch(
  "/:id",
  userAuthorization,
  zValidator("json", reviewUpdateSchema),
  async (c) => {
    try {
      const id = Number.parseInt(c.req.param("id"));
      const data = c.req.valid("json");
      const result = await updateReview(id, data);

      return c.json(new ApiResponse(200, `Review created`, result));
    } catch (error) {
      if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

/**
 * DELETE: /reviews/:id
 */
reviewRoutes.delete("/:id", userAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const body = await c.req.json();

    const { courseId, userId } = body;

    const result = await deleteReview(
      id,
      Number.parseInt(courseId as string),
      Number.parseInt(userId as string)
    );

    return c.json(new ApiResponse(200, `Review created`, result));
  } catch (error) {
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});
