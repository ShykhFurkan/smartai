import { NextRequest, NextResponse } from "next/server";
import { createCandClient } from "@/utils/supabase/candidate";
import { candidateService } from "@/services/candidate-service";
import { logger } from "@smarthire/logger";

/**
 * POST: Add a project record to candidate profile
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
    logger.info(`API: Adding project record for candidate: ${profile.id}`);

    const project = await candidateService.addProject(profile.id, body);
    return NextResponse.json({ data: project }, { status: 201 });
  } catch (err: unknown) {
    logger.error("API error in project POST route", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Validation or database update failed", message }, { status: 400 });
  }
}
