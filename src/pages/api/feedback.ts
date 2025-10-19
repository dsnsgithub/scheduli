import nodemailer from "nodemailer";

interface Request {
  email: string;
  scheduleLink: string;
  additionalInformation: string;
}

import type { NextApiRequest, NextApiResponse } from "next";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).send({ message: "Only POST requests allowed" });
  }

  const body: Request = req.body;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: process.env["googleEmail"],
      pass: process.env["googlePass"],
    },
  });

  await transporter.sendMail({
    from: "no-reply@dsns.dev",
    to: process.env["email"],
    subject: "Feedback - Schedule Request",
    text: `Return Email: ${body.email} \nSchedule Link: ${body.scheduleLink}\nAdditional Information: ${body.additionalInformation}`,
  });

  res.status(200).json({ error: "Success!!" });
}
