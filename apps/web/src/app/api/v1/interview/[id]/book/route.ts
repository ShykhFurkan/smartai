import { NextRequest, NextResponse } from "next/server";
import { createInterviewClient } from "@/utils/supabase/interview";
import { InterviewService } from "@/services/interview";
import { logger } from "@smarthire/logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/interview/[id]/book — Book availability slot for candidate
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createInterviewClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const companyId = user.user_metadata?.companyId || "11111111-1111-1111-1111-111111111111";
    const body = await request.json();
    logger.info(`[API] POST /api/v1/interview/${id}/book`);

    const mergedInput = {
      slotId: body.slotId || id,
      applicationId: body.applicationId || id,
      ...body,
    };

    const booking = await InterviewService.bookInterviewSlot(companyId, user.id, mergedInput);
    return NextResponse.json({ data: booking }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] bookInterviewSlot error", err);
    return NextResponse.json({ error: "Failed to book slot", message }, { status: 400 });
  }
}
