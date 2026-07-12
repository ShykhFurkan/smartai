import { NextRequest, NextResponse } from "next/server";
import { createOrgClient } from "@/utils/supabase/organization";
import { inviteRecruiterSchema } from "@/services/organization-schemas";
import { logger } from "@smarthire/logger";
import crypto from "crypto";

/**
 * GET: List all recruiter invitations for a company.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ error: "companyId parameter is required" }, { status: 400 });
    }

    const supabase = await createOrgClient();

    // Authenticate user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const role = user.user_metadata?.role;

    // RBAC: Verify user belongs to company or platform-admin
    if (role !== "platform-admin") {
      const { data: member, error: memberError } = await supabase
        .from("recruiters")
        .select("id")
        .eq("user_id", user.id)
        .eq("company_id", companyId)
        .is("deleted_at", null)
        .maybeSingle();

      if (memberError || !member) {
        return NextResponse.json({ error: "Access Denied" }, { status: 403 });
      }
    }

    logger.info(`Fetching invitations list for company: ${companyId}`);

    // Query recruiter invitations
    const { data: invitations, error: queryError } = await supabase
      .from("recruiter_invitations")
      .select("*")
      .eq("company_id", companyId);

    if (queryError) {
      logger.error("Query invitations failed", queryError);
      return NextResponse.json({ error: "Failed to fetch invitations list" }, { status: 500 });
    }

    return NextResponse.json({ data: invitations });
  } catch (err) {
    logger.error("Internal server error in invitations GET route", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST: Create/Send an invitation to a recruiter/hiring manager.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createOrgClient();

    // Authenticate user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Parse and validate payload
    const body = await request.json();
    const result = inviteRecruiterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { companyId, email, role } = result.data;
    const userRole = user.user_metadata?.role;

    // RBAC: Check invitation dispatch permissions (must be company Owner, Admin or Platform Admin)
    if (userRole !== "platform-admin") {
      const { data: recruiterRecord, error: rError } = await supabase
        .from("recruiters")
        .select("role")
        .eq("user_id", user.id)
        .eq("company_id", companyId)
        .is("deleted_at", null)
        .maybeSingle();

      if (rError || !recruiterRecord) {
        return NextResponse.json({ error: "Access Denied" }, { status: 403 });
      }

      if (recruiterRecord.role !== "owner" && recruiterRecord.role !== "company-admin") {
        return NextResponse.json({ error: "Elevated permissions required" }, { status: 403 });
      }
    }

    logger.info(`Inviting email: ${email} to company: ${companyId} as role: ${role}`);

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days expiry

    // Save invitation details
    const { data: invitation, error: insertError } = await supabase
      .from("recruiter_invitations")
      .insert({
        company_id: companyId,
        email,
        role,
        token,
        status: "pending",
        invited_by: user.id,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (insertError) {
      logger.error("Insert invitation failed", insertError);
      return NextResponse.json({ error: "Failed to issue invitation token" }, { status: 500 });
    }

    // Note: In production, this token is sent via email inside the Notification Service / trigger email
    return NextResponse.json({ data: invitation }, { status: 201 });
  } catch (err) {
    logger.error("Internal server error in invitations POST route", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
