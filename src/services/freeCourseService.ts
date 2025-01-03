import { and, eq } from "drizzle-orm";
import { db } from "../db";
import {
  freeCourse,
  type FreeCourseCreateSchema,
  type FreeCourseUpdateSchema,
} from "../db/schema/free_course";
import { NotFoundError } from "../../types";
import { s3Client } from "../../utils/configAWS";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { category, user_course } from "../db/schema";

/* -------------- FREE COURSE ------------------- */
export const createFreeCourse = async (data: FreeCourseCreateSchema) => {
  return await db.insert(freeCourse).values(data);
};

export const getAllFreeCourse = async () => {
  return await db.query.freeCourse.findMany({
    with: { category: true },
  });
};

export const getFreeCourseByCategoryId = async (id: number) => {
  return await db.query.freeCourse.findMany({
    where: eq(freeCourse.categoryId, id),
    with: { category: true },
  });
};

export const getFreeCourseById = async (id: number) => {
  const result = await db.query.freeCourse.findFirst({
    where: eq(freeCourse.id, id),
    with: { freeLesson: true, category: true },
  });

  if (result === undefined)
    throw new NotFoundError(`Course with id ${id} not found`);

  return result;
};

export const getFreeCourseByIdUser = async (id: number, userId: number) => {
  const [check] = await db
    .select()
    .from(user_course)
    .where(
      and(eq(user_course.free_course_id, id), eq(user_course.user_id, userId))
    );

  const result = await db.query.freeCourse.findFirst({
    where: eq(freeCourse.id, id),
    with: { freeLesson: true, category: true, userLesson: true },
  });

  if (result === undefined)
    throw new NotFoundError(`Course with id ${id} not found`);

  return {
    result,
    started: check == undefined ? null : check.status == 0 ? false : true,
    ongoing: check == undefined ? null : check.status == 1 ? true : false,
    finished: check == undefined ? null : check.status == 2 ? true : false,
  };
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

export const updateFreeCourseThumbnail = async (id: number, file: File) => {
  const freeCourseToUpdate = await getFreeCourseById(id);
  if (freeCourseToUpdate === undefined)
    throw new NotFoundError(`Course with id ${id} not found`);

  const fileBuffer = await file.arrayBuffer();
  const base64File = Buffer.from(fileBuffer).toString("base64");

  const uploadParams = {
    Bucket: Bun.env.S3_COURSE_THUMBNAIL_BUCKET,
    Key: file.name,
    Body: Buffer.from(base64File, "base64"),
    ContentEncoding: "base64",
    ContentType: file.type,
  };

  await s3Client.send(new PutObjectCommand(uploadParams));
  const thumbnailUrl = `https://${uploadParams.Bucket}.s3.${Bun.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;

  const [result] = await db
    .update(freeCourse)
    .set({ thumbnail: thumbnailUrl })
    .where(eq(freeCourse.id, id))
    .returning();

  return result;
};

export const deleteFreeCourse = async (id: number) => {
  const freeCourseToUpdate = await getFreeCourseById(id);
  if (freeCourseToUpdate === undefined)
    throw new NotFoundError(`Course with id ${id} not found`);

  await db.delete(freeCourse).where(eq(freeCourse.id, id));
};
