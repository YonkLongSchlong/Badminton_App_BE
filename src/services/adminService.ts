import { eq } from "drizzle-orm";
import { db } from "../db";
import { admin, coach, user } from "../db/schema";
import type { AdminCreateSchema } from "../db/schema/admin";
import { hashPassword } from "../../utils/authenticateUtils";

export const createAdmin = async (data: AdminCreateSchema) => {
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

/* ------------------- PRIVATE METHOD -------------------  */
const getUserById = async (id: number) => {
  return await db.query.user.findFirst({ where: eq(user.id, id) });
};

const getCoachById = async (id: number) => {
  return await db.query.coach.findFirst({ where: eq(coach.id, id) });
};
