import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendMail = async (email, subject, text) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject,
    text,
  });
};

export default sendMail;
