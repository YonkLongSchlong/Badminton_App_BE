import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { NotFoundError } from "../../types";
import {
  paidCourse,
  type PaidCourseCreateSchema,
  type PaidCourseUpdateSchema,
} from "../db/schema/paid_course";
import { s3Client } from "../../utils/configAWS";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { user_course } from "../db/schema";

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

export const getPaidCourseForUser = async (
  course_id: number,
  user_id: number
) => {
  const [check] = await db
    .select()
    .from(user_course)
    .where(
      and(
        eq(user_course.paid_course_id, course_id),
        eq(user_course.user_id, user_id)
      )
    );

  let result = null;
  if (check === undefined) {
    result = await db.query.paidCourse.findFirst({
      where: eq(paidCourse.id, course_id),
    });
  } else {
    result = await db.query.paidCourse.findFirst({
      where: eq(paidCourse.id, course_id),
      with: { paidLesson: true },
    });
  }

  if (result === undefined)
    throw new NotFoundError(`Course with id ${course_id} not found`);

  return result;
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

export const updatePaidCourseThumbnail = async (id: number, file: File) => {
  const paidCourseToUpdate = await getPaidCourseById(id);
  if (paidCourseToUpdate === undefined)
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
    .update(paidCourse)
    .set({ thumbnail: thumbnailUrl })
    .where(eq(paidCourse.id, id))
    .returning();

  return result;
};

export const deletePaidCourse = async (id: number) => {
  const paidCourseToUpdate = await getPaidCourseById(id);
  if (paidCourseToUpdate === undefined)
    throw new NotFoundError(`Course with id ${id} not found`);

  await db.delete(paidCourse).where(eq(paidCourse.id, id));
};
