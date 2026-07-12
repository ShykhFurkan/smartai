import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/services/analytics";
import { logger } from "@smarthire/logger";

/** GET /api/analytics/hiring-funnel — Stage-by-stage funnel with conversion rates */
export async function GET(request: NextRequest) {
  try {
    const query = Object.fromEntries(new URL(request.url).searchParams);
    logger.info("[API] GET /api/analytics/hiring-funnel");
    const data = await AnalyticsService.getHiringFunnel(query);
    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] hiring funnel error", err);
    return NextResponse.json({ error: "Failed to fetch hiring funnel", message }, { status: 400 });
  }
}
