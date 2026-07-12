import { NextResponse } from "next/server";
import { NotificationService } from "@/services/notification";
import { logger } from "@smarthire/logger";

/** GET /api/notifications/templates — List all registered notification templates */
export async function GET() {
  try {
    logger.info("[API] GET /api/notifications/templates");
    const templates = NotificationService.listTemplates();
    return NextResponse.json({ data: templates });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] list templates error", err);
    return NextResponse.json({ error: "Failed to list templates", message }, { status: 500 });
  }
}
