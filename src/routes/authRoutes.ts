import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { authenticateLogin, authenticateOtp } from "../services/authService";

const loginSchema = z.object({
  role: z.string(),
  email: z.string(),
  password: z.string(),
});

const otpSchema = z.object({
  otp: z.string(),
  role: z.string(),
  email: z.string(),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type OtpSchema = z.infer<typeof otpSchema>;

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
      otp: result,
    });
  } catch (error) {
    console.log(error);
    c.status(500);
    return c.text("Something went wrong, please try again");
  }
});

authRoute.post("/otp", zValidator("json", otpSchema), async (c) => {
  try {
    const data = c.req.valid("json");
    const result = await authenticateOtp(data);

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
