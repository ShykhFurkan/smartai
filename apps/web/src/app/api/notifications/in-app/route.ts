import { NextRequest, NextResponse } from "next/server";
import { createNotificationClient } from "@/utils/supabase/notification";
import { NotificationService } from "@/services/notification";
import { logger } from "@smarthire/logger";

/**
 * GET /api/notifications/in-app — List in-app notifications for the authenticated user
 * Query params: isRead (true|false), limit (default 20), offset (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createNotificationClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    logger.info(`[API] GET /api/notifications/in-app for user ${user.id}`);
    const result = await NotificationService.listInAppNotifications(user.id, query);

    return NextResponse.json({ data: result.data, total: result.total });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] list in-app notifications error", err);
    return NextResponse.json({ error: "Failed to fetch notifications", message }, { status: 500 });
  }
}

/** PATCH /api/notifications/in-app — Mark all in-app notifications as read */
export async function PATCH() {
  try {
    const supabase = await createNotificationClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logger.info(`[API] PATCH /api/notifications/in-app (mark all read) for user ${user.id}`);
    await NotificationService.markAllAsRead(user.id);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] mark all read error", err);
    return NextResponse.json({ error: "Failed to mark all as read", message }, { status: 500 });
  }
}
