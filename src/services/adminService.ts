import { eq } from "drizzle-orm";
import { db } from "../db";
import { admin, coach, user } from "../db/schema";
import type { AdminCreateSchema } from "../db/schema/admin";
import { hashPassword } from "../../utils/authenticateUtils";
import { BadRequestError, NotFoundError } from "../../types";

export const createAdmin = async (data: AdminCreateSchema) => {
  const checkAdminEmail = await getAdminByEmail(data.email);
  if (checkAdminEmail !== undefined)
    throw new BadRequestError("Admin with this email have already exist");

  data.password = await hashPassword(data.password);
  await db.insert(admin).values(data).returning();
};

export const getAllUsers = async () => {
  const users = await db.select().from(user);
  return users;
};

export const deleteUser = async (id: number) => {
  const userToDelete = await getUserById(id);
  if (userToDelete === undefined)
    throw new NotFoundError(`User with id ${id} not found`);

  await db.delete(user).where(eq(user.id, id));
};

export const getAllCoaches = async () => {
  return await db.select().from(coach);
};

export const deleteCoach = async (id: number) => {
  const coachToDelete = await getCoachById(id);
  if (coachToDelete === undefined)
    throw new NotFoundError(`Coach with id ${id} not found`);

  await db.delete(coach).where(eq(coach.id, id));
};

export const getAdminByEmail = async (email: string) => {
  return await db.query.admin.findFirst({ where: eq(admin.email, email) });
};

/* ------------------- PRIVATE METHOD -------------------  */
const getUserById = async (id: number) => {
  return await db.query.user.findFirst({ where: eq(user.id, id) });
};

const getCoachById = async (id: number) => {
  return await db.query.coach.findFirst({ where: eq(coach.id, id) });
};
