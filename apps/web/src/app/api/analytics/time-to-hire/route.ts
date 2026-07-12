import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/services/analytics";
import { logger } from "@smarthire/logger";

/** GET /api/analytics/time-to-hire — Average, median, p90 time-to-hire metrics */
export async function GET(request: NextRequest) {
  try {
    const query = Object.fromEntries(new URL(request.url).searchParams);
    logger.info("[API] GET /api/analytics/time-to-hire");
    const data = await AnalyticsService.getTimeToHire(query);
    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] time-to-hire error", err);
    return NextResponse.json({ error: "Failed to fetch time-to-hire metrics", message }, { status: 400 });
  }
}
