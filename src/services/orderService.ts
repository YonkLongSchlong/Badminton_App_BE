import { eq, and, gte, lte } from "drizzle-orm";
import { db } from "../db";
import {
  order,
  type OrderCreateSchema,
  type OrderSchema,
  type OrderUpdateCreatedAtSchema,
  type PaymentIntentCreateSchema,
} from "../db/schema/order";
import { NotFoundError } from "../../types";

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

export const getAllOrders = async () => {
  const orders = await db.select().from(order);
  return orders;
};

export const getAllOrderForCoach = async (id: Number) => {
  const orders = await db.query.order.findMany({
    with: { paidCourse: true },
  });

  const orderForCoach: any = [];
  orders.forEach((order) => {
    if (order.paidCourse.coachId == id) {
      orderForCoach.push(order);
    }
  });

  return orderForCoach;
};

export const getRevenueByMonthForCoach = async (id: Number) => {
  const orders = await getAllOrderForCoach(id);

  const revenueByMonth: { [key: string]: number } = {
    January: 0,
    February: 0,
    March: 0,
    April: 0,
    May: 0,
    June: 0,
    July: 0,
    August: 0,
    September: 0,
    October: 0,
    November: 0,
    December: 0,
  };

  orders.forEach((order: OrderSchema) => {
    const monthIndex = new Date(order.created_at as any).getMonth();
    const monthName = new Intl.DateTimeFormat("en-US", {
      month: "long",
    }).format(new Date(0, monthIndex));

    revenueByMonth[monthName] += (Number(order.total) || 0) * 1000;
  });

  const revenueData = Object.keys(revenueByMonth).map((month) => ({
    month,
    revenue: revenueByMonth[month],
  }));

  return revenueData;
};

export const getRevenueByMonth = async () => {
  const orders = await db
    .select({
      totalAmount: order.total,
      createdAt: order.created_at,
    })
    .from(order)
    .where(eq(order.status, "success"));

  const revenueByMonth: { [key: string]: number } = {
    January: 0,
    February: 0,
    March: 0,
    April: 0,
    May: 0,
    June: 0,
    July: 0,
    August: 0,
    September: 0,
    October: 0,
    November: 0,
    December: 0,
  };

  orders.forEach((order) => {
    const monthIndex = new Date(order.createdAt).getMonth();
    const monthName = new Intl.DateTimeFormat("en-US", {
      month: "long",
    }).format(new Date(0, monthIndex));

    revenueByMonth[monthName] += (Number(order.totalAmount) || 0) * 1000;
  });

  const revenueData = Object.keys(revenueByMonth).map((month) => ({
    month,
    revenue: revenueByMonth[month],
  }));

  return revenueData;
};

export const getOrderById = async (id: number) => {
  return await db.query.order.findFirst({
    where: eq(order.id, id),
  });
};

export const updateCreatedAtOrder = async (
  id: number,
  data: OrderUpdateCreatedAtSchema
) => {
  const OrderToUpdate = await getOrderById(id);
  if (OrderToUpdate === undefined)
    throw new NotFoundError(`Order with id ${id} not found`);

  const updatedData = {
    ...data,
    created_at: new Date(data.created_at),
  };

  return await db
    .update(order)
    .set(updatedData)
    .where(eq(order.id, id))
    .returning();
};

export const filterOrdersByDate = async (
  startDate: string,
  endDate: string
) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error(
        "Invalid date format. Please provide valid start and end dates."
      );
    }

    const orders = await db
      .select({
        createdAt: order.created_at,
        totalAmount: order.total,
      })
      .from(order)
      .where(and(gte(order.created_at, start), lte(order.created_at, end))).orderBy(order.created_at);

    const revenueByDay: { [key: string]: number } = {};

    orders.forEach((order) => {
      const dateKey = new Date(order.createdAt).toISOString().split("T")[0]; // Format YYYY-MM-DD

      if (!revenueByDay[dateKey]) {
        revenueByDay[dateKey] = 0;
      }

      revenueByDay[dateKey] += (Number(order.totalAmount) || 0) * 1000;
    });

    const revenueData = Object.keys(revenueByDay).map((date) => ({
      date,
      revenue: revenueByDay[date],
    }));

    return revenueData;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw error;
  }
};
