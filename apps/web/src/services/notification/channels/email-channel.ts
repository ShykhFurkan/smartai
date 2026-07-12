/**
 * Notification Service — Email Channel
 *
 * Stub implementation of the email channel.
 * Replace the send() body with a real email SDK call (e.g. Resend, SendGrid, Nodemailer)
 * when an email provider is configured.
 */

import { IEmailChannel, NotificationRecipient, NotificationPayload, ChannelDeliveryResult } from "../interfaces/notification-channel.interface";
import { logger } from "@smarthire/logger";

export class EmailChannel implements IEmailChannel {
  readonly channel = "email" as const;

  async send(
    recipient: NotificationRecipient,
    payload: NotificationPayload
  ): Promise<ChannelDeliveryResult> {
    if (!recipient.email) {
      return {
        channel: this.channel,
        success: false,
        error: "Recipient email address is missing",
      };
    }

    try {
      // ─── Provider placeholder ─────────────────────────────────────────────
      // TODO: Replace with a real provider SDK call, e.g.:
      //   const result = await resend.emails.send({
      //     from: process.env.EMAIL_FROM!,
      //     to: recipient.email,
      //     subject: payload.subject,
      //     html: payload.htmlBody ?? payload.body,
      //   });
      // ─────────────────────────────────────────────────────────────────────

      logger.info("[EmailChannel] Sending email (stub)", {
        to: recipient.email,
        subject: payload.subject,
        idempotencyKey: payload.idempotencyKey,
      });

      // Simulate provider response
      const mockExternalId = `email_stub_${Date.now()}`;

      return {
        channel: this.channel,
        success: true,
        externalId: mockExternalId,
        deliveredAt: new Date().toISOString(),
      };
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error("[EmailChannel] send failed", { error, recipient: recipient.email });
      return { channel: this.channel, success: false, error };
    }
  }
}
