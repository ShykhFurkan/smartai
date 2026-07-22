import { NextRequest, NextResponse } from "next/server";
import { createInterviewClient } from "@/utils/supabase/interview";
import { InterviewService } from "@/services/interview";
import { logger } from "@smarthire/logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/interview/[id]/cancel — Cancel scheduled interview
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
    const reason = body.reason || "No reason provided";
    logger.info(`[API] POST /api/v1/interview/${id}/cancel`);

    const cancelled = await InterviewService.cancelInterview(id, reason);
    return NextResponse.json({ data: cancelled });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] cancelInterview error", err);
    return NextResponse.json({ error: "Failed to cancel interview", message }, { status: 400 });
  }
}
