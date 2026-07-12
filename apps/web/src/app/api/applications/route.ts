import { NextRequest, NextResponse } from "next/server";
import { createAppClient } from "@/utils/supabase/application";
import { applicationService } from "@/services/application-service";
import { logger } from "@smarthire/logger";

/**
 * GET: List job applications (recruiter dashboard/candidate submissions tracking)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract filters from search parameters
    const status = searchParams.get("status") || undefined;
    const jobId = searchParams.get("jobId") || undefined;
    const candidateId = searchParams.get("candidateId") || undefined;

    logger.info("API: Fetching job applications list");

    const applications = await applicationService.listApplications({
      status,
      jobId,
      candidateId,
    });

    return NextResponse.json({ data: applications });
  } catch (err) {
    logger.error("API error in applications list GET route", err);
    return NextResponse.json({ error: "Failed to list applications" }, { status: 500 });
  }
}

/**
 * POST: Apply for a job posting
 */
export async function POST(request: NextRequest) {
  try {
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
    logger.info(`API: User ${user.id} applying for job posting`);

    const appRecord = await applicationService.applyJob(body);
    return NextResponse.json({ data: appRecord }, { status: 201 });
  } catch (err: unknown) {
    logger.error("API error in application submission POST route", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Submission failed", message }, { status: 400 });
  }
}
