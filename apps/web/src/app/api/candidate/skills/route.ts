import { NextRequest, NextResponse } from "next/server";
import { createCandClient } from "@/utils/supabase/candidate";
import { candidateService } from "@/services/candidate-service";
import { logger } from "@smarthire/logger";

/**
 * POST: Map skill to candidate profile
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createCandClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Retrieve candidate profile
    const profile = await candidateService.getProfile(user.id);
    if (!profile) {
      return NextResponse.json({ error: "Candidate profile not initialized" }, { status: 400 });
    }

    const body = await request.json();
    logger.info(`API: Mapping skill for candidate: ${profile.id}`);

    const skillMapping = await candidateService.addSkill(profile.id, body);
    return NextResponse.json({ data: skillMapping }, { status: 201 });
  } catch (err: unknown) {
    logger.error("API error in skills POST route", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Validation or database update failed", message }, { status: 400 });
  }
}

/**
 * DELETE: Dissociate skill from candidate profile
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skillId = searchParams.get("skillId");

    if (!skillId) {
      return NextResponse.json({ error: "skillId query parameter is required" }, { status: 400 });
    }

    const supabase = await createCandClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Retrieve candidate profile
    const profile = await candidateService.getProfile(user.id);
    if (!profile) {
      return NextResponse.json({ error: "Candidate profile not initialized" }, { status: 400 });
    }

    logger.info(`API: Removing skill mapping: ${skillId} for candidate: ${profile.id}`);
    await candidateService.removeSkill(profile.id, skillId);

    return NextResponse.json({ success: true, message: "Skill association removed successfully" });
  } catch (err: unknown) {
    logger.error("API error in skills DELETE route", err);
    return NextResponse.json({ error: "Failed to remove skill mapping" }, { status: 500 });
  }
}
