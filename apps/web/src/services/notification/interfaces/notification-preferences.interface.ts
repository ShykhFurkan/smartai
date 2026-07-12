/**
 * Notification Service — Preferences Interface
 *
 * Defines the contract for per-user notification preference management.
 * Users can opt in/out of each channel for each notification type.
 */

import { NotificationChannel } from "./notification-channel.interface";

export interface NotificationPreference {
  userId: string;
  /** Notification type / event name (e.g. "application.submitted", "*" = all) */
  notificationType: string;
  channel: NotificationChannel;
  /** Whether the user has opted into this channel+type combination */
  enabled: boolean;
  updatedAt: string;
}

export interface UpdatePreferenceInput {
  notificationType: string;
  channel: NotificationChannel;
  enabled: boolean;
}

export interface INotificationPreferences {
  /**
   * Get all preferences for a user.
   */
  getPreferences(userId: string): Promise<NotificationPreference[]>;

  /**
   * Update a single channel+type preference for a user.
   */
  updatePreference(userId: string, input: UpdatePreferenceInput): Promise<NotificationPreference>;

  /**
   * Check whether a user has opted into a specific channel for a notification type.
   * Falls back to checking the wildcard "*" type if no specific preference is found.
   * Defaults to true (opted in) if no preference record exists.
   */
  isEnabled(userId: string, notificationType: string, channel: NotificationChannel): Promise<boolean>;
}
