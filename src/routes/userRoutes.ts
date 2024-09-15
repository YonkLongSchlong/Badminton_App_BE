import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { UserServiceImpl, type UserService } from "../services/userService";
import { db } from "../db";

export const userRoutes = new Hono();

export const userSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
  password: z.string(),
  dob: z.string().date(),
  avatar: z.string(),
  role: z.string(),
  started_course: z.number(),
  ongoing_course: z.number(),
  finished_course: z.number(),
});

export const createPostSchema = userSchema.omit({
  id: true,
  avatar: true,
  role: true,
  started_course: true,
  ongoing_course: true,
  finished_course: true,
});

export type User = z.infer<typeof userSchema>;

const userService: UserService = new UserServiceImpl(db);

/**
 * GET: /users
 */
userRoutes.get("/", async (c) => {
  const result = await userService.getAllUser();
  c.status(result.status);
  return c.json(result);
});

/**
 * GET: /users/:id
 */
userRoutes.get("/:id{[0-9]+}", async (c) => {
  const id: number = Number.parseInt(c.req.param("id"));
  const result = await userService.getUser(id);
  c.status(result.status);
  return c.json(result);
});

/**
 * POST: /users
 */
userRoutes.post("/", zValidator("json", createPostSchema), async (c) => {
  const data = c.req.valid("json");
  const result = await userService.createUser(data);
  c.status(result.status);
  return c.json(result);
});

/**
 * PATCH: /users/:id
 */
userRoutes.patch(
  "/:id{[0-9]+}",
  zValidator("json", createPostSchema),
  async (c) => {
    const id: number = Number.parseInt(c.req.param("id"));
    const data = c.req.valid("json");
    const result = await userService.updateUser(id, data);
    c.status(result.status);
    return c.json(result);
  }
);

/**
 * DELETE: /users/:id
 */
userRoutes.delete("/:id{[0-9]+}", async (c) => {
  const id: number = Number.parseInt(c.req.param("id"));
  const result = await userService.deleteUser(id);
  c.status(result.status);
  return c.json(result);
});
