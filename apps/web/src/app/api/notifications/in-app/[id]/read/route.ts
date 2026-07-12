import { NextRequest, NextResponse } from "next/server";
import { createNotificationClient } from "@/utils/supabase/notification";
import { NotificationService } from "@/services/notification";
import { logger } from "@smarthire/logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** PATCH /api/notifications/in-app/[id]/read — Mark a single notification as read */
export async function PATCH(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const supabase = await createNotificationClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logger.info(`[API] PATCH /api/notifications/in-app/${id}/read for user ${user.id}`);
    const updated = await NotificationService.markAsRead(id, user.id);

    return NextResponse.json({ data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] mark as read error", err);
    return NextResponse.json({ error: "Failed to mark notification as read", message }, { status: 500 });
  }
}
