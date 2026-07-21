/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/send-message/route.ts

import { NextResponse } from "next/server";
import { mailOptions, transporter } from "../../../config/nodemailer";

const ADMIN_EMAIL = "ADMIN@FP25.com";

// POST request handler: sends the user-typed message to the administrator.
export async function POST(req: Request) {
  const data = await req.json();
  const message: string | undefined = data?.message?.trim();

  if (!message) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }

  const from: string | undefined = data?.from;
  const subject = from ? `New message from ${from}` : "New message";

  try {
    await transporter.sendMail({
      ...mailOptions,
      to: ADMIN_EMAIL,
      subject,
      text: message,
      html: `<p style="white-space: pre-wrap; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; color: #2a2a2a;">${message}</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.log(err);
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
