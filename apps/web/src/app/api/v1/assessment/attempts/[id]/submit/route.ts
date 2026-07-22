import { NextRequest, NextResponse } from "next/server";
import { createAssessmentClient } from "@/utils/supabase/assessment";
import { AssessmentService } from "@/services/assessment";
import { logger } from "@smarthire/logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/assessment/attempts/[id]/submit — Submit and grade the candidate attempt
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
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

    const body = await request.json();
    logger.info(`[API] POST /api/v1/assessment/attempts/${id}/submit`);

    const attempt = await AssessmentService.submitAttempt(candidateProfile.id, id, body);

    // Automatically update the application score in the pipeline
    if (attempt && attempt.applicationId) {
      const scoreOutOf10 = Math.round(((attempt.score || 0) / 10) * 10) / 10;
      await supabase
        .from("applications")
        .update({ score: scoreOutOf10 })
        .eq("id", attempt.applicationId);
    }

    return NextResponse.json({ data: attempt });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] submitAttempt error", err);
    return NextResponse.json({ error: "Failed to submit assessment", message }, { status: 400 });
  }
}
