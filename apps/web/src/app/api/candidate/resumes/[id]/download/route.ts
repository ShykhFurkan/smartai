import { NextRequest, NextResponse } from "next/server";
import { createCandClient } from "@/utils/supabase/candidate";
import { candidateService } from "@/services/candidate-service";
import { resumeService } from "@/services/resume-service";
import { logger } from "@smarthire/logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET: Generate signed URL link to view/download resume file
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
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

    logger.info(`API: Generating download URL for resume: ${resumeId} for candidate: ${profile.id}`);
    const signedData = await resumeService.generateSignedDownloadUrl(profile.id, resumeId);

    return NextResponse.redirect(signedData.signedUrl);
  } catch (err: unknown) {
    logger.error("API error in resume download signed link GET route", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Failed to generate access URL", message }, { status: 400 });
  }
}
