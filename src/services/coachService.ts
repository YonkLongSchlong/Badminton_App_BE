import { db } from "../db";
import { eq } from "drizzle-orm";
import { compare, genSalt, hash } from "bcrypt";
import { coach } from "../db/schema";
import type {
  CoachCreateSchema,
  CoachPasswordSchema,
  CoachUpdateSchema,
} from "../db/schema/coach";
import { hashPassword } from "../../utils/authenticateUtils";

export const createCoach = async (data: CoachCreateSchema) => {
  const checkCoachEmail = await getCoachByEmail(data.email);

  if (checkCoachEmail !== undefined) return false;
  data.password = await hashPassword(data.password);

  const [result] = await db.insert(coach).values(data).returning();
  return result.id;
};

export const getCoach = async (id: number) => {
  const coach = await getCoachById(id);
  if (coach === undefined) return null;
  coach.password = "";
  return coach;
};

export const updateCoach = async (id: number, data: CoachUpdateSchema) => {
  const coachToUpdate = await getCoachById(id);
  if (coachToUpdate === undefined) return null;

  const checkCoachEmail = await getCoachByEmail(data.email);
  if (checkCoachEmail !== undefined && checkCoachEmail.id !== coachToUpdate.id)
    return false;

  const [result] = await db
    .update(coach)
    .set(data)
    .where(eq(coach.id, id))
    .returning();
  result.password = "";

  return result;
};

export const updateCoachPassword = async (
  id: number,
  data: CoachPasswordSchema
) => {
  const coachToUpdate = await getCoachById(id);
  if (coachToUpdate === undefined) return null;
  const check = await compare(coachToUpdate.password, data.password);
  if (!check) {
    return false;
  }
  const newPassword = await hashPassword(data.password);
  await db.update(coach).set({ password: newPassword }).where(eq(coach.id, id));
};

/* ------------------- PRIVATE METHOD -------------------  */
const getCoachById = async (id: number) => {
  return await db.query.coach.findFirst({ where: eq(coach.id, id) });
};

const getCoachByEmail = async (email: string) => {
  return await db.query.coach.findFirst({ where: eq(coach.email, email) });
};
