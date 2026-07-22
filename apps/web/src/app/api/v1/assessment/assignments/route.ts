import { NextRequest, NextResponse } from "next/server";
import { createAssessmentClient } from "@/utils/supabase/assessment";
import { AssessmentService } from "@/services/assessment";
import { logger } from "@smarthire/logger";

/**
 * POST /api/v1/assessment/assignments — Assign an assessment to candidate
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createAssessmentClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const companyId = user.user_metadata?.companyId || "11111111-1111-1111-1111-111111111111";
    const body = await request.json();
    logger.info(`[API] POST /api/v1/assessment/assignments for company: ${companyId}`);

    const assignment = await AssessmentService.assignAssessment(companyId, body);
    return NextResponse.json({ data: assignment }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] assignAssessment error", err);
    return NextResponse.json({ error: "Failed to assign assessment", message }, { status: 400 });
  }
}
