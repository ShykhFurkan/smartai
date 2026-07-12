import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/services/analytics";
import { logger } from "@smarthire/logger";

/**
 * GET /api/analytics/charts — Chart-ready datasets for various metrics
 * Query params: from, to, companyId?, metric, granularity?
 */
export async function GET(request: NextRequest) {
  try {
    const query = Object.fromEntries(new URL(request.url).searchParams);
    logger.info("[API] GET /api/analytics/charts");
    const data = await AnalyticsService.getChartData(query);
    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] charts metrics error", err);
    return NextResponse.json({ error: "Failed to fetch chart metrics", message }, { status: 400 });
  }
}
