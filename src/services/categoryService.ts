import { db } from "../db";
import { eq } from "drizzle-orm";
import { BadRequestError, NotFoundError } from "../../types";
import {
  category,
  type CategoryCreateSchema,
  type CategoryUpdateSchema,
} from "../db/schema/category";

export const createCategory = async (data: CategoryCreateSchema) => {
  const checkCategoryName = await getCategoryByName(data.name);
  if (checkCategoryName !== undefined) {
    throw new BadRequestError("Category with this name have already exist");
  }

  await db.insert(category).values(data);
};

export const getAllCategories = async () => {
  return await db.select().from(category);
};

export const updateCategory = async (
  id: number,
  data: CategoryUpdateSchema
) => {
  const categoryToUpdate = await getCategoryById(id);
  if (categoryToUpdate === undefined)
    throw new NotFoundError(`Category with id ${id} not found`);

  const checkCategoryName = await getCategoryByName(data.name);
  if (checkCategoryName !== undefined) {
    throw new BadRequestError("Category with this name have already exist");
  }

  await db.update(category).set(data).where(eq(category.id, id)).returning();
};

export const getCategoryByName = async (name: string) => {
  return await db.query.category.findFirst({ where: eq(category.name, name) });
};

export const getCategoryById = async (id: number) => {
  return await db.query.category.findFirst({
    where: eq(category.id, id),
    with: { freeCourse: true },
  });
};
