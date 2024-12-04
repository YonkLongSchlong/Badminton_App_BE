import { db } from "../db";
import {
  user,
  type UserCreateSchema,
  type UserPasswordSchema,
  type UserUpdateSchema,
} from "../db/schema/user";
import { eq } from "drizzle-orm";
import { compare } from "bcrypt";
import { hashPassword } from "../../utils/authenticateUtils";
import { BadRequestError, NotFoundError } from "../../types";
import { s3Client } from "../../utils/configAWS";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { paidCourse, user_course } from "../db/schema";

export const createUser = async (data: UserCreateSchema) => {
  const checkUserEmail = await getUserByEmail(data.email);

  if (checkUserEmail !== undefined) {
    throw new BadRequestError("User with this email have already exist");
  }
  data.password = await hashPassword(data.password);

  await db.insert(user).values(data).returning();
};

export const getUser = async (id: number) => {
  const user = await getUserById(id);
  if (user === undefined)
    throw new NotFoundError(`User with id ${id} not found`);
  user.password = "";
  return user;
};

export const updateUser = async (id: number, data: UserUpdateSchema) => {
  const userToUpdate = await getUserById(id);
  if (userToUpdate === undefined)
    throw new NotFoundError(`User with id ${id} not found`);

  const checkUserEmail = await getUserByEmail(data.email);
  if (checkUserEmail !== undefined && checkUserEmail.id !== userToUpdate.id)
    throw new BadRequestError(`This email have already registered`);

  const [result] = await db
    .update(user)
    .set(data)
    .where(eq(user.id, id))
    .returning();
  result.password = "";
  return result;
};

export const updateUserAvatar = async (id: number, file: File) => {
  const userToUpdate = await getUserById(id);
  if (userToUpdate === undefined)
    throw new NotFoundError(`User with id ${id} not found`);

  const fileBuffer = await file.arrayBuffer();
  const base64File = Buffer.from(fileBuffer).toString("base64");

  const uploadParams = {
    Bucket: Bun.env.S3_AVATAR_BUCKET,
    Key: file.name,
    Body: Buffer.from(base64File, "base64"),
    ContentEncoding: "base64",
    ContentType: file.type,
  };

  await s3Client.send(new PutObjectCommand(uploadParams));
  const avatarUrl = `https://${uploadParams.Bucket}.s3.${Bun.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;

  const [result] = await db
    .update(user)
    .set({ avatar: avatarUrl })
    .where(eq(user.id, id))
    .returning();

  return result;
};

export const updateUserPassword = async (
  id: number,
  data: UserPasswordSchema
) => {
  const userToUpdate = await getUserById(id);
  if (userToUpdate === undefined)
    throw new NotFoundError(`User with id ${id} not found`);

  const check = await compare(data.password, userToUpdate.password);
  if (!check) throw new BadRequestError(`Password not match, please try again`);

  const newPassword = await hashPassword(data.newPassword);
  await db.update(user).set({ password: newPassword }).where(eq(user.id, id));
};

export const getUserByEmail = async (email: string) => {
  return await db.query.user.findFirst({ where: eq(user.email, email) });
};

export const getAllPaidCoursesUserEnrolled = async (id: number) => {
  return await db
    .select()
    .from(user_course)
    .where(eq(user_course.user_id, id))
    .innerJoin(paidCourse, eq(user_course.paid_course_id, paidCourse.id));
};

/* ------------------- PRIVATE METHOD -------------------  */
export const getUserById = async (id: number) => {
  return await db.query.user.findFirst({ where: eq(user.id, id) });
};
