import { Hono } from "hono";

export const coachRotes = new Hono()
  .get("/", (c) => {
    return c.json([]);
  })
  .get("/:id{[0-9]+}", (c) => {
    const id: number = Number.parseInt(c.req.param("id"));
    return c.text(`User with id ${id}`);
  })
  .post("/", async (c) => {
    const coach = await c.req.json();
    return c.json({
      coach,
    });
  })
  .patch("/:id{[0-9]+}", (c) => {
    const id: number = Number.parseInt(c.req.param("id"));
    return c.text(`Update coach with id ${id}`);
  })
  .delete("/:id{[0-9]+}", (c) => {
    const id: number = Number.parseInt(c.req.param("id"));
    return c.text(`Delete coach with id ${id}`);
  });
