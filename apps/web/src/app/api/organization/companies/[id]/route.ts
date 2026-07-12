import { NextRequest, NextResponse } from "next/server";
import { createOrgClient } from "@/utils/supabase/organization";
import { updateCompanySchema } from "@/services/organization-schemas";
import { logger } from "@smarthire/logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET: Retrieve details of a single company.
 * Only recruiters belonging to the company (or platform-admins) are authorized.
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id: companyId } = await params;
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

    // RBAC validation: Check if user is platform-admin or a member recruiter
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

    logger.info(`Fetching company details: ${companyId}`);

    const { data: company, error: queryError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .is("deleted_at", null)
      .single();

    if (queryError || !company) {
      logger.error("Failed to fetch company row", queryError);
      return NextResponse.json({ error: "Company profile not found" }, { status: 404 });
    }

    return NextResponse.json({ data: company });
  } catch (err) {
    logger.error("Internal server error in company GET route", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH: Update company branding, details, or subscription parameters.
 * Authorized for Owner, Recruiters, and Platform Admins.
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id: companyId } = await params;
    const supabase = await createOrgClient();

    // Authenticate user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userRole = user.user_metadata?.role;

    // RBAC check: Must be owner or recruiter inside this company, or platform-admin
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

      // Check role constraints (Hiring managers cannot update branding/settings)
      if (
        recruiterRecord.role !== "owner" &&
        recruiterRecord.role !== "recruiter" &&
        recruiterRecord.role !== "company-admin"
      ) {
        return NextResponse.json({ error: "Elevated permissions required" }, { status: 403 });
      }
    }

    // Parse and validate payload
    const body = await request.json();
    const result = updateCompanySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const updateData = result.data;
    logger.info(`Updating company: ${companyId} settings`);

    // Prepare fields mapping
    const payload: Record<string, unknown> = {};
    if (updateData.name !== undefined) payload.name = updateData.name;
    if (updateData.slug !== undefined) payload.slug = updateData.slug;
    if (updateData.domain !== undefined) payload.domain = updateData.domain;
    if (updateData.logoUrl !== undefined) payload.logo_url = updateData.logoUrl;

    // Branding colors mappings (e.g. saving inside a meta settings column or custom schema columns)
    // For standard supabase, we will map them directly to columns or placeholder configs
    if (updateData.primaryColor !== undefined) payload.primary_color = updateData.primaryColor;
    if (updateData.accentColor !== undefined) payload.accent_color = updateData.accentColor;
    if (updateData.subscriptionTier !== undefined)
      payload.subscription_tier = updateData.subscriptionTier;

    payload.updated_at = new Date().toISOString();

    const { data: company, error: updateError } = await supabase
      .from("companies")
      .update(payload)
      .eq("id", companyId)
      .is("deleted_at", null)
      .select()
      .single();

    if (updateError) {
      logger.error("Update company failed", updateError);
      return NextResponse.json({ error: "Failed to update company settings" }, { status: 500 });
    }

    return NextResponse.json({ data: company });
  } catch (err) {
    logger.error("Internal server error in company PATCH route", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE: Soft delete a company profile (sets deleted_at = now()).
 * Authorized only for Company Owners and Platform Admins.
 */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id: companyId } = await params;
    const supabase = await createOrgClient();

    // Authenticate user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userRole = user.user_metadata?.role;

    // RBAC validation: Owner role or Platform Admin required
    if (userRole !== "platform-admin") {
      const { data: recruiterRecord, error: rError } = await supabase
        .from("recruiters")
        .select("role")
        .eq("user_id", user.id)
        .eq("company_id", companyId)
        .is("deleted_at", null)
        .maybeSingle();

      if (rError || !recruiterRecord || recruiterRecord.role !== "owner") {
        return NextResponse.json({ error: "Owner privilege required" }, { status: 403 });
      }
    }

    logger.info(`Soft deleting company: ${companyId}`);

    const now = new Date().toISOString();

    // Soft delete company
    const { error: companyDeleteError } = await supabase
      .from("companies")
      .update({ deleted_at: now, updated_at: now })
      .eq("id", companyId);

    if (companyDeleteError) {
      logger.error("Soft deleting company row failed", companyDeleteError);
      return NextResponse.json({ error: "Failed to delete company profile" }, { status: 500 });
    }

    // Soft delete recruiter relations
    await supabase
      .from("recruiters")
      .update({ deleted_at: now, updated_at: now })
      .eq("company_id", companyId);

    // Soft delete department relations
    await supabase
      .from("departments")
      .update({ deleted_at: now, updated_at: now })
      .eq("company_id", companyId);

    return NextResponse.json({ success: true, message: "Company profile soft deleted" });
  } catch (err) {
    logger.error("Internal server error in company DELETE route", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
