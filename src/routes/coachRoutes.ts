import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  getCoach,
  updateCoach,
  updateCoachPassword,
  authenticateCoachRegister
} from "../services/coachService";
import {
  coachCreateSchema,
  coachUpdateSchema,
  coachPasswordSchema,
} from "../db/schema/coach";
import { ApiError, ApiResponse } from "../../types";
import { coachAuthorization } from "../middlewares/authMiddlewares";

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
      const result = await authenticateCoachRegister(data);
      if (result === false) {
        return c.json(
          new ApiResponse(400, "User with this email already exist"),
          400
        );
      }

      return c.json(new ApiResponse(200, "OTP sent successfully", result));
    } catch (error) {
      if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

/**
 * GET: /users/:id
 */
coachRoutes.get("/:id", coachAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const result = await getCoach(id);
    if (result === null) {
      return c.json(new ApiResponse(404, `Coach with id ${id} not found`), 404);
    }

    return c.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});

/**
 * PATCH: /users/:id
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

      if (result === null) {
        return c.json(
          new ApiResponse(404, `Coach with id ${id} not found`),
          404
        );
      }

      if (result === false) {
        return c.json(
          new ApiResponse(400, "Coach with this email already exist"),
          400
        );
      }

      return c.json(new ApiResponse(200, "Coach updated successfully", result));
    } catch (error) {
      if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

/**
 * PATCH: /users/:id/password
 */
coachRoutes.patch(
  "/:id/password",
  coachAuthorization,
  zValidator("json", coachPasswordSchema),
  async (c) => {
    try {
      const id = Number.parseInt(c.req.param("id"));
      const data = c.req.valid("json");
      const result = await updateCoachPassword(id, data);

      if (result === null) {
        return c.json(
          new ApiResponse(404, `Coach with id ${id} not found`),
          404
        );
      } else if (result === false) {
        return c.json(new ApiResponse(400, `Incorrect password`), 400);
      }

      return c.json(new ApiResponse(200, "Password updated successfully"));
    } catch (error) {
      if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);
