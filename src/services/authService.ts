import { eq } from "drizzle-orm";
import { db } from "../db";
import type { LoginSchema } from "../routes/authRoutes";
import { admin, coach, user } from "../db/schema";
import { compare } from "bcrypt";
import { sign } from "hono/jwt";

export const authenticateLogin = async (data: LoginSchema) => {
  switch (data.role) {
    case "user":
      const user = await getUserByEmail(data.email);
      if (user === undefined) {
        return null;
      }
      return authenticatePassword(user, data);

    case "coach":
      const coach = await getCoachByEmail(data.email);
      if (coach === undefined) {
        return null;
      }
      return authenticatePassword(coach, data);

    default:
      const admin = await getAdminByEmail(data.email);
      if (admin === undefined) {
        return null;
      }
      return authenticatePassword(admin, data);
  }
};

/* ------------------- PRIVATE METHOD -------------------  */
const getUserByEmail = async (email: string) => {
  return await db.query.user.findFirst({
    where: eq(user.email, email),
  });
};

const getCoachByEmail = async (email: string) => {
  return await db.query.coach.findFirst({
    where: eq(coach.email, email),
  });
};

const getAdminByEmail = async (email: string) => {
  return await db.query.admin.findFirst({
    where: eq(admin.email, email),
  });
};

const authenticatePassword = async (account: any, data: LoginSchema) => {
  const check = compare(data.password, account.password);
  if (!check) {
    return false;
  }

  const payload = {
    email: data.email,
    role: data.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  };

  return await sign(payload, Bun.env.JWT_SECRET || "");
};
