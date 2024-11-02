import { eq } from "drizzle-orm";
import { db } from "../db";
import {
  freeCourse,
  type FreeCourseCreateSchema,
  type FreeCourseUpdateSchema,
} from "../db/schema/free_course";
import { NotFoundError } from "../../types";
import {
  paidCourse,
  type PaidCourseCreateSchema,
  type PaidCourseUpdateSchema,
} from "../db/schema/paid_course";

/* -------------- PAID COURSE ------------------- */
export const createPaidCourse = async (data: PaidCourseCreateSchema) => {
  return await db.insert(paidCourse).values(data);
};

export const getPaidCourseByCategoryId = async (categoryId: number) => {
  return await db
    .select()
    .from(paidCourse)
    .where(eq(paidCourse.categoryId, categoryId));
};

export const getPaidCourseByStatus = async (
  status: "publish" | "non-publish"
) => {
  return await db
    .select()
    .from(paidCourse)
    .where(eq(paidCourse.status, status));
};

export const getPaidCourseByCoachId = async (coachId: number) => {
  return await db
    .select()
    .from(paidCourse)
    .where(eq(paidCourse.coachId, coachId));
};

export const getPaidCourseById = async (id: number) => {
  const result = await db.query.paidCourse.findFirst({
    where: eq(paidCourse.id, id),
    with: { paidLesson: true },
  });

  if (result === undefined)
    throw new NotFoundError(`Course with id ${id} not found`);

  return result;
};

export const updatePaidCourse = async (
  id: number,
  data: PaidCourseUpdateSchema
) => {
  const paidCourseToUpdate = await getPaidCourseById(id);
  if (paidCourseToUpdate === undefined)
    throw new NotFoundError(`Course with id ${id} not found`);

  return await db
    .update(paidCourse)
    .set(data)
    .where(eq(paidCourse.id, id))
    .returning();
};

export const deletePaidCourse = async (id: number) => {
  const paidCourseToUpdate = await getPaidCourseById(id);
  if (paidCourseToUpdate === undefined)
    throw new NotFoundError(`Course with id ${id} not found`);

  await db.delete(paidCourse).where(eq(paidCourse.id, id));
};

/* -------------- FREE COURSE ------------------- */
export const createFreeCourse = async (data: FreeCourseCreateSchema) => {
  return await db.insert(freeCourse).values(data);
};

export const getAllFreeCourse = async () => {
  return await db.select().from(freeCourse);
};

export const getFreeCourseById = async (id: number) => {
  const result = await db.query.freeCourse.findFirst({
    where: eq(freeCourse.id, id),
    with: { freeLesson: true },
  });

  if (result === undefined)
    throw new NotFoundError(`Course with id ${id} not found`);

  return result;
};

export const updateFreeCourse = async (
  id: number,
  data: FreeCourseUpdateSchema
) => {
  const freeCourseToUpdate = await getFreeCourseById(id);
  if (freeCourseToUpdate === undefined)
    throw new NotFoundError(`Course with id ${id} not found`);

  return await db
    .update(freeCourse)
    .set(data)
    .where(eq(freeCourse.id, id))
    .returning();
};

export const deleteFreeCourse = async (id: number) => {
  const freeCourseToUpdate = await getFreeCourseById(id);
  if (freeCourseToUpdate === undefined)
    throw new NotFoundError(`Course with id ${id} not found`);

  await db.delete(freeCourse).where(eq(freeCourse.id, id));
};
