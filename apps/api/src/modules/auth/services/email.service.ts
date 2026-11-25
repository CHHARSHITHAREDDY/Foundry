import { prismaDatabase } from "../../../db/prisma.service.js";

export interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  link?: string;
  type: "VERIFY_EMAIL" | "PASSWORD_RESET" | "SECURITY_ALERT";
}

export class EmailDeliveryService {
  async send(params: SendEmailParams): Promise<void> {
    const isProd = process.env.NODE_ENV === "production";
    const resendKey = process.env.RESEND_API_KEY;

    if (isProd && resendKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "Foundry <noreply@foundry.studio>",
          to: [params.to],
          subject: params.subject,
          text: `${params.body}${params.link ? `\n\nLink: ${params.link}` : ""}`,
        }),
      });
      if (!res.ok) {
        throw new Error(`Email provider error: ${res.status}`);
      }
      return;
    }

    // Dev mode: persist to dev_outbox table and print link to console
    const prisma = await prismaDatabase.ensureReady();
    if (prisma) {
      await prisma.devOutbox.create({
        data: {
          to: params.to,
          subject: params.subject,
          body: params.body,
          link: params.link || null,
          type: params.type,
        },
      });
    }

    console.log(`\n📧 [DEV OUTBOX] To: ${params.to} | Subject: ${params.subject}`);
    if (params.link) {
      console.log(`🔗 [DEV OUTBOX LINK] ${params.link}\n`);
    }
  }
}

export const emailDeliveryService = new EmailDeliveryService();
