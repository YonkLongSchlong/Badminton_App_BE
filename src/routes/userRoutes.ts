import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  createUser,
  getUser,
  updateUser,
  updateUserAvatar,
  updateUserPassword,
} from "../services/userService";
import {
  userAvatarSchema,
  userCreateSchema,
  userPasswordSchema,
  userUpdateSchema,
} from "../db/schema/user";
import {
  ApiError,
  ApiResponse,
  BadRequestError,
  NotFoundError,
} from "../../types";
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
      await createUser(data);

      return c.json(new ApiResponse(200, "User created successfully"));
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
 * GET: /users/:id
 */
userRoutes.get("/:id", userAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const user = await getUser(id);

    return c.json(user);
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

      return c.json(new ApiResponse(200, "Profile updated successfully", result));
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
 * PATCH: /users/avatar/:id
 */
userRoutes.patch(
  "/avatar/:id",
  userAuthorization,
  async (c) => {
    try {
     const id = Number.parseInt(c.req.param("id"));
     const formData = await c.req.formData();
     const file = formData.get("image") as File;

      const result = await updateUserAvatar(id, file);

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
      await updateUserPassword(id, data);

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
