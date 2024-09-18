import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
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
      const userId = await createUser(data);

      return c.json({ msg: "User created successfully:", userId });
    } catch (error) {
      c.status(500);
      return c.json({
        msg: "Something went wrong, please try again",
        error: error,
      });
    }
  }
);

/**
 * GET: /users/:id
 */
userRoutes.get("/:id", async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const user = await getUser(id);
    if (user === null) {
      return c.text(`User with id ${id} not found`, 404);
    }

    return c.json(user);
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
 * PATCH: /users/:id
 */
userRoutes.patch("/:id", zValidator("json", userUpdateSchema), async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const data = c.req.valid("json");
    const user = await updateUser(id, data);
    if (user === null) {
      return c.text(`User with id ${id} not found`, 404);
    }

    return c.json(user);
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
 * PATCH: /users/:id/password
 */
userRoutes.patch(
  "/:id/password",
  zValidator("json", userPasswordSchema),
  async (c) => {
    try {
      const id = Number.parseInt(c.req.param("id"));
      const data = c.req.valid("json");
      const user = await updateUserPassword(id, data);
      if (user === null) {
        return c.text(`User with id ${id} not found`, 404);
      } else if (user === false) {
        return c.text("Incorrect password", 400);
      }

      return c.text("Password updated successfully");
    } catch (error) {
      return c.json(
        {
          msg: "Something went wrong, please try again",
          error: error,
        },
        500
      );
    }
  }
);
