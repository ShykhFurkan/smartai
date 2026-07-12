import { NextRequest, NextResponse } from "next/server";
import { createAppClient } from "@/utils/supabase/application";
import { applicationService } from "@/services/application-service";
import { logger } from "@smarthire/logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH: Withdraw job application (Candidate action)
 */
export async function PATCH(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id: appId } = await params;
    const supabase = await createAppClient();

    // Authenticate user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    logger.info(`API: Candidate user ${user.id} requested withdrawal for application ${appId}`);
    const withdrawnApp = await applicationService.withdrawApplication(appId, user.id);

    return NextResponse.json({ data: withdrawnApp });
  } catch (err: unknown) {
    logger.error("API error in application withdraw PATCH route", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Withdraw failed", message }, { status: 400 });
  }
}
