import { eq } from "drizzle-orm";
import { db, redisClient } from "../db";
import { admin, coach, user } from "../db/schema";
import type { AdminCreateSchema } from "../db/schema/admin";
import { hashPassword } from "../../utils/authenticateUtils";
import { generateOtp } from "../../utils/authenticateUtils";
import { sendOtpToUser } from "./authService";

export const createAdmin = async (data: AdminCreateSchema) => {
  const checkAdminEmail = await getAdminByEmail(data.email);
  if (checkAdminEmail !== undefined) return false;

  data.password = await hashPassword(data.password);
  const [result] = await db.insert(admin).values(data).returning();
  return result.id;
};

export const getAllUsers = async () => {
  const users = await db.select().from(user);
  return users;
};

export const deleteUser = async (id: number) => {
  const userToDelete = await getUserById(id);
  if (userToDelete === undefined) return null;

  const [result] = await db
    .delete(user)
    .where(eq(user.id, id))
    .returning({ userId: user.id });
  return result.userId;
};

export const getAllCoaches = async () => {
  return await db.select().from(coach);
};

export const deleteCoach = async (id: number) => {
  const coachToDelete = await getCoachById(id);
  if (coachToDelete === undefined) return null;

  const [result] = await db
    .delete(coach)
    .where(eq(coach.id, id))
    .returning({ coachId: coach.id });
  return result.coachId;
};

export const authenticateAdminRegister = async (data: AdminCreateSchema) => {
  const checkUserEmail = await getAdminByEmail(data.email);

  if (checkUserEmail !== undefined) return false;
  return sendOtpToUser(data.email);
};

export const getAdminByEmail = async (email: string) => {
  return await db.query.admin.findFirst({ where: eq(user.email, email) });
};

/* ------------------- PRIVATE METHOD -------------------  */
const getUserById = async (id: number) => {
  return await db.query.user.findFirst({ where: eq(user.id, id) });
};

const getCoachById = async (id: number) => {
  return await db.query.coach.findFirst({ where: eq(coach.id, id) });
};
