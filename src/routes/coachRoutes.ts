import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  createCoach,
  getCoach,
  updateCoach,
  updateCoachAvatar,
  updateCoachPassword,
} from "../services/coachService";
import {
  coachCreateSchema,
  coachUpdateSchema,
  coachPasswordSchema,
} from "../db/schema/coach";
import {
  ApiError,
  ApiResponse,
  BadRequestError,
  NotFoundError,
} from "../../types";
import {
  allRoleAuthorization,
  coachAuthorization,
} from "../middlewares/authMiddlewares";
import { getAllCoaches } from "../services/adminService";

export const coachRoutes = new Hono();

/**
 * POST: /coaches/register
 */
coachRoutes.post(
  "/register",
  zValidator("json", coachCreateSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");
      await createCoach(data);

      return c.json(new ApiResponse(200, "Coach account created successfully"));
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
 * GET: /coaches/:id
 */
coachRoutes.get("/:id", coachAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const result = await getCoach(id);

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
 * GET: /coaches
 */
coachRoutes.get("", allRoleAuthorization, async (c) => {
  try {
    const result = await getAllCoaches();

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
 * PATCH: /coaches/:id
 */
coachRoutes.patch(
  "/:id",
  coachAuthorization,
  zValidator("json", coachUpdateSchema),
  async (c) => {
    try {
      const id = Number.parseInt(c.req.param("id"));
      const data = c.req.valid("json");
      const result = await updateCoach(id, data);

      return c.json(new ApiResponse(200, "Coach updated successfully", result));
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

/**
 * PATCH: /coaches/avatar/:id
 */
coachRoutes.patch("/avatar/:id", coachAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const formData = await c.req.formData();
    const file = formData.get("image") as File;

    const result = await updateCoachAvatar(id, file);

    return c.json(new ApiResponse(200, "Avatar updated successfully", result));
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
 * PATCH: /coaches/:id/password
 */
coachRoutes.patch(
  "/:id/password",
  coachAuthorization,
  zValidator("json", coachPasswordSchema),
  async (c) => {
    try {
      const id = Number.parseInt(c.req.param("id"));
      const data = c.req.valid("json");
      await updateCoachPassword(id, data);

      return c.json(new ApiResponse(200, "Password updated successfully"));
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
