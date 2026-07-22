import { NextRequest, NextResponse } from "next/server";
import { createAssessmentClient } from "@/utils/supabase/assessment";
import { AssessmentService } from "@/services/assessment";
import { logger } from "@smarthire/logger";

/**
 * POST /api/v1/assessment/attempts — Start a candidate assessment attempt
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createAssessmentClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Resolve the candidate profile ID (candidate.candidates.id) from auth user ID
    const { data: candidateProfile } = await supabase
      .schema("candidate")
      .from("candidates")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!candidateProfile) {
      return NextResponse.json({ error: "Candidate profile not found" }, { status: 404 });
    }

    const candidateId = candidateProfile.id;
    const body = await request.json();
    logger.info(`[API] POST /api/v1/assessment/attempts for candidate profile: ${candidateId}`);

    const attempt = await AssessmentService.startAttempt(candidateId, body);
    return NextResponse.json({ data: attempt }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] startAttempt error", err);
    return NextResponse.json({ error: "Failed to start attempt", message }, { status: 400 });
  }
}
