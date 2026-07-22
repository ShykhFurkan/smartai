import { NextRequest, NextResponse } from "next/server";
import { createInterviewClient } from "@/utils/supabase/interview";
import { InterviewService } from "@/services/interview";
import { logger } from "@smarthire/logger";

/**
 * POST /api/v1/interview — Schedule a new interview
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createInterviewClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const companyId = user.user_metadata?.companyId || "11111111-1111-1111-1111-111111111111";
    const body = await request.json();
    logger.info(`[API] POST /api/v1/interview for company: ${companyId}`);

    const interview = await InterviewService.scheduleInterview(companyId, body);
    return NextResponse.json({ data: interview }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] scheduleInterview error", err);
    return NextResponse.json({ error: "Failed to schedule interview", message }, { status: 400 });
  }
}

/**
 * GET /api/v1/interview — List all interviews
 */
export async function GET() {
  try {
    const supabase = await createInterviewClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const companyId = user.user_metadata?.companyId || "11111111-1111-1111-1111-111111111111";
    logger.info(`[API] GET /api/v1/interview for company: ${companyId}`);

    const list = await InterviewService.listInterviews(companyId);
    return NextResponse.json({ data: list });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] listInterviews error", err);
    return NextResponse.json({ error: "Failed to list interviews", message }, { status: 400 });
  }
}
