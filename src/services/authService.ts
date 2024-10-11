import { db, redisClient } from "../db";
import type { LoginSchema, OtpSchema } from "../routes/authRoutes";
import { compare } from "bcrypt";
import { sign } from "hono/jwt";
import { generateOtp, hashPassword } from "../../utils/authenticateUtils";
import { sendOtpEmail } from "../../utils/emailUtils";
import { getUserByEmail } from "./userService";
import { getCoachByEmail } from "./coachService";
import { getAdminByEmail } from "./adminService";
import { admin, coach, user } from "../db/schema";
import { eq } from "drizzle-orm";


export const authenticateOtp = async (email: string, otp: string) => {
  const otpStored = await redisClient.get(email);
  if (otpStored === null || otpStored !== otp) {
    return false;
  }
  return redisClient.del(email);
};

export const generateToken = async (data: LoginSchema) =>{
  const payload = {
    email: data.email,
    role: data.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  };
  const token = await sign(payload, Bun.env.JWT_SECRET || "");
  return token;
}

export const authenticatePassword = async (account: any, data: LoginSchema) => {
  const check = await compare(data.password, account.password);
  if (!check) {
    return false;
  }
};

export const sendOtpToUser = async (email: string) => {
  const otp = generateOtp();
  await redisClient.set(email, otp.otp, { EX: 60 * 5 });
  await sendOtpEmail(email, otp.otp);
  return otp;
};

export const updateUserPasswordByEmail = async (email: string, password: string, role: string) => {
  let person = null;
  let targetTable = null;
  
  switch (role) {
    case "user":
      person = await getUserByEmail(email);
      targetTable = user;
      break;
    case "coach":
      person = await getCoachByEmail(email);
      targetTable = coach;
      break;
    case "admin":
      person = await getAdminByEmail(email);
      targetTable = admin;
      break;
    default:
      return null; 
  }

  if (!person) return null;
  const hashedPassword = await hashPassword(password);
  await db
    .update(targetTable)
    .set({ password: hashedPassword })
    .where(eq(targetTable.email, email));

  return true;
};


