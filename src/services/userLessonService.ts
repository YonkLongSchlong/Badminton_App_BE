import { and, eq, or } from "drizzle-orm";
import { db } from "../db";
import { userLesson } from "../db/schema";
import { getFreeLessonById, getPaidLessonForUser } from "./lessonService";
import { getUserById } from "./userService";
import type {
  UserLessonCreateSchema,
  UserLessonUpdateSchema,
} from "../db/schema/user_lesson";
import { NotFoundError } from "../../types";

export const createUserLessonFreeLesson = async (
  data: UserLessonCreateSchema
) => {
  const checkUser = getUserById(data.userId);
  if (checkUser === undefined) {
    throw new Error("User not found");
  }

  const checkLesson = getFreeLessonById(data.freeLessonId!);
  if (checkLesson === undefined) {
    throw new Error("Lesson not found");
  }

  const checkIfRecordExist = await db.query.userLesson.findFirst({
    where: and(
      eq(userLesson.userId, data.userId),
      eq(userLesson.freeLessonId, data.freeLessonId!)
    ),
  });

  if (checkIfRecordExist !== undefined) {
    return;
  } else {
    await db.insert(userLesson).values(data).returning();
  }
};

export const createUserLessonPaidLesson = async (
  data: UserLessonCreateSchema
) => {
  const checkUser = getUserById(data.userId);
  if (checkUser === undefined) {
    throw new Error("User not found");
  }

  const checkLesson = getPaidLessonForUser(data.paidLessonId!, data.userId);
  if (checkLesson === undefined) {
    throw new Error("Lesson not found");
  }

  const checkIfRecordExist = await db.query.userLesson.findFirst({
    where: and(
      eq(userLesson.userId, data.userId),
      eq(userLesson.paidLessonId, data.paidLessonId!)
    ),
  });

  if (checkIfRecordExist !== undefined) {
    return;
  } else {
    await db.insert(userLesson).values(data).returning();
  }
};

export const updateUserLessonPaidLesson = async (
  data: UserLessonUpdateSchema
) => {
  const checkIfRecordExist = await db.query.userLesson.findFirst({
    where: and(
      eq(userLesson.userId, data.userId),
      eq(userLesson.paidLessonId, data.paidLessonId!)
    ),
  });

  if (checkIfRecordExist === undefined) {
    throw new NotFoundError(`User lesson not found`);
  }

  await db
    .update(userLesson)
    .set(data)
    .where(
      and(
        eq(userLesson.userId, data.userId),
        eq(userLesson.paidLessonId, data.paidLessonId!)
      )
    );
};

export const updateUserLessonFreeLesson = async (
  data: UserLessonUpdateSchema
) => {
  const checkIfRecordExist = await db.query.userLesson.findFirst({
    where: and(
      eq(userLesson.userId, data.userId),
      eq(userLesson.freeLessonId, data.freeLessonId!)
    ),
  });

  if (checkIfRecordExist === undefined) {
    throw new NotFoundError(`User lesson not found`);
  }

  await db
    .update(userLesson)
    .set(data)
    .where(
      and(
        eq(userLesson.userId, data.userId),
        eq(userLesson.freeLessonId, data.freeLessonId!)
      )
    );
};

export const getUserLessons = async (
  userId: number,
  courseId: number,
  courseType: number
) => {
  let result = null;
  if (courseType === 0) {
    result = getUserLessonByFreeCourseId(userId, courseId);
  } else {
    result = getUserLessonByPaidCourseId(userId, courseId);
  }

  if (result === undefined || result === null) {
    return null;
  }

  return result;
};

export const getUserLessonByPaidCourseId = async (
  userId: number,
  courseId: number
) => {
  return await db.query.userLesson.findMany({
    where: and(
      eq(userLesson.userId, userId),
      eq(userLesson.paidCourseId, courseId)
    ),
  });
};

export const getUserLessonByFreeCourseId = async (
  userId: number,
  courseId: number
) => {
  return await db.query.userLesson.findMany({
    where: and(
      eq(userLesson.userId, userId),
      eq(userLesson.freeCourseId, courseId)
    ),
  });
};
