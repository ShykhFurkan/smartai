import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/services/analytics";
import { logger } from "@smarthire/logger";

/** GET /api/analytics/company-dashboard — High-level company dashboard metrics */
export async function GET(request: NextRequest) {
  try {
    const query = Object.fromEntries(new URL(request.url).searchParams);
    logger.info("[API] GET /api/analytics/company-dashboard");
    const data = await AnalyticsService.getCompanyDashboard(query);
    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] company dashboard metrics error", err);
    return NextResponse.json({ error: "Failed to fetch company dashboard metrics", message }, { status: 400 });
  }
}
