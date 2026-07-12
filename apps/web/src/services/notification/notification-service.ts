/**
 * Notification Service — Public Facade
 *
 * Single entry point for all notification operations.
 * Orchestrates: template resolution → preference checking →
 * queue enqueue → channel delivery.
 */

import { sendNotificationSchema, updatePreferenceSchema, listInAppNotificationsSchema } from "./notification-schemas";
import { notificationRepository } from "./notification-repository";
import { templateEngine } from "./templates/template-engine";
import { notificationQueue } from "./queue/notification-queue";
import { EmailChannel } from "./channels/email-channel";
import { SMSChannel } from "./channels/sms-channel";
import { PushChannel } from "./channels/push-channel";
import { InAppChannel } from "./channels/in-app-channel";
import { NotificationChannel } from "./interfaces/notification-channel.interface";
import { logger } from "@smarthire/logger";

// ─── Register all channels with the queue ────────────────────────────────────
notificationQueue.registerChannel(new EmailChannel());
notificationQueue.registerChannel(new SMSChannel());
notificationQueue.registerChannel(new PushChannel());
notificationQueue.registerChannel(new InAppChannel());

// ─── Facade ──────────────────────────────────────────────────────────────────

export const NotificationService = {
  /**
   * Dispatch a notification to a user via one or more channels.
   * Resolves the template, checks per-channel preferences, then enqueues jobs.
   */
  send: async (payload: unknown) => {
    const result = sendNotificationSchema.safeParse(payload);
    if (!result.success) {
      throw new Error(JSON.stringify(result.error.flatten()));
    }

    const {
      userId,
      templateId,
      channels,
      variables = {},
      recipientEmail,
      recipientPhone,
      metadata,
    } = result.data;

    // 1. Resolve template
    const resolved = await templateEngine.resolve(templateId, variables);
    logger.info(`[NotificationService] Template resolved: ${templateId}`);

    // 2. Determine channels to dispatch
    const template = templateEngine.list().find((t) => t.id === templateId);
    const targetChannels: NotificationChannel[] =
      channels ?? (template?.supportedChannels as NotificationChannel[]) ?? ["in_app"];

    // 3. Build idempotency key
    const idempotencyKey = `${userId}:${templateId}:${crypto.randomUUID()}`;

    const notificationPayload = {
      idempotencyKey,
      type: templateId,
      subject: resolved.subject,
      body: resolved.body,
      htmlBody: resolved.htmlBody,
      metadata,
    };

    const recipient = {
      userId,
      email: recipientEmail,
      phone: recipientPhone,
    };

    const jobIds: { channel: string; jobId: string }[] = [];

    // 4. For each target channel — check preference, then enqueue
    for (const channel of targetChannels) {
      const isEnabled = await notificationRepository.isEnabled(userId, templateId, channel);
      if (!isEnabled) {
        logger.info(`[NotificationService] User ${userId} has opted out of ${channel} for ${templateId}`);
        continue;
      }

      const jobId = await notificationQueue.enqueue(channel, recipient, notificationPayload, {
        maxAttempts: 3,
      });
      jobIds.push({ channel, jobId });
    }

    // 5. Trigger queue processing (fire-and-forget in dev; use scheduler in prod)
    notificationQueue.process().catch((err) => {
      logger.error("[NotificationService] Queue processing error", err);
    });

    logger.info(`[NotificationService] ${jobIds.length} job(s) enqueued for user ${userId}`, { jobIds });
    return { idempotencyKey, jobIds };
  },

  // ─── In-App Notifications ─────────────────────────────────────────────────

  listInAppNotifications: async (userId: string, query: unknown) => {
    const params = listInAppNotificationsSchema.parse(query);
    return notificationRepository.listInAppNotifications(userId, {
      isRead: params.isRead === undefined ? undefined : params.isRead === "true",
      limit: params.limit,
      offset: params.offset,
    });
  },

  markAsRead: async (notificationId: string, userId: string) => {
    return notificationRepository.markAsRead(notificationId, userId);
  },

  markAllAsRead: async (userId: string) => {
    return notificationRepository.markAllAsRead(userId);
  },

  // ─── Preferences ─────────────────────────────────────────────────────────

  getPreferences: async (userId: string) => {
    return notificationRepository.getPreferences(userId);
  },

  updatePreference: async (userId: string, payload: unknown) => {
    const result = updatePreferenceSchema.safeParse(payload);
    if (!result.success) {
      throw new Error(JSON.stringify(result.error.flatten()));
    }
    return notificationRepository.upsertPreference(userId, result.data);
  },

  // ─── Templates ───────────────────────────────────────────────────────────

  listTemplates: () => {
    return templateEngine.list();
  },

  // ─── Queue Management ────────────────────────────────────────────────────

  getQueueStats: async () => {
    return notificationQueue.getStats();
  },

  listQueueJobs: async () => {
    return notificationQueue.listJobs();
  },

  processQueue: async () => {
    return notificationQueue.process();
  },
};
