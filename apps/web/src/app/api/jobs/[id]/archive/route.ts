import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { jobService } from "@/services/job-service";
import { logger } from "@smarthire/logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH: Archive job posting (status transitions to 'closed')
 */
export async function PATCH(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id: jobId } = await params;

    // Auth must use default-schema client; custom-schema clients bypass auth
    const authClient = await createClient();
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    logger.info(`API: Archiving job posting ${jobId} requested by recruiter ${user.id}`);
    const archivedJob = await jobService.archiveJob(jobId);

    return NextResponse.json({ data: archivedJob });
  } catch (err: unknown) {
    logger.error("API error in archive PATCH route", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Archive failed", message }, { status: 400 });
  }
}
