import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: Bun.env.EMAIL_USER, 
    pass: Bun.env.EMAIL_PASSWORD, 
  },
});

export const sendOtpEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: Bun.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully');
  } catch (error) {
    console.error('Error sending OTP email:', error);
  }
};
