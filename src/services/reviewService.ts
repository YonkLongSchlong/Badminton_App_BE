import { eq } from "drizzle-orm";
import { db } from "../db";
import { paidCourse, review } from "../db/schema";
import type {
  ReviewCreateSchema,
  ReviewUpdateSchema,
} from "../db/schema/review";
import { BadRequestError, NotFoundError } from "../../types";

export const getReviewByCourseId = async (courseId: number) => {
  return await db.query.review.findMany({
    where: eq(review.paidCourseId, courseId),
    with: { user: true },
  });
};

export const createReview = async (data: ReviewCreateSchema) => {
  let result = null;
  await db.transaction(async (tx) => {
    result = await tx.insert(review).values(data).returning();
    await calculateRating(data.paidCourseId as number, tx);
  });

  if (result === null) {
    throw new BadRequestError("Failed to create review");
  }

  return result;
};

export const updateReview = async (id: number, data: ReviewUpdateSchema) => {
  const [check] = await db.select().from(review).where(eq(review.id, id));
  if (check === undefined) {
    throw new NotFoundError(`Review with id ${id} not found`);
  }

  const [checkUser] = await db
    .select()
    .from(review)
    .where(eq(review.userId, data.userId as number));

  if (checkUser === undefined) {
    throw new BadRequestError("You can't update other user review");
  }

  let result = null;
  await db.transaction(async (tx) => {
    result = await tx
      .update(review)
      .set(data)
      .where(eq(review.id, id))
      .returning();
    await calculateRating(data.paidCourseId as number, tx);
  });

  if (result === null) {
    throw new BadRequestError("Failed to update review");
  }

  return result;
};

export const deleteReview = async (
  id: number,
  courseId: number,
  userId: number
) => {
  const [checkUser] = await db
    .select()
    .from(review)
    .where(eq(review.userId, userId));

  if (checkUser === undefined) {
    throw new BadRequestError("You can't update other user review");
  }

  await db.transaction(async (tx) => {
    await tx.delete(review).where(eq(review.id, id));
    await calculateRating(courseId, tx);
  });
};

export const calculateRating = async (courseId: number, tx = db) => {
  const reviews = await tx
    .select()
    .from(review)
    .where(eq(review.paidCourseId, courseId));

  const totalRating = reviews.reduce((acc, review) => acc + review.rating!, 0);

  const star = totalRating / reviews.length;
  console.log(star);

  await tx
    .update(paidCourse)
    .set({ star: star })
    .where(eq(paidCourse.id, courseId));
};
