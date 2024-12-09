import { and, eq, or } from "drizzle-orm";
import { db } from "../db";
import { user_lesson } from "../db/schema";
import { getFreeLessonById, getPaidLessonForUser } from "./lessonService";
import { getUserById } from "./userService";
import type {
  UserLessonCreateSchema,
  UserLessonUpdateSchema,
} from "../db/schema/user_lesson";

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

  await db.insert(user_lesson).values(data).returning();
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

  await db.insert(user_lesson).values(data).returning();
};

export const updateUserLessonPaidLesson = async (
  data: UserLessonUpdateSchema
) => {
  const checkUser = getUserById(data.userId);
  if (checkUser === undefined) {
    throw new Error("User not found");
  }

  const checkLesson = getPaidLessonForUser(data.paidLessonId!, data.userId);
  if (checkLesson === undefined) {
    throw new Error("Lesson not found");
  }

  await db.update(user_lesson).set(data).returning();
};

export const updateUserLessonFreeLesson = async (
  data: UserLessonUpdateSchema
) => {
  const checkUser = getUserById(data.userId);
  if (checkUser === undefined) {
    throw new Error("User not found");
  }

  const checkLesson = getFreeLessonById(data.freeLessonId!);
  if (checkLesson === undefined) {
    throw new Error("Lesson not found");
  }

  await db.update(user_lesson).set(data).returning();
};

export const getUserLessons = async (userId: number, lessonId: number) => {
  const [result] = await db
    .select()
    .from(user_lesson)
    .where(
      and(
        eq(user_lesson.userId, userId),
        or(
          eq(user_lesson.freeLessonId, lessonId),
          eq(user_lesson.paidLessonId, lessonId)
        )
      )
    );

  if (result === undefined) {
    return null;
  }

  return result;
};
