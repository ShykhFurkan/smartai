import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { jobService } from "@/services/job-service";
import { logger } from "@smarthire/logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH: Publish job posting (status transitions to 'published')
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

    logger.info(`API: Publishing job posting ${jobId} requested by recruiter ${user.id}`);
    const publishedJob = await jobService.publishJob(jobId);

    return NextResponse.json({ data: publishedJob });
  } catch (err: unknown) {
    logger.error("API error in publish PATCH route", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Publish failed", message }, { status: 400 });
  }
}
