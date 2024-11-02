import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  ApiError,
  ApiResponse,
  BadRequestError,
  NotFoundError,
} from "../../types";
import {
  adminAuthorization,
  allRoleAuthorization,
} from "../middlewares/authMiddlewares";
import {
  categoryCreateSchema,
  categoryUpdateSchema,
} from "../db/schema/category";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "../services/categoryService";

export const categoryRoutes = new Hono();

/**
 * POST: /categories
 */
categoryRoutes.post(
  "/",
  adminAuthorization,
  zValidator("json", categoryCreateSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");
      await createCategory(data);

      return c.json(new ApiResponse(200, "Category created successfully"));
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
 * GET: /categories
 */
categoryRoutes.get("/", allRoleAuthorization, async (c) => {
  try {
    const user = await getAllCategories();

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
 * GET: /categories/:id
 */
categoryRoutes.get("/:id", allRoleAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const category = await getCategoryById(id);

    return c.json(category);
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
categoryRoutes.patch(
  "/:id",
  adminAuthorization,
  zValidator("json", categoryUpdateSchema),
  async (c) => {
    try {
      const id = Number.parseInt(c.req.param("id"));
      const data = c.req.valid("json");
      await updateCategory(id, data);

      return c.json(new ApiResponse(200, "Category updated successfully"));
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
