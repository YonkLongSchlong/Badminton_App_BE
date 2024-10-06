import { genSalt, hash } from "bcrypt";
import { TOTP } from "totp-generator";

export const hashPassword = async (password: string) => {
  const salt = await genSalt(10);
  return await hash(password, salt);
};

export const generateOtp = () => {
  return TOTP.generate(Bun.env.OTP_SECRET as string, {
    digits: 6,
    algorithm: "SHA-256",
  });
};
