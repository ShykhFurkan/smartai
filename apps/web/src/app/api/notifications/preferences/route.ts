import { NextRequest, NextResponse } from "next/server";
import { createNotificationClient } from "@/utils/supabase/notification";
import { NotificationService } from "@/services/notification";
import { logger } from "@smarthire/logger";

/**
 * GET /api/notifications/preferences — Get authenticated user's notification preferences
 */
export async function GET() {
  try {
    const supabase = await createNotificationClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logger.info(`[API] GET /api/notifications/preferences for user ${user.id}`);
    const preferences = await NotificationService.getPreferences(user.id);

    return NextResponse.json({ data: preferences });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] get preferences error", err);
    return NextResponse.json({ error: "Failed to fetch preferences", message }, { status: 500 });
  }
}

/**
 * PUT /api/notifications/preferences — Update a single notification preference
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createNotificationClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    logger.info(`[API] PUT /api/notifications/preferences for user ${user.id}`);

    const updated = await NotificationService.updatePreference(user.id, body);
    return NextResponse.json({ data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] update preference error", err);
    return NextResponse.json({ error: "Failed to update preference", message }, { status: 400 });
  }
}
