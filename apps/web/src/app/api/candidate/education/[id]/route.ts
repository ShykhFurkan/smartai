import { NextRequest, NextResponse } from "next/server";
import { createCandClient } from "@/utils/supabase/candidate";
import { candidateService } from "@/services/candidate-service";
import { logger } from "@smarthire/logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * DELETE: Remove education record
 */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id: eduId } = await params;
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

    logger.info(`API: Deleting education record: ${eduId} for candidate: ${profile.id}`);
    await candidateService.deleteEducation(profile.id, eduId);

    return NextResponse.json({ success: true, message: "Education record removed successfully" });
  } catch (err: unknown) {
    logger.error("API error in education DELETE route", err);
    return NextResponse.json({ error: "Failed to remove record" }, { status: 500 });
  }
}
