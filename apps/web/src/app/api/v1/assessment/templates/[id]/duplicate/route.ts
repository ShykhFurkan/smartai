import { NextRequest, NextResponse } from "next/server";
import { createAssessmentClient } from "@/utils/supabase/assessment";
import { AssessmentService } from "@/services/assessment";
import { logger } from "@smarthire/logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/assessment/templates/[id]/duplicate — Duplicate template
 */
export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createAssessmentClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const companyId = user.user_metadata?.companyId || "11111111-1111-1111-1111-111111111111";
    logger.info(`[API] POST /api/v1/assessment/templates/${id}/duplicate`);

    const copy = await AssessmentService.duplicateTemplate(id, companyId, user.id);
    return NextResponse.json({ data: copy }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] duplicateTemplate error", err);
    return NextResponse.json({ error: "Failed to duplicate template", message }, { status: 400 });
  }
}
