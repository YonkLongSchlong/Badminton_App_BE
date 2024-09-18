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

  await next();
});

export const userAuthorization = createMiddleware(async (c, next) => {
  const payload = await checkToken(c);
  if (payload.role !== "user") {
    throw new HTTPException(403, {
      message: "You don't have permission to continue",
    });
  }

  await next();
});

export const coachAuthorization = createMiddleware(async (c, next) => {
  const payload = await checkToken(c);
  if (payload.role !== "coach") {
    throw new HTTPException(403, {
      message: "You don't have coach permission to continue",
    });
  }

  await next();
});

const checkToken = async (c: Context<any, string, {}>): Promise<JWTPayload> => {
  const authHeader: string | undefined = c.req.header("authorization");

  if (authHeader === undefined) {
    throw new HTTPException(403, {
      message: "Missing authorization token",
    });
  }

  const token = authHeader.substring(7, authHeader.length);

  return await verify(token as string, Bun.env.JWT_SECRET || "");
};
