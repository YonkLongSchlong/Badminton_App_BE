import { db, redisClient } from "../db";
import {
  user,
  type UserCreateSchema,
  type UserPasswordSchema,
  type UserUpdateSchema,
} from "../db/schema/user";
import { eq } from "drizzle-orm";
import { compare, genSalt, hash } from "bcrypt";
import { hashPassword } from "../../utils/authenticateUtils";
import { generateOtp } from "../../utils/authenticateUtils";


export const createUser = async (data: UserCreateSchema) => {
  const checkUserEmail = await getUserByEmail(data.email);

  if (checkUserEmail !== undefined) return false;
  data.password = await hashPassword(data.password);

  const [result] = await db.insert(user).values(data).returning();
  return result.id;
};

export const getUser = async (id: number) => {
  const user = await getUserById(id);
  if (user === undefined) return null;
  user.password = "";
  return user;
};

export const updateUser = async (id: number, data: UserUpdateSchema) => {
  const userToUpdate = await getUserById(id);
  if (userToUpdate === undefined) return null;

  const checkUserEmail = await getUserByEmail(data.email);
  if (checkUserEmail !== undefined && checkUserEmail.id !== userToUpdate.id)
    return false;

  const [result] = await db
    .update(user)
    .set(data)
    .where(eq(user.id, id))
    .returning();
  result.password = "";

  return result;
};

export const updateUserPassword = async (
  id: number,
  data: UserPasswordSchema
) => {
  const userToUpdate = await getUserById(id);
  if (userToUpdate === undefined) return null;
  const check = await compare(userToUpdate.password, data.password);
  if (!check) {
    return false;
  }
  const newPassword = await hashPassword(data.password);
  await db.update(user).set({ password: newPassword }).where(eq(user.id, id));
};

export const authenticateUserRegister = async (data: UserCreateSchema) => {
  const checkUserEmail = await getUserByEmail(data.email);

  if (checkUserEmail !== undefined) return false;
  const otp = generateOtp();
  await redisClient.set(data.email, otp.otp, { EX: 60 * 5 });
  return otp;
};

export const getUserByEmail = async (email: string) => {
  return await db.query.user.findFirst({ where: eq(user.email, email) });
};

/* ------------------- PRIVATE METHOD -------------------  */
const getUserById = async (id: number) => {
  return await db.query.user.findFirst({ where: eq(user.id, id) });
};


