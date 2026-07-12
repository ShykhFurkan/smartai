import { NextResponse } from "next/server";
import { AIService } from "@/services/ai";
import { logger } from "@smarthire/logger";

/** GET /api/ai/health — Returns the health status of the active AI provider */
export async function GET() {
  try {
    logger.info("[API] GET /api/ai/health");
    const status = await AIService.healthCheck();
    return NextResponse.json({ data: status });
  } catch (err: unknown) {
    logger.error("[API] AI health check error", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Health check failed", message }, { status: 500 });
  }
}
