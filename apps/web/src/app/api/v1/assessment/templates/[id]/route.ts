import { NextRequest, NextResponse } from "next/server";
import { createAssessmentClient } from "@/utils/supabase/assessment";
import { AssessmentService } from "@/services/assessment";
import { logger } from "@smarthire/logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/assessment/templates/[id] — Fetch assessment template detail
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createAssessmentClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    logger.info(`[API] GET /api/v1/assessment/templates/${id}`);
    const template = await AssessmentService.getTemplate(id);
    return NextResponse.json({ data: template });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] getTemplate error", err);
    return NextResponse.json({ error: "Failed to fetch template details", message }, { status: 400 });
  }
}

/**
 * PUT /api/v1/assessment/templates/[id] — Update draft assessment template
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createAssessmentClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    logger.info(`[API] PUT /api/v1/assessment/templates/${id}`);

    const template = await AssessmentService.updateTemplate(id, body);
    return NextResponse.json({ data: template });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] updateTemplate error", err);
    return NextResponse.json({ error: "Failed to update template", message }, { status: 400 });
  }
}

/**
 * DELETE /api/v1/assessment/templates/[id] — Archive template
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createAssessmentClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    logger.info(`[API] DELETE /api/v1/assessment/templates/${id}`);
    await AssessmentService.archiveTemplate(id);
    return NextResponse.json({ message: "Assessment template archived successfully" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] archiveTemplate error", err);
    return NextResponse.json({ error: "Failed to archive template", message }, { status: 400 });
  }
}
