import { NextRequest, NextResponse } from "next/server";
import { createAssessmentClient } from "@/utils/supabase/assessment";
import { AssessmentService } from "@/services/assessment";
import { logger } from "@smarthire/logger";

/**
 * POST /api/v1/assessment/templates — Create a new assessment template
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createAssessmentClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const companyId = user.user_metadata?.companyId || "11111111-1111-1111-1111-111111111111"; // Fallback to seed company
    const body = await request.json();
    logger.info(`[API] POST /api/v1/assessment/templates for company: ${companyId}`);

    const template = await AssessmentService.createTemplate(companyId, user.id, body);
    return NextResponse.json({ data: template }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] createTemplate error", err);
    return NextResponse.json({ error: "Failed to create template", message }, { status: 400 });
  }
}

/**
 * GET /api/v1/assessment/templates — List all assessment templates for the company
 */
export async function GET() {
  try {
    const supabase = await createAssessmentClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const companyId = user.user_metadata?.companyId || "11111111-1111-1111-1111-111111111111";
    logger.info(`[API] GET /api/v1/assessment/templates for company: ${companyId}`);

    const templates = await AssessmentService.listTemplates(companyId);
    return NextResponse.json({ data: templates });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] listTemplates error", err);
    return NextResponse.json({ error: "Failed to list templates", message }, { status: 400 });
  }
}
