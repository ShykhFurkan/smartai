/**
 * Notification Service — Channel Interfaces
 *
 * Defines contracts for every supported notification delivery channel.
 * Concrete channel implementations must satisfy these interfaces.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Shared types
// ─────────────────────────────────────────────────────────────────────────────

export type NotificationChannel = "email" | "sms" | "push" | "in_app";

export interface NotificationRecipient {
  userId: string;
  email?: string;
  phone?: string;
  deviceTokens?: string[];
  name?: string;
}

export interface NotificationPayload {
  /** Unique idempotency key — prevents duplicate deliveries on retry */
  idempotencyKey: string;
  /** Notification type / event name (e.g. "application.submitted") */
  type: string;
  /** Resolved subject line (for email) or title (for push/in-app) */
  subject: string;
  /** Resolved plain-text body */
  body: string;
  /** Resolved HTML body (email only) */
  htmlBody?: string;
  /** Arbitrary metadata attached to the event */
  metadata?: Record<string, unknown>;
}

export interface ChannelDeliveryResult {
  channel: NotificationChannel;
  success: boolean;
  /** Vendor-assigned message / delivery ID */
  externalId?: string;
  error?: string;
  deliveredAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-channel interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface INotificationChannel {
  readonly channel: NotificationChannel;
  /**
   * Deliver a notification to one recipient via this channel.
   */
  send(
    recipient: NotificationRecipient,
    payload: NotificationPayload
  ): Promise<ChannelDeliveryResult>;
}

export interface IEmailChannel extends INotificationChannel {
  readonly channel: "email";
}

export interface ISMSChannel extends INotificationChannel {
  readonly channel: "sms";
}

export interface IPushChannel extends INotificationChannel {
  readonly channel: "push";
}

export interface IInAppChannel extends INotificationChannel {
  readonly channel: "in_app";
}
