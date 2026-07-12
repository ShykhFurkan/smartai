import { NextRequest, NextResponse } from "next/server";
import { createCandClient } from "@/utils/supabase/candidate";
import { candidateService } from "@/services/candidate-service";
import { logger } from "@smarthire/logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * DELETE: Remove experience record
 */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id: expId } = await params;
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

    logger.info(`API: Deleting experience record: ${expId} for candidate: ${profile.id}`);
    await candidateService.deleteExperience(profile.id, expId);

    return NextResponse.json({ success: true, message: "Experience record removed successfully" });
  } catch (err: unknown) {
    logger.error("API error in experience DELETE route", err);
    return NextResponse.json({ error: "Failed to remove record" }, { status: 500 });
  }
}
