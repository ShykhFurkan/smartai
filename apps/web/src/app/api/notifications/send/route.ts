import { NextRequest, NextResponse } from "next/server";
import { createNotificationClient } from "@/utils/supabase/notification";
import { NotificationService } from "@/services/notification";
import { logger } from "@smarthire/logger";

/** POST /api/notifications/send — Dispatch a notification to a user */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createNotificationClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    logger.info(`[API] POST /api/notifications/send by user ${user.id}`);

    const result = await NotificationService.send(body);
    return NextResponse.json({ data: result }, { status: 202 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] send notification error", err);
    return NextResponse.json({ error: "Failed to send notification", message }, { status: 400 });
  }
}
