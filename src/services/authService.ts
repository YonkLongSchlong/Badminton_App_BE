import { db, redisClient } from "../db";
import type {
  ForgotPasswordSchema,
  LoginSchema,
  OtpSchema,
  RegisterSchema,
  ResetPasswordSchema,
} from "../routes/authRoutes";
import { compare } from "bcrypt";
import { sign } from "hono/jwt";
import { generateOtp, hashPassword } from "../../utils/authenticateUtils";
import { sendOtpEmail } from "../../utils/emailUtils";
import { getUserByEmail } from "./userService";
import { getCoachByEmail } from "./coachService";
import { getAdminByEmail } from "./adminService";
import { admin, coach, user } from "../db/schema";
import { eq } from "drizzle-orm";
import { BadRequestError, NotFoundError } from "../../types";

/** AUTHENTICATE LOGIN
 * This function will authenticate password base on role
 * If success will generate an otp and send it through email
 */
export const authenticateLogin = async (data: LoginSchema) => {
  let result = null;

  switch (data.role) {
    case "user":
      result = await getUserByEmail(data.email);
      break;
    case "coach":
      result = await getCoachByEmail(data.email);
      break;
    default:
      result = await getAdminByEmail(data.email);
  }

  if (result == undefined) {
    throw new NotFoundError("User with this email not found");
  }

  const check = await compare(data.password, result.password);

  if (!check) {
    throw new BadRequestError("Invalid credential");
  }

  sendOtp(data.email);
};

/** AUTHENTICATE LOGIN OTP
 * This function will authenticate otp
 * if success will generate a jwt token and return it
 */
export const authenticateLoginOtp = async (data: OtpSchema) => {
  const otp = await redisClient.get(data.email);

  if (otp === null || otp !== data.otp) {
    throw new BadRequestError("Invalid OTP code");
  }

  const payload = {
    email: data.email,
    role: data.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 260,
  };

  const promise = await Promise.all([
    sign(payload, Bun.env.JWT_SECRET || ""),
    redisClient.del(data.email),
  ]);

  let result = null;
  switch (data.role) {
    case "user":
      result = await getUserByEmail( data.email)
      break;
    case "coach":
      result = await getCoachByEmail(data.email)
      break;
    default:
      result = await getAdminByEmail( data.email )
  }

  return { token: promise[0], user: result };
};

/** FORGOT PASSWORD
 * This function will check if email existed
 * If success will generate a jwt token and return it
 */
export const forgotPassword = async (data: ForgotPasswordSchema) => {
  let result = null;

  switch (data.role) {
    case "user":
      result = await getUserByEmail(data.email);
      break;
    case "coach":
      result = await getCoachByEmail(data.email);
      break;
    default:
      result = await getAdminByEmail(data.email);
  }

  if (result == undefined) {
    throw new BadRequestError("User with this email not found");
  }

  sendOtp(data.email);
};

/** RESET PASSWORD
 * This function will validate otp
 * If success will reset password
 */
export const resetPassword = async (data: ResetPasswordSchema) => {
  const otp = await redisClient.get(data.email);

  if (otp === null || otp !== data.otp) {
    throw new BadRequestError("Invalid OTP code");
  }

  let targetTable = null;

  switch (data.role) {
    case "user":
      targetTable = user;
      break;
    case "coach":
      targetTable = coach;
      break;
    default:
      targetTable = admin;
      break;
  }

  await db
    .update(targetTable)
    .set({ password: data.newPassword })
    .where(eq(targetTable.email, data.email));
};

/* ------------- PRIVATE METHOD ------------- */

export const sendOtp = async (email: string) => {
  const otp = await redisClient.get(email);
  if (otp !== null) {
    redisClient.del(email);
  }

  const result = generateOtp();
  await redisClient.set(email, result.otp, { EX: 60 * 5 });
  await sendOtpEmail(email, result.otp);
};
