/**
 * Notification Service — Push Channel (Placeholder)
 *
 * Placeholder implementation of the push notification channel.
 * Replace the send() body with a real push SDK call (e.g. Firebase FCM, Expo Push)
 * when a push provider is configured.
 */

import { IPushChannel, NotificationRecipient, NotificationPayload, ChannelDeliveryResult } from "../interfaces/notification-channel.interface";
import { logger } from "@smarthire/logger";

export class PushChannel implements IPushChannel {
  readonly channel = "push" as const;

  async send(
    recipient: NotificationRecipient,
    payload: NotificationPayload
  ): Promise<ChannelDeliveryResult> {
    if (!recipient.deviceTokens?.length) {
      return {
        channel: this.channel,
        success: false,
        error: "Recipient has no registered device tokens",
      };
    }

    // ─── Provider placeholder ───────────────────────────────────────────────
    // TODO: Replace with a real provider SDK call, e.g.:
    //   const response = await admin.messaging().sendEachForMulticast({
    //     tokens: recipient.deviceTokens,
    //     notification: { title: payload.subject, body: payload.body },
    //     data: payload.metadata as Record<string, string>,
    //   });
    // ─────────────────────────────────────────────────────────────────────────

    logger.info("[PushChannel] Push send is a placeholder — no provider configured", {
      userId: recipient.userId,
      tokenCount: recipient.deviceTokens.length,
      idempotencyKey: payload.idempotencyKey,
    });

    return {
      channel: this.channel,
      success: false,
      error: "Push provider not yet configured (placeholder)",
    };
  }
}
