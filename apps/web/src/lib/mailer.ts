import "server-only";
import nodemailer from "nodemailer";
import type { ContactInput } from "@/lib/contact";

export async function sendContactMail({
  name,
  email,
  message,
}: Pick<ContactInput, "name" | "email" | "message">): Promise<void> {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) throw new Error("EMAIL_USER and EMAIL_PASS are not set");

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
  });

  await transporter.sendMail({
    from: `"Relgari Contact" <${user}>`,
    to: user,
    replyTo: email,
    subject: `Relgari: new message from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
  });
}
