import { eq } from "drizzle-orm";
import { db } from "../db";
import { user_course } from "../db/schema";
import {
  order,
  type OrderCreateSchema,
  type PaymentIntentCreateSchema,
} from "../db/schema/order";

export const stripe = require("stripe")(Bun.env.STRIPE_SECRET_KEY as string);

export const createStripeIntent = async (data: PaymentIntentCreateSchema) => {
  try {
    const amountInVND = data.coursePrice * 1000;

    if (amountInVND < 10000) {
      throw new Error("Amount must be at least ₫10,000.");
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInVND,
      currency: "vnd",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    await db
      .update(order)
      .set({ stripePaymentIntentId: paymentIntent.id })
      .where(eq(order.id, data.orderId));

    return { paymentIntent: paymentIntent.client_secret };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};

export const createOrder = async (data: OrderCreateSchema) => {
  const [result] = await db.insert(order).values(data).returning();
  return result;
};
