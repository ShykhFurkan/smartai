/**
 * Notification Service — Data Repository
 *
 * Handles all database interactions with the `notification` schema:
 * - In-app notifications CRUD
 * - Notification preferences CRUD
 */

import { createNotificationClient } from "@/utils/supabase/notification";
import { NotificationChannel } from "./interfaces/notification-channel.interface";
import { NotificationPreference, UpdatePreferenceInput } from "./interfaces/notification-preferences.interface";
import { logger } from "@smarthire/logger";

export const notificationRepository = {
  // ─── In-App Notifications ─────────────────────────────────────────────────

  listInAppNotifications: async (
    userId: string,
    opts: { isRead?: boolean; limit: number; offset: number }
  ) => {
    logger.info("Repository: listInAppNotifications", { userId });
    const supabase = await createNotificationClient();

    let query = supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(opts.offset, opts.offset + opts.limit - 1);

    if (opts.isRead !== undefined) {
      query = query.eq("is_read", opts.isRead);
    }

    const { data, error, count } = await query;
    if (error) {
      logger.error("Repository error: listInAppNotifications", error);
      throw error;
    }
    return { data, total: count ?? 0 };
  },

  markAsRead: async (notificationId: string, userId: string) => {
    logger.info(`Repository: markAsRead ${notificationId}`);
    const supabase = await createNotificationClient();

    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      logger.error("Repository error: markAsRead", error);
      throw error;
    }
    return data;
  },

  markAllAsRead: async (userId: string) => {
    logger.info(`Repository: markAllAsRead for user ${userId}`);
    const supabase = await createNotificationClient();

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      logger.error("Repository error: markAllAsRead", error);
      throw error;
    }
  },

  // ─── Notification Preferences ─────────────────────────────────────────────

  getPreferences: async (userId: string): Promise<NotificationPreference[]> => {
    logger.info(`Repository: getPreferences for user ${userId}`);
    const supabase = await createNotificationClient();

    const { data, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      logger.error("Repository error: getPreferences", error);
      throw error;
    }

    return (data ?? []).map((row) => ({
      userId: row.user_id,
      notificationType: row.notification_type,
      channel: row.channel as NotificationChannel,
      enabled: row.enabled,
      updatedAt: row.updated_at,
    }));
  },

  upsertPreference: async (
    userId: string,
    input: UpdatePreferenceInput
  ): Promise<NotificationPreference> => {
    logger.info(`Repository: upsertPreference for user ${userId}`, input);
    const supabase = await createNotificationClient();

    const { data, error } = await supabase
      .from("notification_preferences")
      .upsert(
        {
          user_id: userId,
          notification_type: input.notificationType,
          channel: input.channel,
          enabled: input.enabled,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,notification_type,channel" }
      )
      .select()
      .single();

    if (error) {
      logger.error("Repository error: upsertPreference", error);
      throw error;
    }

    return {
      userId: data.user_id,
      notificationType: data.notification_type,
      channel: data.channel as NotificationChannel,
      enabled: data.enabled,
      updatedAt: data.updated_at,
    };
  },

  isEnabled: async (
    userId: string,
    notificationType: string,
    channel: NotificationChannel
  ): Promise<boolean> => {
    const supabase = await createNotificationClient();

    // Check specific preference first
    const { data } = await supabase
      .from("notification_preferences")
      .select("enabled")
      .eq("user_id", userId)
      .eq("channel", channel)
      .in("notification_type", [notificationType, "*"])
      .order("notification_type", { ascending: true }) // specific before wildcard
      .limit(1)
      .maybeSingle();

    // Default: opted in if no preference record exists
    return data?.enabled ?? true;
  },
};
