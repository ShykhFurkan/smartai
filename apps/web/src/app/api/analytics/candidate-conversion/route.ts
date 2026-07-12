import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/services/analytics";
import { logger } from "@smarthire/logger";

/** GET /api/analytics/candidate-conversion — Pipeline conversion rates and drop-off analysis */
export async function GET(request: NextRequest) {
  try {
    const query = Object.fromEntries(new URL(request.url).searchParams);
    logger.info("[API] GET /api/analytics/candidate-conversion");
    const data = await AnalyticsService.getCandidateConversion(query);
    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] candidate conversion error", err);
    return NextResponse.json({ error: "Failed to fetch candidate conversion metrics", message }, { status: 400 });
  }
}
