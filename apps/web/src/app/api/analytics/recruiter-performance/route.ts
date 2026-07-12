import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/services/analytics";
import { logger } from "@smarthire/logger";

/**
 * GET /api/analytics/recruiter-performance
 * Query params: from, to, companyId?, recruiterId?, limit?
 */
export async function GET(request: NextRequest) {
  try {
    const query = Object.fromEntries(new URL(request.url).searchParams);
    logger.info("[API] GET /api/analytics/recruiter-performance");
    const data = await AnalyticsService.getRecruiterPerformance(query);
    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] recruiter performance error", err);
    return NextResponse.json({ error: "Failed to fetch recruiter performance", message }, { status: 400 });
  }
}
