import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { authenticateLogin } from "../services/authService";

const loginSchema = z.object({
  role: z.string(),
  email: z.string(),
  password: z.string(),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const authRoute = new Hono();

authRoute.post("/login", zValidator("json", loginSchema), async (c) => {
  try {
    const data = c.req.valid("json");
    const result = await authenticateLogin(data);

    if (result === null || result === false) {
      c.status(400);
      return c.text("Invalid credentials");
    }

    return c.json({
      token: result,
    });
  } catch (error) {
    console.log(error);
    c.status(500);
    return c.text("Something went wrong, please try again");
  }
});
