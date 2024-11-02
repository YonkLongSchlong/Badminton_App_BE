import { eq } from "drizzle-orm";
import { db } from "../db";
import { NotFoundError } from "../../types";
import {
  freeLesson,
  type FreeLessonCreateSchema,
  type FreeLessonUpdateSchema,
} from "../db/schema/free_lesson";
import { freeCourse } from "../db/schema";
import { getFreeCourseById } from "./courseService";

export const createFreeLesson = async (data: FreeLessonCreateSchema) => {
  const freeCourseToUpdate = await getFreeCourseById(data.freeCourseId!);

  if (freeCourseToUpdate === undefined) {
    throw new NotFoundError(`Course with id ${data.freeCourseId} not found`);
  }

  try {
    await db.transaction(async (tx) => {
      await tx.insert(freeLesson).values(data).returning();
      await tx
        .update(freeCourse)
        .set({ lessonQuantity: freeCourseToUpdate.lessonQuantity! + 1 });
    });
  } catch (error) {
    throw new Error("Failed to added new lesson");
  }
};

export const updateFreeLesson = async (
  id: number,
  data: FreeLessonUpdateSchema
) => {
  const freeLessonToUpdate = await getFreeLessonById(id);
  if (freeLessonToUpdate === undefined)
    throw new NotFoundError(`Lesson with id ${id} not found`);

  return await db
    .update(freeLesson)
    .set(data)
    .where(eq(freeLesson.id, id))
    .returning();
};

export const deleteFreeLesson = async (id: number) => {
  const freeLessonToDelete = await getFreeLessonById(id);
  if (freeLessonToDelete === undefined)
    throw new NotFoundError(`Lesson with id ${id} not found`);

  const freeCourseToUpdate = await getFreeCourseById(
    freeLessonToDelete.freeCourseId!
  );
  if (freeCourseToUpdate === undefined)
    throw new NotFoundError(
      `Course with id ${freeLessonToDelete.freeCourseId} not found`
    );

  try {
    await db.transaction(async (tx) => {
      await tx.delete(freeLesson).where(eq(freeLesson.id, id));
      await tx
        .update(freeCourse)
        .set({ lessonQuantity: freeCourseToUpdate.lessonQuantity! - 1 })
        .where(eq(freeCourse.id, freeCourseToUpdate.id));
    });
  } catch (error) {
    throw new Error("Failed to delete free lesson");
  }
};

export const getFreeLessonById = async (id: number) => {
  return await db.query.freeLesson.findFirst({ where: eq(freeLesson.id, id) });
};
