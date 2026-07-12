/**
 * Notification Service — SMS Channel (Placeholder)
 *
 * Placeholder implementation of the SMS channel.
 * Replace the send() body with a real SMS SDK call (e.g. Twilio, AWS SNS)
 * when an SMS provider is configured.
 */

import { ISMSChannel, NotificationRecipient, NotificationPayload, ChannelDeliveryResult } from "../interfaces/notification-channel.interface";
import { logger } from "@smarthire/logger";

export class SMSChannel implements ISMSChannel {
  readonly channel = "sms" as const;

  async send(
    recipient: NotificationRecipient,
    payload: NotificationPayload
  ): Promise<ChannelDeliveryResult> {
    if (!recipient.phone) {
      return {
        channel: this.channel,
        success: false,
        error: "Recipient phone number is missing",
      };
    }

    // ─── Provider placeholder ───────────────────────────────────────────────
    // TODO: Replace with a real provider SDK call, e.g.:
    //   const result = await twilioClient.messages.create({
    //     to: recipient.phone,
    //     from: process.env.TWILIO_FROM_NUMBER!,
    //     body: payload.body,
    //   });
    // ─────────────────────────────────────────────────────────────────────────

    logger.info("[SMSChannel] SMS send is a placeholder — no provider configured", {
      to: recipient.phone,
      idempotencyKey: payload.idempotencyKey,
    });

    return {
      channel: this.channel,
      success: false,
      error: "SMS provider not yet configured (placeholder)",
    };
  }
}
