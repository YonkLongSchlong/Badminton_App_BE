import { eq } from "drizzle-orm";
import { db } from "../db";
import {
  freeCourse,
  type FreeCourseCreateSchema,
  type FreeCourseUpdateSchema,
} from "../db/schema/free_course";

export const createFreeCourse = async (data: FreeCourseCreateSchema) => {
  return await db.insert(freeCourse).values(data).returning();
};

export const getAllFreeCourse = async () => {
  return await db.select().from(freeCourse);
};

export const getFreeCourse = async (id: number) => {
  const result = await getFreeCourseById(id);

  if (result === undefined) {
    return null;
  }

  return result;
};

export const updateFreeCourse = async (
  id: number,
  data: FreeCourseUpdateSchema
) => {
  const freeCourseToUpdate = await getFreeCourseById(id);
  if (freeCourseToUpdate === undefined) {
    return null;
  }

  return await db
    .update(freeCourse)
    .set(data)
    .where(eq(freeCourse.id, id))
    .returning();
};

export const deleteFreeCourse = async (id: number) => {
  const freeCourseToUpdate = await getFreeCourseById(id);
  if (freeCourseToUpdate === undefined) {
    return null;
  }

  await db.delete(freeCourse).where(eq(freeCourse.id, id));
  return true;
};

/* ------------------- PRIVATE METHOD -------------------  */
const getFreeCourseById = async (id: number) => {
  return await db.query.freeCourse.findFirst({ where: eq(freeCourse.id, id) });
};
