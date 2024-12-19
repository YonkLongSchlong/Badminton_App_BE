import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { BadRequestError, NotFoundError } from "../../types";
import {
  paidCourse,
  type PaidCourseCreateSchema,
  type PaidCourseUpdateSchema,
} from "../db/schema/paid_course";
import { s3Client } from "../../utils/configAWS";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { paidLesson, review, user_course } from "../db/schema";
import { check } from "drizzle-orm/mysql-core";

/* -------------- PAID COURSE ------------------- */
export const createPaidCourse = async (data: PaidCourseCreateSchema) => {
  return await db.insert(paidCourse).values(data);
};

export const getAllPaidCourse = async () => {
  return await db.query.paidCourse.findMany({
    where: eq(paidCourse.status, "publish"),
    with: { category: true },
  });
};

export const getAllPaidCourseForAdmin = async () => {
  return await db.query.paidCourse.findMany({
    with: { category: true },
  });
};

export const getPaidCourseByCategoryId = async (categoryId: number) => {
  return await db.query.paidCourse.findMany({
    where: and(
      eq(paidCourse.status, "publish"),
      eq(paidCourse.categoryId, categoryId)
    ),
    with: { category: true, review: true },
  });
};

export const getPaidCourseByStatus = async (
  status: "publish" | "non-publish"
) => {
  return await db
    .select()
    .from(paidCourse)
    .innerJoin(review, eq(review.paidCourseId, paidCourse.id))
    .where(eq(paidCourse.status, status));
};

export const getPaidCourseByCoachId = async (coachId: number) => {
  return await db
    .select()
    .from(paidCourse)
    .leftJoin(review, eq(review.paidCourseId, paidCourse.id))
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

  console.log(check);

  const result = await db.query.paidCourse.findFirst({
    where: eq(paidCourse.id, course_id),
    with: { paidLesson: true, review: true },
  });

  return { result, unlock: check === undefined ? false : true };
};

export const getPaidCourseById = async (id: number) => {
  const result = await db.query.paidCourse.findFirst({
    where: eq(paidCourse.id, id),
    with: {
      paidLesson: true,
      review: true,
      coach: true,
      user_course: {
        with: {
          user: true,
        },
      },
    },
  });

  if (result === undefined)
    throw new NotFoundError(`Course with id ${id} not found`);

  return result;
};

export const updatePaidCourse = async (
  id: number,
  data: PaidCourseUpdateSchema
) => {
  const [paidCourseToUpdate] = await db
    .select()
    .from(paidCourse)
    .where(eq(paidCourse.id, id));

  if (paidCourseToUpdate === undefined)
    throw new NotFoundError(`Course with id ${id} not found`);

  // await checkCoachPermission(id, data.coachId);

  return await db
    .update(paidCourse)
    .set(data)
    .where(eq(paidCourse.id, id))
    .returning();
};

export const updatePaidCourseThumbnail = async (id: number, file: File) => {
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
  const [paidCourseToUpdate] = await db
    .select()
    .from(paidCourse)
    .where(eq(paidCourse.id, id));

  if (paidCourseToUpdate === undefined)
    throw new NotFoundError(`Course with id ${id} not found`);

  // await checkCoachPermission(id, coachId);

  await db.delete(paidCourse).where(eq(paidCourse.id, id));
};

export const checkCoachPermission = async (
  courseId: number,
  coachId: number
) => {
  const checkCoach = await db.query.paidCourse.findFirst({
    where: and(eq(paidCourse.coachId, coachId), eq(paidCourse.id, courseId)),
  });

  if (checkCoach === undefined) {
    throw new BadRequestError(
      "You don't have permission to modify this course"
    );
  }
};
