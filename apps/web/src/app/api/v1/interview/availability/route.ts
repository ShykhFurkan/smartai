import { NextRequest, NextResponse } from "next/server";
import { createInterviewClient } from "@/utils/supabase/interview";
import { InterviewService } from "@/services/interview";
import { logger } from "@smarthire/logger";

/**
 * POST /api/v1/interview/availability — Create recruiter availability slot
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createInterviewClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const companyId = user.user_metadata?.companyId || "11111111-1111-1111-1111-111111111111";
    // Usually recruiter_id is fetched via identity user profile. We fallback to a mock recruiter_id
    const recruiterId = user.user_metadata?.recruiterId || "22222222-2222-2222-2222-222222222222";
    const body = await request.json();
    logger.info(`[API] POST /api/v1/interview/availability for recruiter: ${recruiterId}`);

    const slot = await InterviewService.createAvailabilitySlot(companyId, recruiterId, body);
    return NextResponse.json({ data: slot }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] createAvailabilitySlot error", err);
    return NextResponse.json({ error: "Failed to create availability slot", message }, { status: 400 });
  }
}

/**
 * GET /api/v1/interview/availability — List availability slots
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createInterviewClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const companyId = user.user_metadata?.companyId || "11111111-1111-1111-1111-111111111111";
    const { searchParams } = new URL(request.url);
    const recruiterId = searchParams.get("recruiterId") || undefined;
    const isBooked = searchParams.get("isBooked") ? searchParams.get("isBooked") === "true" : undefined;

    logger.info(`[API] GET /api/v1/interview/availability for company: ${companyId}`);
    const list = await InterviewService.listAvailabilitySlots(companyId, recruiterId, isBooked);
    return NextResponse.json({ data: list });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[API] listAvailabilitySlots error", err);
    return NextResponse.json({ error: "Failed to list availability slots", message }, { status: 400 });
  }
}
