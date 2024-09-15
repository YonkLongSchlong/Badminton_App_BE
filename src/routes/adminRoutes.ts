import { Hono } from "hono";
import { adminAuthorization } from "../middlewares/authMiddlewares";

export const adminRoutes = new Hono();

adminRoutes.use(adminAuthorization);

adminRoutes
  .get("/", (c) => {
    return c.json([]);
  })
  .get("/:id{[0-9]+}", (c) => {
    const id: number = Number.parseInt(c.req.param("id"));
    return c.text(`admin with id ${id}`);
  })
  .post("/", async (c) => {
    const admin = await c.req.json();
    return c.json({
      admin,
    });
  })
  .patch("/:id{[0-9]+}", (c) => {
    const id: number = Number.parseInt(c.req.param("id"));
    return c.text(`Update admin with id ${id}`);
  })
  .delete("/:id{[0-9]+}", (c) => {
    const id: number = Number.parseInt(c.req.param("id"));
    return c.text(`Delete admin with id ${id}`);
  });
