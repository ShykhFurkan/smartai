import { NextRequest, NextResponse } from "next/server";
import { createCandClient } from "@/utils/supabase/candidate";
import { candidateService } from "@/services/candidate-service";
import { logger } from "@smarthire/logger";

/**
 * GET: Retrieve candidate profile for authenticated user
 */
export async function GET() {
  try {
    const supabase = await createCandClient();

    // Authenticate user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    logger.info(`API: Fetching profile for candidate user: ${user.id}`);
    const profile = await candidateService.getProfile(user.id);

    if (!profile) {
      return NextResponse.json({ error: "Profile not initialized" }, { status: 404 });
    }

    return NextResponse.json({ data: profile });
  } catch (err) {
    logger.error("Internal server error in candidate profile GET route", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST / PATCH: Initialize or update candidate profile
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createCandClient();

    // Authenticate user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    logger.info(`API: Upserting profile for candidate user: ${user.id}`);

    const profile = await candidateService.updateProfile(user.id, body);
    return NextResponse.json({ data: profile });
  } catch (err: unknown) {
    logger.error("API error in profile update POST route", err);
    // Return validation formatting error
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Validation or database update failed", message },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  return POST(request); // Delegate to same upsert logic
}

/**
 * DELETE: Soft delete candidate profile
 */
export async function DELETE() {
  try {
    const supabase = await createCandClient();

    // Authenticate user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    logger.info(`API: Soft deleting candidate profile for user: ${user.id}`);
    const profile = await candidateService.getProfile(user.id);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await candidateService.deleteProfile(profile.id);
    return NextResponse.json({ success: true, message: "Profile soft deleted" });
  } catch (err) {
    logger.error("Internal server error in candidate profile DELETE route", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
