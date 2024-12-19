import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { paidCourse, review, user_course } from "../db/schema";
import type {
  ReviewCreateSchema,
  ReviewUpdateSchema,
} from "../db/schema/review";
import { BadRequestError, NotFoundError } from "../../types";
import type {
  UserCourseCreateSchema,
  UserCourseUpdateSchema,
} from "../db/schema/user_course";

export const getUserCourseByFreeCourseId = async (courseId: number) => {
  return await db.query.user_course.findMany({
    where: eq(user_course.free_course_id, courseId),
    with: { user: true },
  });
};

export const getUserCourseByPaidCourseId = async (courseId: number) => {
  return await db.query.user_course.findMany({
    where: eq(user_course.paid_course_id, courseId),
    with: { user: true },
  });
};

export const getUserCourseByUserId = async (userId: number) => {
  return await db.query.user_course.findMany({
    where: eq(user_course.user_id, userId),
    with: { user: true },
  });
};

export const getUserCourseByStatusFinished = async (userId: number) => {
  return await db.query.user_course.findMany({
    where: and(eq(user_course.status, 2), eq(user_course.user_id, userId)),
  });
};

export const getUserCourseByStatusOngoing = async (userId: number) => {
  return await db.query.user_course.findMany({
    where: and(eq(user_course.status, 1), eq(user_course.user_id, userId)),
  });
};

export const createUserCourse = async (data: UserCourseCreateSchema) => {
  return await db.insert(user_course).values(data).returning();
};

export const updateUserCourseForPaidCourse = async (
  data: UserCourseUpdateSchema
) => {
  const [check] = await db
    .select()
    .from(user_course)
    .where(
      and(
        eq(user_course.user_id, data.user_id),
        eq(user_course.paid_course_id, data.paid_course_id!)
      )
    );
  if (check === undefined) {
    throw new NotFoundError(`UserCourse not found`);
  }

  return await db
    .update(user_course)
    .set(data)
    .where(
      and(
        eq(user_course.user_id, data.user_id),
        eq(user_course.paid_course_id, data.paid_course_id!)
      )
    )
    .returning();
};

export const updateUserCourseForFreeCourse = async (
  data: UserCourseUpdateSchema
) => {
  const [check] = await db
    .select()
    .from(user_course)
    .where(
      and(
        eq(user_course.user_id, data.user_id),
        eq(user_course.free_course_id, data.free_course_id!)
      )
    );
  if (check === undefined) {
    throw new NotFoundError(`UserCourse not found`);
  }

  return await db
    .update(user_course)
    .set(data)
    .where(
      and(
        eq(user_course.user_id, data.user_id),
        eq(user_course.free_course_id, data.free_course_id!)
      )
    )
    .returning();
};

export const deleteUserCourse = async (id: number) => {
  const [checkUserCourse] = await db
    .select()
    .from(user_course)
    .where(eq(user_course.id, id));

  if (checkUserCourse === undefined) {
    throw new NotFoundError("UserCourse not found");
  }

  await db.delete(user_course).where(eq(user_course.id, id));
};
