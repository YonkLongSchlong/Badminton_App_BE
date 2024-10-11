import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import {
  authenticateOtp,
  generateToken,
  authenticatePassword,
} from "../services/authService";
import { createUser, getUserByEmail } from "../services/userService";
import { createCoach, getCoachByEmail } from "../services/coachService";
import { createAdmin, getAdminByEmail } from "../services/adminService";

import { type UserCreateSchema } from "../db/schema/user";
import { type AdminCreateSchema } from "../db/schema/admin";
import { type CoachCreateSchema } from "../db/schema/coach";
import { ApiResponse } from "../../types";

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

export type LoginSchema = z.infer<typeof loginSchema>;
export type OtpSchema = z.infer<typeof otpSchema>;

export const authRoute = new Hono();

authRoute.post("/login", zValidator("json", loginSchema), async (c) => {
  try {
    let user = null;
    let resultPassword = null;
    const data = c.req.valid("json");
    const email = data.email;
    const role = data.role;
    if (role == "user") {
      user = await getUserByEmail(email);
    } else if (role == "coach") {
      user = await getCoachByEmail(email);
    } else {
      user = await getAdminByEmail(email);
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

authRoute.post("/verifyOtp", zValidator("json", otpSchema), async (c) => {
  try {
    const data = c.req.valid("json");
    const resultOtp = await authenticateOtp(data);

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
