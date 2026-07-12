import { NextRequest, NextResponse } from "next/server";
import { createCandClient } from "@/utils/supabase/candidate";
import { candidateService } from "@/services/candidate-service";
import { resumeService } from "@/services/resume-service";
import { logger } from "@smarthire/logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * DELETE: Soft delete resume metadata version record
 */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id: resumeId } = await params;
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

    logger.info(`API: Deleting resume: ${resumeId} for candidate: ${profile.id}`);
    await resumeService.deleteResume(profile.id, resumeId);

    return NextResponse.json({ success: true, message: "Resume version removed successfully" });
  } catch (err: unknown) {
    logger.error("API error in resume DELETE route", err);
    return NextResponse.json({ error: "Failed to delete resume record" }, { status: 500 });
  }
}
