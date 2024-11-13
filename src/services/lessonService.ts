import { eq } from "drizzle-orm";
import { db } from "../db";
import { NotFoundError } from "../../types";
import {
  freeLesson,
  type FreeLessonCreateSchema,
  type FreeLessonUpdateSchema,
} from "../db/schema/free_lesson";
import { freeCourse, paidCourse } from "../db/schema";
import { getFreeCourseById, getPaidCourseById } from "./courseService";
import {
  paidLesson,
  type PaidLessonCreateSchema,
} from "../db/schema/paid_lesson";
import type { PaidCourseUpdateSchema } from "../db/schema/paid_course";
import { s3Client } from "../../utils/configAWS";
import { PutObjectCommand } from "@aws-sdk/client-s3";

/* -------------- FREE LESSON ------------------- */
export const uploadImageFreeLesson = async (file: File) => {
  try {
    const fileBuffer = await file.arrayBuffer();
    const base64File = Buffer.from(fileBuffer).toString("base64");

    const uploadParams = {
      Bucket: Bun.env.S3_IMAGE_FREE_LESSON_BUCKET,
      Key: file.name,
      Body: Buffer.from(base64File, "base64"),
      ContentEncoding: "base64",
      ContentType: file.type,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    const avatarUrl = `https://${uploadParams.Bucket}.s3.${Bun.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;

    return avatarUrl;
  } catch (error) {
    throw new Error("Failed to added new lesson");
  }
};

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

/* -------------- PAID LESSON ------------------- */
export const uploadImagePaidLesson = async (file: File) => {
  try {
    const fileBuffer = await file.arrayBuffer();
    const base64File = Buffer.from(fileBuffer).toString("base64");

    const uploadParams = {
      Bucket: Bun.env.S3_IMAGE_PAID_LESSON_BUCKET,
      Key: file.name,
      Body: Buffer.from(base64File, "base64"),
      ContentEncoding: "base64",
      ContentType: file.type,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    const avatarUrl = `https://${uploadParams.Bucket}.s3.${Bun.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;

    return avatarUrl;
  } catch (error) {
    throw new Error("Failed to added new lesson");
  }
};

export const createPaidLesson = async (data: PaidLessonCreateSchema) => {
  const paidCourseToUpdate = await getPaidCourseById(data.paidCourseId!);

  if (paidCourseToUpdate === undefined) {
    throw new NotFoundError(`Course with id ${data.paidCourseId} not found`);
  }

  try {
    await db.transaction(async (tx) => {
      await tx.insert(paidLesson).values(data).returning();
      await tx
        .update(paidCourse)
        .set({ lessonQuantity: paidCourseToUpdate.lessonQuantity! + 1 });
    });
  } catch (error) {
    throw new Error("Failed to added new lesson");
  }
};

export const updatePaidLesson = async (
  id: number,
  data: PaidCourseUpdateSchema
) => {
  const paidLessonToUpdate = await getPaidLessonById(id);
  if (paidLessonToUpdate === undefined)
    throw new NotFoundError(`Lesson with id ${id} not found`);

  return await db
    .update(paidLesson)
    .set(data)
    .where(eq(paidLesson.id, id))
    .returning();
};

export const deletePaidLesson = async (id: number) => {
  const paidLessonToDelete = await getPaidLessonById(id);
  if (paidLessonToDelete === undefined)
    throw new NotFoundError(`Lesson with id ${id} not found`);

  const paidCourseToUpdate = await getPaidCourseById(
    paidLessonToDelete.paidCourseId!
  );
  if (paidCourseToUpdate === undefined)
    throw new NotFoundError(
      `Course with id ${paidLessonToDelete.paidCourseId} not found`
    );

  try {
    await db.transaction(async (tx) => {
      await tx.delete(paidLesson).where(eq(paidLesson.id, id));
      await tx
        .update(paidCourse)
        .set({ lessonQuantity: paidCourseToUpdate.lessonQuantity! - 1 })
        .where(eq(paidCourse.id, paidCourseToUpdate.id));
    });
  } catch (error) {
    throw new Error("Failed to delete paid lesson");
  }
};

export const getPaidLessonById = async (id: number) => {
  return await db.query.paidLesson.findFirst({ where: eq(paidLesson.id, id) });
};
