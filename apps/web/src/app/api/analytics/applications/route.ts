import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/services/analytics";
import { logger } from "@smarthire/logger";

/** GET /api/analytics/applications — Application submission metrics */
export async function GET(request: NextRequest) {
  try {
    const query = Object.fromEntries(new URL(request.url).searchParams);
    logger.info("[API] GET /api/analytics/applications");
    const data = await AnalyticsService.getApplicationsMetrics(query);
    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] applications metrics error", err);
    return NextResponse.json({ error: "Failed to fetch application metrics", message }, { status: 400 });
  }
}
