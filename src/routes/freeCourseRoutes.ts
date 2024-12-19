import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  adminAuthorization,
  allRoleAuthorization,
  userAuthorization,
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
  type Variables,
} from "../../types";
import {
  createFreeCourse,
  deleteFreeCourse,
  getAllFreeCourse,
  getFreeCourseByCategoryId,
  getFreeCourseById,
  getFreeCourseByIdUser,
  updateFreeCourse,
  updateFreeCourseThumbnail,
} from "../services/freeCourseService";
import { HTTPException } from "hono/http-exception";

export const freeCourseRoutes = new Hono<{ Variables: Variables }>();

/**
 * POST: /free-course
 */
freeCourseRoutes.post(
  "",
  adminAuthorization,
  zValidator("json", freeCourseCreateSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");
      await createFreeCourse(data);

      return c.json(new ApiResponse(200, "Free course created successfully"));
    } catch (error) {
      if (error instanceof BadRequestError) {
        return c.json(new ApiError(400, error.name, error.message), 400);
      }
      if (error instanceof HTTPException) {
        return c.json(new ApiError(401, error.name, error.message), 403);
      }
      if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

/**
 * GET: /free-course
 */
freeCourseRoutes.get("", allRoleAuthorization, async (c) => {
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
 * GET: /free-course/:id
 */
freeCourseRoutes.get("/:id", allRoleAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const result = await getFreeCourseById(id);

    return c.json(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(new ApiError(404, error.name, error.message), 404);
    }
    if (error instanceof HTTPException) {
      return c.json(new ApiError(401, error.name, error.message), 403);
    }
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});

/**
 * GET: /free-course/:id/user
 */
freeCourseRoutes.get("/:id/user", userAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const userId = c.get("userId");
    const result = await getFreeCourseByIdUser(id, userId);

    return c.json(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(new ApiError(404, error.name, error.message), 404);
    }
    if (error instanceof HTTPException) {
      return c.json(new ApiError(401, error.name, error.message), 403);
    }
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});

/**
 * GET: /free-course/category/:id
 */
freeCourseRoutes.get("category/:id", allRoleAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const result = await getFreeCourseByCategoryId(id);

    return c.json(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(new ApiError(404, error.name, error.message), 404);
    }
    if (error instanceof HTTPException) {
      return c.json(new ApiError(401, error.name, error.message), 403);
    }
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});

/**
 * PATCH: /free-course/:id
 */
freeCourseRoutes.patch(
  "/:id",
  adminAuthorization,
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
      if (error instanceof HTTPException) {
        return c.json(new ApiError(401, error.name, error.message), 403);
      }
      if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

/**
 * PATCH: /free-course/thumbnail/:id
 */
freeCourseRoutes.patch("/thumbnail/:id", adminAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const formData = await c.req.formData();
    const file = formData.get("image") as File;

    const result = await updateFreeCourseThumbnail(id, file);

    return c.json(
      new ApiResponse(200, "Free course updated successfully", result)
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(new ApiError(404, error.name, error.message), 404);
    }
    if (error instanceof HTTPException) {
      return c.json(new ApiError(401, error.name, error.message), 403);
    }
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});

/**
 * DELETE: /free-course/:id
 */
freeCourseRoutes.delete("/:id", adminAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    await deleteFreeCourse(id);

    return c.json(new ApiResponse(200, "Free course deleted successfully"));
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(new ApiError(404, error.name, error.message), 404);
    }
    if (error instanceof HTTPException) {
      return c.json(new ApiError(401, error.name, error.message), 403);
    }
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});
