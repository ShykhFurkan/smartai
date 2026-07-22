import { NextRequest, NextResponse } from "next/server";
import { createInterviewClient } from "@/utils/supabase/interview";
import { InterviewService } from "@/services/interview";
import { logger } from "@smarthire/logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/interview/[id]/reschedule — Reschedule interview
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createInterviewClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    logger.info(`[API] POST /api/v1/interview/${id}/reschedule`);

    const rescheduled = await InterviewService.rescheduleInterview(id, body);
    return NextResponse.json({ data: rescheduled });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] rescheduleInterview error", err);
    return NextResponse.json({ error: "Failed to reschedule interview", message }, { status: 400 });
  }
}
