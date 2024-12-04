import { and, eq, or } from "drizzle-orm";
import { db } from "../db";
import { user_lesson } from "../db/schema";
import { getFreeLessonById, getPaidLessonForUser } from "./lessonService";
import { getUserById } from "./userService";

export const createUserFreeLesson = async (
  userId: number,
  lessonId: number
) => {
  const checkUser = getUserById(userId);
  if (checkUser === undefined) {
    throw new Error("User not found");
  }

  const checkLesson = getFreeLessonById(lessonId);
  if (checkLesson === undefined) {
    throw new Error("Lesson not found");
  }

  await db
    .insert(user_lesson)
    .values({ user_id: userId, free_lesson_id: lessonId })
    .returning();
};

export const createUserPaidLesson = async (
  userId: number,
  lessonId: number
) => {
  const checkUser = getUserById(userId);
  if (checkUser === undefined) {
    throw new Error("User not found");
  }

  const checkLesson = getPaidLessonForUser(lessonId, userId);
  if (checkLesson === undefined) {
    throw new Error("Lesson not found");
  }

  await db
    .insert(user_lesson)
    .values({ user_id: userId, paid_lesson_id: lessonId })
    .returning();
};

export const getUserLessons = async (userId: number, lessonId: number) => {
  const [result] = await db
    .select()
    .from(user_lesson)
    .where(
      and(
        eq(user_lesson.user_id, userId),
        or(
          eq(user_lesson.free_lesson_id, lessonId),
          eq(user_lesson.paid_lesson_id, lessonId)
        )
      )
    );

  if (result === undefined) {
    return null;
  }

  return result;
};
