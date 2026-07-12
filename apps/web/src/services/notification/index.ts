/**
 * Notification Service — Public Module Index
 */

export { NotificationService } from "./notification-service";
export { templateEngine } from "./templates/template-engine";
export { notificationQueue } from "./queue/notification-queue";

// Interfaces
export type { NotificationChannel, NotificationRecipient, NotificationPayload, ChannelDeliveryResult, INotificationChannel } from "./interfaces/notification-channel.interface";
export type { NotificationTemplate, TemplateVariables, ResolvedTemplate, ITemplateEngine } from "./interfaces/notification-template.interface";
export type { QueueJob, QueueJobStatus, EnqueueOptions, INotificationQueue } from "./interfaces/notification-queue.interface";
export type { NotificationPreference, UpdatePreferenceInput, INotificationPreferences } from "./interfaces/notification-preferences.interface";
