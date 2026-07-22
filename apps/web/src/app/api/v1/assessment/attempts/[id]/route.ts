import { NextRequest, NextResponse } from "next/server";
import { createAssessmentClient } from "@/utils/supabase/assessment";
import { AssessmentService } from "@/services/assessment";
import { logger } from "@smarthire/logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/assessment/attempts/[id] — Fetch detailed attempt results (recruiter or candidate view)
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createAssessmentClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const role = user.user_metadata?.role || "candidate";
    logger.info(`[API] GET /api/v1/assessment/attempts/${id}`);

    const results = await AssessmentService.getDetailedResults(user.id, role, id);
    return NextResponse.json({ data: results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] getAttemptResults error", err);
    return NextResponse.json({ error: "Failed to fetch attempt details", message }, { status: 400 });
  }
}
