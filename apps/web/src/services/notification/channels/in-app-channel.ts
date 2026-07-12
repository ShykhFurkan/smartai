/**
 * Notification Service — In-App Channel
 *
 * Fully implemented channel that persists notifications to the
 * `notification.notifications` Supabase table.
 * In-app notifications are readable via GET /api/notifications/in-app.
 */

import { IInAppChannel, NotificationRecipient, NotificationPayload, ChannelDeliveryResult } from "../interfaces/notification-channel.interface";
import { createNotificationClient } from "@/utils/supabase/notification";
import { logger } from "@smarthire/logger";

export class InAppChannel implements IInAppChannel {
  readonly channel = "in_app" as const;

  async send(
    recipient: NotificationRecipient,
    payload: NotificationPayload
  ): Promise<ChannelDeliveryResult> {
    try {
      logger.info("[InAppChannel] Persisting in-app notification", {
        userId: recipient.userId,
        type: payload.type,
        idempotencyKey: payload.idempotencyKey,
      });

      const supabase = await createNotificationClient();

      const { data, error } = await supabase
        .from("notifications")
        .insert({
          user_id: recipient.userId,
          type: payload.type,
          subject: payload.subject,
          body: payload.body,
          metadata: payload.metadata ?? {},
          idempotency_key: payload.idempotencyKey,
          is_read: false,
        })
        .select("id")
        .single();

      if (error) {
        logger.error("[InAppChannel] DB insert failed", error);
        return { channel: this.channel, success: false, error: error.message };
      }

      return {
        channel: this.channel,
        success: true,
        externalId: data.id,
        deliveredAt: new Date().toISOString(),
      };
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : String(err);
      logger.error("[InAppChannel] send failed", { error });
      return { channel: this.channel, success: false, error };
    }
  }
}
