import { Hono } from "hono";
import { ApiError } from "../../types";
import { createOrder, createStripeIntent } from "../services/orderService";
import {
  orderCreateSchema,
  paymentIntentCreateSchema,
  type OrderCreateSchema,
} from "../db/schema/order";
import { zValidator } from "@hono/zod-validator";

export const orderRoutes = new Hono();

/**
 * POST: /order/intent
 */
orderRoutes.post(
  "/intent",
  zValidator("json", paymentIntentCreateSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");
      const paymentIntent = await createStripeIntent(data);

      return c.json(paymentIntent);
    } catch (error) {
      if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

orderRoutes.post("", zValidator("json", orderCreateSchema), async (c) => {
  try {
    const data = c.req.valid("json");
    const result = await createOrder(data);

    return c.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});
