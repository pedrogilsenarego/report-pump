import nodemailer from "nodemailer";

// SMTP credentials. For Brevo:
//  - SMTP_USER: the SMTP login from Brevo (e.g. xxxxxx@smtp-brevo.com)
//  - SMTP_PASS: the generated SMTP key (NOT your Brevo account password)
//  - MAIL_FROM: a verified sender address in Brevo
// Falls back to the legacy NEXT_EMAIL / NEXT_EMAIL_PWD vars for compatibility.
const user = process.env.SMTP_USER ?? process.env.NEXT_EMAIL;
const pass = process.env.SMTP_PASS ?? process.env.NEXT_EMAIL_PWD;
const from = process.env.MAIL_FROM ?? process.env.NEXT_EMAIL;

const host = process.env.SMTP_HOST ?? "smtp-relay.brevo.com";
const port = Number(process.env.SMTP_PORT ?? 587);

export const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465, // true for 465 (SSL), false for 587 (STARTTLS)
  auth: {
    user,
    pass,
  },
});

export const mailOptions = {
  from,
  to: from,
};
