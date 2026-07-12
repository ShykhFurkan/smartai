import { NextRequest, NextResponse } from "next/server";
import { applicationService } from "@/services/application-service";
import { logger } from "@smarthire/logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET: Retrieve single application details with status history timeline
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id: appId } = await params;
    logger.info(`API: Fetching details for application: ${appId}`);

    const app = await applicationService.getApplicationDetails(appId);

    if (!app) {
      return NextResponse.json({ error: "Application record not found" }, { status: 404 });
    }

    return NextResponse.json({ data: app });
  } catch (err) {
    logger.error("API error in application details GET route", err);
    return NextResponse.json({ error: "Failed to retrieve application details" }, { status: 500 });
  }
}
