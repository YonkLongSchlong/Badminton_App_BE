import { redisClient } from "../db";
import type { LoginSchema, OtpSchema } from "../routes/authRoutes";
import { compare } from "bcrypt";
import { sign } from "hono/jwt";

export const authenticateOtp = async (data: OtpSchema) => {
  const otp = await redisClient.get(data.email);
  if (otp === null || otp !== data.otp) {
    return false;
  }
  return redisClient.del(data.email);
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



