import { Hono } from "hono";
import {
  ApiError,
  ApiResponse,
  BadRequestError,
  NotFoundError,
} from "../../types";
import {
  createOrder,
  createStripeIntent,
  filterOrdersByDate,
  getAllOrderForCoach,
  getAllOrders,
  getRevenueByMonth,
  getRevenueByMonthForCoach,
  stripe,
  updateCreatedAtOrder,
} from "../services/orderService";
import {
  filterOrderSchema,
  order,
  orderCreateSchema,
  orderUpdateCreatedAtSchema,
  paymentIntentCreateSchema,
  type OrderCreateSchema,
} from "../db/schema/order";
import { zValidator } from "@hono/zod-validator";
import {
  coachAndAdminAuthorization,
  userAuthorization,
} from "../middlewares/authMiddlewares";
import { env } from "hono/adapter";
import Stripe from "stripe";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { paidCourse, user_course } from "../db/schema";

export const orderRoutes = new Hono();

/**
 * POST: /order/intent
 */
orderRoutes.post(
  "/intent",
  userAuthorization,
  zValidator("json", paymentIntentCreateSchema),
  async (c) => {
    console.log("Here");
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

orderRoutes.post(
  "",
  userAuthorization,
  zValidator("json", orderCreateSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");
      const result = await createOrder(data);

      return c.json(new ApiResponse(200, "Order created successfully", result));
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);

        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

orderRoutes.post("/webhook", async (c) => {
  const STRIPE_WEBHOOK_SECRET =
    "whsec_e04b62a155fdd511acfea06fe668d806f58a5f701a2eaff2d989a55f41b1f1e3";
  const signature = c.req.header("stripe-signature");

  try {
    if (!signature) {
      return c.text("", 400);
    }
    const body = await c.req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
    console.log(event.type);

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;

        const [orderToPay] = await db
          .select()
          .from(order)
          .where(eq(order.stripePaymentIntentId, paymentIntent.id));

        const [paidCourseUpdate] = await db
          .select()
          .from(paidCourse)
          .where(eq(paidCourse.id, orderToPay.paidCourseId));

        await Promise.all([
          db
            .update(order)
            .set({ status: "success" })
            .where(eq(order.stripePaymentIntentId, paymentIntent.id)),
          db.insert(user_course).values({
            paid_course_id: orderToPay.paidCourseId,
            free_course_id: null,
            user_id: orderToPay.userId,
            status: 0,
          }),
          db
            .update(paidCourse)
            .set({ studentQuantity: paidCourseUpdate.studentQuantity! + 1 })
            .where(eq(paidCourse.id, orderToPay.paidCourseId)),
        ]);

        return c.json(new ApiResponse(200, "Process payment successfully"));
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        await db
          .update(order)
          .set({ status: "failed" })
          .where(eq(order.stripePaymentIntentId, paymentIntent.id));

        return c.json(
          new ApiError(404, "", "Failed to process payment, please try again"),
          404
        );
      }
      default:
        console.log("Here");
        return c.text("Event type not handled", 200);
    }
  } catch (err) {
    const errorMessage = `⚠️  Webhook signature verification failed. ${
      err instanceof Error ? err.message : "Internal server error"
    }`;
    console.log(errorMessage);
    return c.text(errorMessage, 400);
  }
});

/**
 * GET: /order
 */
orderRoutes.get("/", coachAndAdminAuthorization, async (c) => {
  try {
    const orders = await getAllOrders();

    return c.json(orders);
  } catch (error) {
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});

/**
 * GET: /order/coach/:id
 */
orderRoutes.get("/coach/:id", coachAndAdminAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const orders = await getAllOrderForCoach(id);

    return c.json(orders);
  } catch (error) {
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});

/**
 * GET: /order/revenue/coach/:id
 */
orderRoutes.get("/revenue/coach/:id", coachAndAdminAuthorization, async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"));
    const revenueData = await getRevenueByMonthForCoach(id);
    return c.json(
      new ApiResponse(200, "Revenue data fetched successfully", revenueData)
    );

    return c.json(revenueData);
  } catch (error) {
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});

/**
 * GET: /order/revenue
 */
orderRoutes.get("/revenue", coachAndAdminAuthorization, async (c) => {
  try {
    const revenueData = await getRevenueByMonth();
    return c.json(
      new ApiResponse(200, "Revenue data fetched successfully", revenueData)
    );
  } catch (error) {
    if (error instanceof Error) {
      return c.json(new ApiError(500, error.name, error.message), 500);
    }
  }
});

/**
 * PATCH: /order/:id
 */
orderRoutes.patch(
  "/:id",
  coachAndAdminAuthorization,
  zValidator("json", orderUpdateCreatedAtSchema),
  async (c) => {
    try {
      const id = Number.parseInt(c.req.param("id"));
      const data = c.req.valid("json");
      await updateCreatedAtOrder(id, data);

      return c.json(new ApiResponse(200, "Order updated successfully"));
    } catch (error) {
      if (error instanceof BadRequestError) {
        return c.json(new ApiError(400, error.name, error.message), 400);
      }
      if (error instanceof NotFoundError) {
        return c.json(new ApiError(404, error.name, error.message), 404);
      }
      if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

/**
 * POST: /order/filter
 */
orderRoutes.post(
  "/filter",
  coachAndAdminAuthorization,
  zValidator("json", filterOrderSchema),
  async (c) => {
    try {
      const data = c.req.valid("json"); 

      const { startDate, endDate } = data;
      const orders = await filterOrdersByDate(startDate, endDate);

      return c.json(new ApiResponse(200, "Orders fetched successfully", orders));
    } catch (error) {
      if (error instanceof BadRequestError) {
        return c.json(new ApiError(400, error.name, error.message), 400);
      }
      if (error instanceof Error) {
        return c.json(new ApiError(500, error.name, error.message), 500);
      }
    }
  }
);

