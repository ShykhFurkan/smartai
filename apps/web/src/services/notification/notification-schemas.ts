import { z } from "zod";

const NOTIFICATION_CHANNELS = ["email", "sms", "push", "in_app"] as const;

/**
 * Schema for dispatching a notification
 */
export const sendNotificationSchema = z.object({
  /** Target user ID */
  userId: z.string().uuid("Invalid userId"),
  /** Template ID (e.g. "application.submitted") */
  templateId: z.string().min(1, "templateId is required"),
  /** Channels to send on — defaults to all template-supported channels */
  channels: z.array(z.enum(NOTIFICATION_CHANNELS)).optional(),
  /** Template interpolation variables */
  variables: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  /** Recipient contact overrides */
  recipientEmail: z.string().email().optional(),
  recipientPhone: z.string().optional(),
  /** Metadata attached to the notification */
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Schema for updating a notification preference
 */
export const updatePreferenceSchema = z.object({
  notificationType: z.string().min(1),
  channel: z.enum(NOTIFICATION_CHANNELS),
  enabled: z.boolean(),
});

/**
 * Schema for listing in-app notifications query params
 */
export const listInAppNotificationsSchema = z.object({
  isRead: z.enum(["true", "false"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
