import { Hono } from "hono";
import { adminAuthorization } from "../middlewares/authMiddlewares";
import {
  createAdmin,
  deleteUser,
  getAllCoaches,
  getAllUsers,
} from "../services/adminService";
import { zValidator } from "@hono/zod-validator";
import { adminCreateSchema } from "../db/schema/admin";
import { ApiError, ApiResponse } from "../../types";

export const adminRoutes = new Hono();

/**
 * POST: /admin/register
 */
adminRoutes.post(
  "/register",
  zValidator("json", adminCreateSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");
      const result = await createAdmin(data);

      return c.json(new ApiResponse(200, "Admin created successfully", result));
    } catch (error) {
      if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

/**
 * GET: /admin/users
 */
adminRoutes.get("/users", adminAuthorization, async (c) => {
  try {
    const users = await getAllUsers();

    return c.json(users);
  } catch (error) {
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});

/**
 * DELETE: /admin/user/:id
 */
adminRoutes.delete("/user/:id", adminAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const result = await deleteUser(id);

    if (result === null) {
      return c.json(new ApiResponse(404, `User with id ${id} not found`), 404);
    }

    return c.json(new ApiResponse(200, `User deleted successfully`, result));
  } catch (error) {
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});

/**
 * GET: /admin/coaches
 */
adminRoutes.get("/coaches", adminAuthorization, async (c) => {
  try {
    const coaches = await getAllCoaches();
    return c.json(coaches);
  } catch (error) {
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});

/**
 * DELETE: /admin/coach/:id
 */
adminRoutes.delete("/coach/:id", adminAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const result = await deleteUser(id);

    if (result === null) {
      return c.json(new ApiResponse(404, `Coach with id ${id} not found`), 404);
    }

    return c.json(new ApiResponse(200, `Coach deleted successfully`, result));
  } catch (error) {
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});
