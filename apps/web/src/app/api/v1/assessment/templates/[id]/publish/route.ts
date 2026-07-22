import { NextRequest, NextResponse } from "next/server";
import { createAssessmentClient } from "@/utils/supabase/assessment";
import { AssessmentService } from "@/services/assessment";
import { logger } from "@smarthire/logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/assessment/templates/[id]/publish — Publish template
 */
export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createAssessmentClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    logger.info(`[API] POST /api/v1/assessment/templates/${id}/publish`);
    const published = await AssessmentService.publishTemplate(id);
    return NextResponse.json({ data: published });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] publishTemplate error", err);
    return NextResponse.json({ error: "Failed to publish template", message }, { status: 400 });
  }
}
