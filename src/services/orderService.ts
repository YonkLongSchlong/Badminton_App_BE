import { db } from "../db";
import {
  order,
  type OrderCreateSchema,
  type PaymentIntentCreateSchema,
} from "../db/schema/order";

const stripe = require("stripe")(Bun.env.STRIPE_SECRET_KEY as string);

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

    return { paymentIntent: paymentIntent.client_secret };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};

export const createOrder = async (data: OrderCreateSchema) => {
  return await db.insert(order).values(data).returning();
};
