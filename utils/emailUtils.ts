import nodemailer from "nodemailer";
import type { OrderSchema } from "../src/db/schema/order";
import { db } from "../src/db";
import { eq } from "drizzle-orm";
import { paidCourse } from "../src/db/schema";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: Bun.env.EMAIL_USER,
    pass: Bun.env.EMAIL_PASSWORD,
  },
});

export const sendOtpEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: Bun.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP email sent successfully");
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
};

export const sendConfirmOrder = async (email: string, order: OrderSchema) => {
  const boughtPaidCourse = await db.query.paidCourse.findFirst({
    where: eq(paidCourse.id, order.paidCourseId),
  });

  const mailOptions = {
    from: Bun.env.EMAIL_USER,
    to: email,
    subject: "Cour companion payment confirm",
    html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #333;">Payment Confirmation</h2>
      <p>Dear Customer,</p>
      <p>This is an email to confirm your payment for the course with ID <strong>${order.paidCourseId}</strong>.</p>
      <p>Course name: <strong>${boughtPaidCourse?.name}</strong></p>
      <p>The amount of payment is <strong>${order.total}</strong>.</p>
      <p>Thank you for your purchase!</p>
      <p>Best regards,</p>
      <p>Your Course Companion Team</p>
    </div>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Confirm payment sent successfully");
  } catch (error) {
    console.error("Error sending confirm payment email:", error);
  }
};
