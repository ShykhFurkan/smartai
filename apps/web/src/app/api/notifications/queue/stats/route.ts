import { NextResponse } from "next/server";
import { NotificationService } from "@/services/notification";
import { logger } from "@smarthire/logger";

/** GET /api/notifications/queue/stats — Queue depth and status metrics */
export async function GET() {
  try {
    logger.info("[API] GET /api/notifications/queue/stats");
    const stats = await NotificationService.getQueueStats();
    return NextResponse.json({ data: stats });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] queue stats error", err);
    return NextResponse.json({ error: "Failed to get queue stats", message }, { status: 500 });
  }
}

/** POST /api/notifications/queue/stats — Manually trigger queue processing */
export async function POST() {
  try {
    logger.info("[API] POST /api/notifications/queue/stats (trigger process)");
    await NotificationService.processQueue();
    return NextResponse.json({ success: true, message: "Queue processing triggered" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] queue process trigger error", err);
    return NextResponse.json({ error: "Failed to process queue", message }, { status: 500 });
  }
}
