import { eq } from "drizzle-orm";
import { db } from "../db";
import { freeLesson, paidLesson, question } from "../db/schema";
import type { QuestionCreateSchema } from "../db/schema/question";
import { NotFoundError } from "../../types";

export const getAllQuestionsByFreeLessonId = async (freeLessonId: number) => {
  return await db.query.question.findMany({
    where: eq(question.freeLessonId, freeLessonId),
    with: { answer: true },
  });
};

export const getAllQuestionsByPaidLessonId = async (paidLessonId: number) => {
  return await db.query.question.findMany({
    where: eq(question.paidLessonId, paidLessonId),
    with: { answer: true },
  });
};

export const createQuestionForFreeLesson = async (
  data: QuestionCreateSchema
) => {
  const freeLessonCheck = await db.query.freeLesson.findFirst({
    where: eq(freeLesson.id, data.freeLessonId!),
  });

  if (freeLessonCheck === undefined) {
    throw new NotFoundError("Free lesson not found");
  }

  return await db.insert(question).values(data).returning();
};

export const createQuestionForPaidLesson = async (
  data: QuestionCreateSchema
) => {
  const freeLessonCheck = await db.query.paidLesson.findFirst({
    where: eq(paidLesson.id, data.paidLessonId!),
  });

  if (freeLessonCheck === undefined) {
    throw new NotFoundError("Free lesson not found");
  }

  return await db.insert(question).values(data).returning();
};

export const updateQuestionForFreeLesson = async (
  questionId: number,
  data: QuestionCreateSchema
) => {
  const freeLessonCheck = await db.query.freeLesson.findFirst({
    where: eq(freeLesson.id, data.freeLessonId!),
  });

  if (freeLessonCheck === undefined) {
    throw new NotFoundError("Free lesson not found");
  }

  await db
    .update(question)
    .set(data)
    .where(eq(question.id, questionId))
    .returning();
};

export const updateQuestionForPaidLesson = async (
  questionId: number,
  data: QuestionCreateSchema
) => {
  const paidLessonCheck = await db.query.paidLesson.findFirst({
    where: eq(paidLesson.id, data.paidLessonId!),
  });

  if (paidLessonCheck === undefined) {
    throw new NotFoundError("Paid lesson not found");
  }

  await db
    .update(question)
    .set(data)
    .where(eq(question.id, questionId))
    .returning();
};

export const deleteQuestion = async (questionId: number) => {
  const result = await getQuestionById(questionId);
  if (result === undefined) {
    throw new NotFoundError("Question not found");
  }

  await db.delete(question).where(eq(question.id, questionId));
};

export const getQuestionById = async (questionId: number) => {
  return await db.query.question.findFirst({
    where: eq(question.id, questionId),
  });
};
