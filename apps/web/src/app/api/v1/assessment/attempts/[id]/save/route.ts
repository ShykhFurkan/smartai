import { NextRequest, NextResponse } from "next/server";
import { createAssessmentClient } from "@/utils/supabase/assessment";
import { AssessmentService } from "@/services/assessment";
import { logger } from "@smarthire/logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/v1/assessment/attempts/[id]/save — Save candidate answers progress
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
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
    logger.info(`[API] PATCH /api/v1/assessment/attempts/${id}/save`);

    const attempt = await AssessmentService.saveProgress(candidateProfile.id, id, body);
    return NextResponse.json({ data: attempt });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] saveProgress error", err);
    return NextResponse.json({ error: "Failed to save progress", message }, { status: 400 });
  }
}
