import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  authenticateUserRegister,
  createUser,
  getUser,
  updateUser,
  updateUserPassword,
} from "../services/userService";
import {
  userCreateSchema,
  userPasswordSchema,
  userUpdateSchema,
} from "../db/schema/user";
import { HTTPException } from "hono/http-exception";
import { DatabaseError } from "pg";
import { ApiError, ApiResponse } from "../../types";
import { DrizzleError } from "drizzle-orm";
import { userAuthorization } from "../middlewares/authMiddlewares";

export const userRoutes = new Hono();

/**
 * POST: /users/register
 */
userRoutes.post(
  "/register",
  zValidator("json", userCreateSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");
      const result = await authenticateUserRegister(data);
      if (result === false) {
        return c.json(
          new ApiResponse(400, "User with this email already exist"),
          400
        );
      }

      return c.json(new ApiResponse(200, "OTP sent to email successfully", result));
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
userRoutes.get("/:id", userAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const user = await getUser(id);
    if (user === null) {
      return c.json(new ApiResponse(404, `User with id ${id} not found`), 404);
    }

    return c.json(user);
  } catch (error) {
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});

/**
 * PATCH: /users/:id
 */
userRoutes.patch(
  "/:id",
  userAuthorization,
  zValidator("json", userUpdateSchema),
  async (c) => {
    try {
      const id = Number.parseInt(c.req.param("id"));
      const data = c.req.valid("json");
      const result = await updateUser(id, data);

      if (result === null) {
        return c.json(
          new ApiResponse(404, `User with id ${id} not found`),
          404
        );
      }

      if (result === false) {
        return c.json(
          new ApiResponse(400, "User with this email already exist"),
          400
        );
      }

      return c.json(new ApiResponse(200, "User updated successfully", result));
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
userRoutes.patch(
  "/:id/password",
  userAuthorization,
  zValidator("json", userPasswordSchema),
  async (c) => {
    try {
      const id = Number.parseInt(c.req.param("id"));
      const data = c.req.valid("json");
      const result = await updateUserPassword(id, data);

      if (result === null) {
        return c.json(
          new ApiResponse(404, `User with id ${id} not found`),
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
