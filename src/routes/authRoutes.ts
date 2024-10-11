import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import {
  authenticateOtp,
  generateToken,
  authenticatePassword,
  sendOtpToUser,
  updateUserPasswordByEmail,
} from "../services/authService";
import { createUser, getUserByEmail } from "../services/userService";
import { createCoach, getCoachByEmail } from "../services/coachService";
import { createAdmin, getAdminByEmail } from "../services/adminService";

import { type UserCreateSchema } from "../db/schema/user";
import { type AdminCreateSchema } from "../db/schema/admin";
import { type CoachCreateSchema } from "../db/schema/coach";
import { ApiResponse, ApiError } from "../../types";

const loginSchema = z.object({
  role: z.string(),
  email: z.string(),
  password: z.string(),
});

const otpSchema = z.object({
  otp: z.string(),
  role: z.string(),
  email: z.string(),
  password: z.string(),
  user_name: z.string(),
});

const emailSchema = z.object({
  email: z.string().email(),
  role: z.string(),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string(),
  newPassword: z.string(),
  role: z.string(),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type OtpSchema = z.infer<typeof otpSchema>;

export const authRoute = new Hono();

authRoute.post("/login", zValidator("json", loginSchema), async (c) => {
  try {
    let user = null;
    let resultPassword = null;
    const data = c.req.valid("json");

    if (data.role == "user") {
      user = await getUserByEmail(data.email);
    } else if (data.role == "coach") {
      user = await getCoachByEmail(data.email);
    } else {
      user = await getAdminByEmail(data.email);
    }

    if (!user) {
      c.status(404);
      return c.text("User not found");
    }

    resultPassword = await authenticatePassword(user, data);
    if (resultPassword === null || resultPassword === false) {
      c.status(400);
      return c.text("Invalid credentials");
    }
    const token = await generateToken(data);

    return c.json({
      token: token,
      person: user,
    });
  } catch (error) {
    console.log(error);
    c.status(500);
    return c.text("Something went wrong, please try again");
  }
});

authRoute.post("/verify-otp", zValidator("json", otpSchema), async (c) => {
  try {
    const data = c.req.valid("json");
    const resultOtp = await authenticateOtp(data.email, data.otp);

    if (resultOtp === null || resultOtp === false) {
      c.status(400);
      return c.text("Invalid credentials");
    }
    const role = data.role;
    const { otp, ...persionData } = data;
    if (role == "user") {
      const userId = await createUser(persionData as UserCreateSchema);
      return c.json(new ApiResponse(200, "User created successfully", userId));
    } else if (role == "admin") {
      const adminId = await createAdmin(persionData as AdminCreateSchema);
      return c.json(
        new ApiResponse(200, "Admin created successfully", adminId)
      );
    } else {
      const coachId = await createCoach(persionData as CoachCreateSchema);
      return c.json(
        new ApiResponse(200, "Coach created successfully", coachId)
      );
    }
  } catch (error) {
    console.log(error);
    c.status(500);
    return c.text("Something went wrong, please try again");
  }
});

authRoute.post(
  "/forgot-password",
  zValidator("json", emailSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");
      let user = null;

      if (data.role == "user") {
        user = await getUserByEmail(data.email);
      } else if (data.role == "coach") {
        user = await getCoachByEmail(data.email);
      } else {
        user = await getAdminByEmail(data.email);
      }

      if (!user) {
        return c.json(new ApiResponse(404, "User not found"));
      }

      const result = await sendOtpToUser(data.email);
      return c.json(new ApiResponse(200, "OTP sent to email successfully", result));
    } catch (error) {
      if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message));
      }
    }
  }
);

authRoute.post(
  "/reset-password",
  zValidator("json", resetPasswordSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");

      const resultOtp = await authenticateOtp(data.email, data.otp);

      if (resultOtp === null || resultOtp === false) {
        c.status(400);
        return c.text("Invalid credentials");
      }

      const result = await updateUserPasswordByEmail(
        data.email,
        data.newPassword,
        data.role
      );
      if (result === null) {
        return c.json(new ApiResponse(404, `User not found`), 404);
      }

      return c.json(new ApiResponse(200, "Password reset successfully"));
    } catch (error) {
      if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);
