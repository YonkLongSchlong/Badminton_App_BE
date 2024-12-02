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
  c.set("adminId", payload.id);
  await next();
});

export const userAuthorization = createMiddleware(async (c, next) => {
  const payload = await checkToken(c);
  if (payload.role !== "user") {
    throw new HTTPException(403, {
      message: "You don't have permission to continue",
    });
  }
  c.set("userId", payload.id);
  await next();
});

export const coachAuthorization = createMiddleware(async (c, next) => {
  const payload = await checkToken(c);
  if (payload.role !== "coach") {
    throw new HTTPException(403, {
      message: "You don't have coach permission to continue",
    });
  }
  c.set("coachId", payload.id);
  await next();
});

export const coachAndAdminAuthorization = createMiddleware(async (c, next) => {
  const payload = await checkToken(c);
  if (payload.role === "user") {
    throw new HTTPException(403, {
      message: "You don't have coach or admin permission to continue",
    });
  }

  if (payload.role === "coach") {
    c.set("coachId", payload.id);
  } else {
    c.set("adminId", payload.id);
  }
  await next();
});

export const allRoleAuthorization = createMiddleware(async (c, next) => {
  await checkToken(c);
  await next();
});

const checkToken = async (c: Context<any, string, {}>): Promise<JWTPayload> => {
  const authHeader: string | undefined = c.req.header("authorization");
  if (authHeader === undefined) {
    throw new HTTPException(401, {
      message: "Missing authorization token",
    });
  }

  const token = authHeader.substring(7, authHeader.length);

  let payload: JWTPayload;
  try {
    payload = (await verify(
      token as string,
      Bun.env.JWT_SECRET || ""
    )) as JWTPayload;
  } catch (error) {
    throw new HTTPException(401, {
      message: "Invalid JWT token",
    });
  }

  if (payload.exp && Date.now() >= payload.exp * 1000) {
    throw new HTTPException(401, {
      message: "JWT token has expired",
    });
  }

  return payload;
};
