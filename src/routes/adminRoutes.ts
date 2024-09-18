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
      const adminId = await createAdmin(data);
      return c.json({ msg: "Admin created successfully:", adminId });
    } catch (error) {
      c.json(
        {
          msg: "Something went wrong, please try again",
          error: error,
        },
        500
      );
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
    return c.json(
      {
        msg: "Something went wrong, please try again",
        error: error,
      },
      500
    );
  }
});

/**
 * DELETE: /admin/user/:id
 */
adminRoutes.delete("/user/:id", adminAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const userId = await deleteUser(id);
    if (userId === null) {
      c.status(404);
      return c.text(`User with id ${id} not found`);
    }

    return c.json({ msg: "User deleted successfully:", userId });
  } catch (error) {
    c.status(500);
    return c.json({
      msg: "Something went wrong, please try again",
      error: error,
    });
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
    return c.json(
      {
        msg: "Something went wrong, please try again",
        error: error,
      },
      500
    );
  }
});

/**
 * DELETE: /admin/coach/:id
 */
adminRoutes.delete("/coach/:id", adminAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const coachId = await deleteUser(id);
    if (coachId === null) {
      return c.text(`Coach with id ${id} not found`, 404);
    }

    return c.json({ msg: "Coach deleted successfully:", coachId });
  } catch (error) {
    return c.json(
      {
        msg: "Something went wrong, please try again",
        error: error,
      },
      500
    );
  }
});
