import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import {
  authenticateLogin,
  authenticateLoginOtp,
  forgotPassword,
} from "../services/authService";
import {
  ApiResponse,
  ApiError,
  BadRequestError,
  NotFoundError,
} from "../../types";

const registerSchema = z.object({
  role: z.string(),
  email: z.string().email(),
  password: z.string(),
});

const loginSchema = z.object({
  role: z.string(),
  email: z.string().email(),
  password: z.string(),
});

const otpSchema = z.object({
  id: z.number(),
  otp: z.string(),
  role: z.string(),
  email: z.string().email(),
});

const forgotPasswordSchema = z.object({
  role: z.string(),
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  otp: z.string(),
  email: z.string().email(),
  newPassword: z.string(),
  role: z.string(),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type OtpSchema = z.infer<typeof otpSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export const authRoute = new Hono();

/**
 * POST: /login
 */
authRoute.post("/login", zValidator("json", loginSchema), async (c) => {
  try {
    const data = c.req.valid("json");
    await authenticateLogin(data);

    return c.json(new ApiResponse(200, `An otp has been sent to your email`));
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(new ApiError(404, error.name, error.message), 404);
    } else if (error instanceof BadRequestError) {
      return c.json(new ApiError(400, error.name, error.message), 400);
    } else if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});

/**
 * POST: /verify-otp
 */
authRoute.post("/verify-otp", zValidator("json", otpSchema), async (c) => {
  try {
    const data = c.req.valid("json");
    const result = await authenticateLoginOtp(data);

    return c.json(new ApiResponse(200, `Validated successfully`, result));
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(new ApiError(404, error.name, error.message), 404);
    } else if (error instanceof BadRequestError) {
      return c.json(new ApiError(400, error.name, error.message), 400);
    } else if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});

/**
 * POST: /forgot-password
 */
authRoute.post(
  "/forgot-password",
  zValidator("json", forgotPasswordSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");
      await forgotPassword(data);

      return c.json(new ApiResponse(200, "OTP sent to email successfully"));
    } catch (error) {
      if (error instanceof NotFoundError) {
        return c.json(new ApiError(404, error.name, error.message), 404);
      } else if (error instanceof BadRequestError) {
        return c.json(new ApiError(400, error.name, error.message), 400);
      } else if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

/**
 * POST: /reset-password
 */
authRoute.post(
  "/reset-password",
  zValidator("json", forgotPasswordSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");
      await forgotPassword(data);

      return c.json(new ApiResponse(200, "OTP sent to email successfully"));
    } catch (error) {
      if (error instanceof NotFoundError) {
        return c.json(new ApiError(404, error.name, error.message), 404);
      } else if (error instanceof BadRequestError) {
        return c.json(new ApiError(400, error.name, error.message), 400);
      } else if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

authRoute.post("/logout", async (c) => {
  try {
    return c.json(new ApiResponse(200, "Logout successful"));
  } catch (error) {
    console.error(error);
    return c.json(new ApiResponse(500, "Something went wrong"), 500);
  }
});
