import { NextRequest, NextResponse } from "next/server";
import { createJobClient } from "@/utils/supabase/job";
import { jobService } from "@/services/job-service";
import { logger } from "@smarthire/logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET: Retrieve single job posting details
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id: jobId } = await params;
    logger.info(`API: Fetching details for job: ${jobId}`);

    const job = await jobService.getJobDetails(jobId);

    if (!job) {
      return NextResponse.json({ error: "Job posting not found" }, { status: 404 });
    }

    return NextResponse.json({ data: job });
  } catch (err) {
    logger.error("API error in job details GET route", err);
    return NextResponse.json({ error: "Failed to retrieve job details" }, { status: 500 });
  }
}

/**
 * PATCH: Edit job posting parameters
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id: jobId } = await params;
    const supabase = await createJobClient();

    // Authenticate user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    logger.info(`API: Recruiter ${user.id} updating job posting: ${jobId}`);

    const updatedJob = await jobService.editJob(jobId, body);
    return NextResponse.json({ data: updatedJob });
  } catch (err: unknown) {
    logger.error("API error in job update PATCH route", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Validation or database update failed", message }, { status: 400 });
  }
}

/**
 * DELETE: Soft delete job posting
 */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id: jobId } = await params;
    const supabase = await createJobClient();

    // Authenticate user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    logger.info(`API: Recruiter ${user.id} soft deleting job: ${jobId}`);
    await jobService.deleteJob(jobId);

    return NextResponse.json({ success: true, message: "Job posting soft deleted" });
  } catch (err) {
    logger.error("API error in job deletion DELETE route", err);
    return NextResponse.json({ error: "Failed to delete job posting" }, { status: 500 });
  }
}
