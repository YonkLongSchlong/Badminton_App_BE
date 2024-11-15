import { Hono } from "hono";
import { adminAuthorization } from "../middlewares/authMiddlewares";
import {
  createAdmin,
  deleteUser,
  getAllCoaches,
  getAllUsers,
  deleteCoach,
  updateAdminAvatar,
  updateAdmin,
} from "../services/adminService";
import { zValidator } from "@hono/zod-validator";
import { adminCreateSchema, adminUpdateSchema } from "../db/schema/admin";
import {
  ApiError,
  ApiResponse,
  BadRequestError,
  NotFoundError,
} from "../../types";

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
      await createAdmin(data);

      return c.json(new ApiResponse(200, "Admin created successfully"));
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
 * PATCH: /admin/avatar/:id
 */
adminRoutes.patch("/avatar/:id", adminAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const formData = await c.req.formData();
    const file = formData.get("image") as File;

    const result = await updateAdminAvatar(id, file);

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
 * PATCH: /admin/:id
 */
adminRoutes.patch(
  "/:id",
  adminAuthorization,
  zValidator("json", adminUpdateSchema),
  async (c) => {
    try {
      const id = Number.parseInt(c.req.param("id"));
      const data = c.req.valid("json");
      const result = await updateAdmin(id, data);

      return c.json(new ApiResponse(200, "Admin updated successfully", result));
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
    await deleteUser(id);

    return c.json(new ApiResponse(200, `User deleted successfully`));
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
    const result = await deleteCoach(id);

    if (result === null) {
      return c.json(new ApiResponse(404, `Coach with id ${id} not found`), 404);
    }

    return c.json(new ApiResponse(200, `Coach deleted successfully`, result));
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(new ApiError(404, error.name, error.message), 404);
    }
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});
