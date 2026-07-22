import { NextRequest, NextResponse } from "next/server";
import { createInterviewClient } from "@/utils/supabase/interview";
import { InterviewService } from "@/services/interview";
import { logger } from "@smarthire/logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/interview/[id] — Fetch specific interview details
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createInterviewClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    logger.info(`[API] GET /api/v1/interview/${id}`);
    const details = await InterviewService.getInterviewDetails(id);
    return NextResponse.json({ data: details });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] getInterviewDetails error", err);
    return NextResponse.json({ error: "Failed to fetch interview details", message }, { status: 400 });
  }
}
