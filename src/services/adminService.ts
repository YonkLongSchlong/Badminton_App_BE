import { eq } from "drizzle-orm";
import { db } from "../db";
import { admin, coach, user } from "../db/schema";
import type { AdminCreateSchema, AdminUpdateSchema } from "../db/schema/admin";
import { hashPassword } from "../../utils/authenticateUtils";
import { BadRequestError, NotFoundError } from "../../types";
import { s3Client } from "../../utils/configAWS";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const createAdmin = async (data: AdminCreateSchema) => {
  const checkAdminEmail = await getAdminByEmail(data.email);
  if (checkAdminEmail !== undefined)
    throw new BadRequestError("Admin with this email have already exist");

  data.password = await hashPassword(data.password);
  await db.insert(admin).values(data).returning();
};

export const updateAdmin = async (id: number, data: AdminUpdateSchema) => {
  const adminToUpdate = await getAdminById(id);
  if (adminToUpdate === undefined)
    throw new NotFoundError(`Admin with id ${id} not found`);

  const checkAdminEmail = await getAdminByEmail(data.email);
  if (checkAdminEmail !== undefined && checkAdminEmail.id !== adminToUpdate.id)
    throw new BadRequestError(`This email have already registered`);

  const [result] = await db
    .update(admin)
    .set(data)
    .where(eq(admin.id, id))
    .returning();
  result.password = "";
  return result;
};

export const updateAdminAvatar = async (id: number, file: File) => {
  const adminToUpdate = await getAdminById(id);
  if (adminToUpdate === undefined)
    throw new NotFoundError(`Admin with id ${id} not found`);

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
    .update(admin)
    .set({ avatar: avatarUrl })
    .where(eq(admin.id, id))
    .returning();

  return result;
};

export const getAllUsers = async () => {
  const users = await db.select().from(user);
  return users;
};

export const deleteUser = async (id: number) => {
  const userToDelete = await getUserById(id);
  if (userToDelete === undefined)
    throw new NotFoundError(`User with id ${id} not found`);

  await db.delete(user).where(eq(user.id, id));
};

export const getAllCoaches = async () => {
  return await db.select().from(coach);
};

export const deleteCoach = async (id: number) => {
  const coachToDelete = await getCoachById(id);
  if (coachToDelete === undefined)
    throw new NotFoundError(`Coach with id ${id} not found`);

  await db.delete(coach).where(eq(coach.id, id));
};

export const getAdminByEmail = async (email: string) => {
  return await db.query.admin.findFirst({ where: eq(admin.email, email) });
};

export const getAdminById = async (id: number) => {
  return await db.query.admin.findFirst({ where: eq(admin.id, id) });
};

/* ------------------- PRIVATE METHOD -------------------  */
const getUserById = async (id: number) => {
  return await db.query.user.findFirst({ where: eq(user.id, id) });
};

const getCoachById = async (id: number) => {
  return await db.query.coach.findFirst({ where: eq(coach.id, id) });
};
