import { eq } from "drizzle-orm";
import { db } from "../db";
import {
  answer,
  type AnswerCreateSchema,
  type AnswerSchema,
} from "../db/schema/answer";
import { NotFoundError } from "../../types";

export const getAllAnswerByQuestionId = async (questionId: number) => {
  return await db.query.answer.findMany({
    where: eq(answer.questionId, questionId),
  });
};

export const createAnswer = async (data: AnswerCreateSchema) => {
  await db.insert(answer).values(data).returning();
};

export const updateAnswer = async (id: number, data: AnswerSchema) => {
  const result = await getAnswerById(id);
  if (result === undefined) {
    throw new NotFoundError("Answer not found");
  }

  await db.update(answer).set(data).where(eq(answer.id, id)).returning();
};

export const deleteAnswer = async (id: number) => {
  const result = await getAnswerById(id);
  if (result === undefined) {
    throw new NotFoundError("Answer not found");
  }

  await db.delete(answer).where(eq(answer.id, id));
};

export const getAnswerById = async (id: number) => {
  return await db.query.answer.findFirst({
    where: eq(answer.id, id),
  });
};
