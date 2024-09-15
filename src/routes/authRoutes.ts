import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { sign } from "hono/jwt";

const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

const authRoute = new Hono();

authRoute.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  /**  FETCH USER BY EMAIL */
  // code goes here

  if (password !== "admin") {
    throw new HTTPException(400, { message: "Invalid credentials" });
  }

  const payload = {
    email,
    role: "admin", // replace with user role in payload
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  };

  const token = await sign(payload, Bun.env.JWT_SECRET || "");
  return c.json({
    payload,
    token,
  });
});
