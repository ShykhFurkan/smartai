import { NextRequest, NextResponse } from "next/server";
import { createJobClient } from "@/utils/supabase/job";
import { jobService } from "@/services/job-service";
import { logger } from "@smarthire/logger";

/**
 * GET: List job postings (public/recruiter listings)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const statusParam = searchParams.get("status");
    const status =
      statusParam === "draft" || statusParam === "published" || statusParam === "closed"
        ? statusParam
        : undefined;

    const category = searchParams.get("category") || undefined;
    const location = searchParams.get("location") || undefined;

    const typeParam = searchParams.get("type");
    const type =
      typeParam === "full-time" ||
      typeParam === "part-time" ||
      typeParam === "contract" ||
      typeParam === "internship"
        ? typeParam
        : undefined;

    logger.info("API: Fetching job postings list");

    const jobs = await jobService.listJobs({
      status,
      category,
      location,
      type,
    });

    return NextResponse.json({ data: jobs });
  } catch (err) {
    logger.error("API error in jobs list GET route", err);
    return NextResponse.json({ error: "Failed to list job postings" }, { status: 500 });
  }
}

/**
 * POST: Create a new job posting
 */
export async function POST(request: NextRequest) {
  try {
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
    logger.info(`API: Recruiter ${user.id} is creating a job posting`);

    // Override or inject active recruiter/user if necessary, but keep it clean
    const jobRecord = await jobService.createJob(body);
    return NextResponse.json({ data: jobRecord }, { status: 201 });
  } catch (err: unknown) {
    logger.error("API error in jobs creation POST route", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Validation or database insert failed", message }, { status: 400 });
  }
}
