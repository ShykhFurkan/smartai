import { NextRequest, NextResponse } from "next/server";
import { createAppClient } from "@/utils/supabase/application";
import { applicationService } from "@/services/application-service";
import { logger } from "@smarthire/logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH: Move application stage in hiring pipeline (status transition)
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
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

    const body = await request.json();
    logger.info(`API: Recruiter ${user.id} modifying status of application: ${appId}`);

    const updatedApp = await applicationService.updateStatus(appId, user.id, body);
    return NextResponse.json({ data: updatedApp });
  } catch (err: unknown) {
    logger.error("API error in application status update PATCH route", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Pipeline status move failed", message }, { status: 400 });
  }
}
