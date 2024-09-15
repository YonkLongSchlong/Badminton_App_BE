import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { verify } from "hono/jwt";
import type { JWTPayload } from "hono/utils/jwt/types";

export const adminAuthorization = createMiddleware(async (c, next) => {
  const payload = await checkToken(c);
  if (payload.role !== "admin") {
    throw new HTTPException(403, {
      message: "You don't have admin permission to continue",
    });
  }

  next();
});

export const userAuthorization = createMiddleware(async (c, next) => {
  const payload = await checkToken(c);
  if (payload.role !== "user") {
    throw new HTTPException(403, {
      message: "You don't have permission to continue",
    });
  }

  next();
});

export const coachAuthorization = createMiddleware(async (c, next) => {
  const payload = await checkToken(c);
  if (payload.role !== "coach") {
    throw new HTTPException(403, {
      message: "You don't have coach permission to continue",
    });
  }

  next();
});

const checkToken = async (c: Context<any, string, {}>): Promise<JWTPayload> => {
  const token: string | undefined = c.req.header("token");
  if (token === undefined) {
    throw new HTTPException(403, {
      message: "Missing authorization token",
    });
  }
  return await verify(token as string, Bun.env.JWT_SECRET || "");
};
