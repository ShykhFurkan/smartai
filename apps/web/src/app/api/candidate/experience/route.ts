import { NextRequest, NextResponse } from "next/server";
import { createCandClient } from "@/utils/supabase/candidate";
import { candidateService } from "@/services/candidate-service";
import { logger } from "@smarthire/logger";

/**
 * POST: Add work experience record
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
    logger.info(`API: Adding experience record for candidate: ${profile.id}`);

    const experience = await candidateService.addExperience(profile.id, body);
    return NextResponse.json({ data: experience }, { status: 201 });
  } catch (err: unknown) {
    logger.error("API error in experience POST route", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Validation or database update failed", message }, { status: 400 });
  }
}
