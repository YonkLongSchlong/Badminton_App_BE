import { db } from "../db";
import { eq } from "drizzle-orm";
import { compare } from "bcrypt";
import { coach } from "../db/schema";
import type {
  CoachCreateSchema,
  CoachPasswordSchema,
  CoachUpdateSchema,
} from "../db/schema/coach";
import { hashPassword } from "../../utils/authenticateUtils";
import { BadRequestError, NotFoundError } from "../../types";
import { s3Client } from "../../utils/configAWS";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const createCoach = async (data: CoachCreateSchema) => {
  const checkCoachEmail = await getCoachByEmail(data.email);

  if (checkCoachEmail !== undefined)
    throw new BadRequestError("Coach with this email have already exist");
  data.password = await hashPassword(data.password);

  await db.insert(coach).values(data).returning();
};

export const getCoach = async (id: number) => {
  const coach = await getCoachById(id);
  if (coach === undefined)
    throw new NotFoundError(`User with id ${id} not found`);
  coach.password = "";
  return coach;
};

export const updateCoach = async (id: number, data: CoachUpdateSchema) => {
  const coachToUpdate = await getCoachById(id);
  if (coachToUpdate === undefined)
    throw new NotFoundError(`Coach with id ${id} not found`);

  const checkCoachEmail = await getCoachByEmail(data.email);
  if (checkCoachEmail !== undefined && checkCoachEmail.id !== coachToUpdate.id)
    throw new BadRequestError(`Email ${data.email} have already registered`);

  const [result] = await db
    .update(coach)
    .set(data)
    .where(eq(coach.id, id))
    .returning();
  result.password = "";

  return result;
};

export const updateCoachAvatar = async (id: number, file: File) => {
  const coachToUpdate = await getCoachById(id);
  if (coachToUpdate === undefined)
    throw new NotFoundError(`Coach with id ${id} not found`);

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
    .update(coach)
    .set({ avatar: avatarUrl })
    .where(eq(coach.id, id))
    .returning();

  return result;
};

export const updateCoachPassword = async (
  id: number,
  data: CoachPasswordSchema
) => {
  const coachToUpdate = await getCoachById(id);
  if (coachToUpdate === undefined)
    throw new NotFoundError(`Coach with id ${id} not found`);

  const check = await compare(coachToUpdate.password, data.password);
  if (!check) throw new BadRequestError(`Password not match, please try again`);

  const newPassword = await hashPassword(data.password);
  await db.update(coach).set({ password: newPassword }).where(eq(coach.id, id));
};

export const getCoachByEmail = async (email: string) => {
  return await db.query.coach.findFirst({ where: eq(coach.email, email) });
};

/* ------------------- PRIVATE METHOD -------------------  */
const getCoachById = async (id: number) => {
  return await db.query.coach.findFirst({ where: eq(coach.id, id) });
};
