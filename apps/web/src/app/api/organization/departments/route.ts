import { NextRequest, NextResponse } from "next/server";
import { createOrgClient } from "@/utils/supabase/organization";
import { createDepartmentSchema } from "@/services/organization-schemas";
import { logger } from "@smarthire/logger";

/**
 * GET: Retrieve departments for a specific company.
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

    // RBAC: Verify user is member of company or platform-admin
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

    logger.info(`Fetching departments list for company: ${companyId}`);

    const { data: departments, error: queryError } = await supabase
      .from("departments")
      .select("*")
      .eq("company_id", companyId)
      .is("deleted_at", null);

    if (queryError) {
      logger.error("Query departments failed", queryError);
      return NextResponse.json({ error: "Failed to fetch departments list" }, { status: 500 });
    }

    return NextResponse.json({ data: departments });
  } catch (err) {
    logger.error("Internal server error in departments GET route", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST: Create a new department.
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

    // Parse and validate request payload
    const body = await request.json();
    const result = createDepartmentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { companyId, name } = result.data;
    const userRole = user.user_metadata?.role;

    // RBAC: Verify write permission inside company
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

      if (
        recruiterRecord.role !== "owner" &&
        recruiterRecord.role !== "recruiter" &&
        recruiterRecord.role !== "company-admin"
      ) {
        return NextResponse.json({ error: "Elevated permissions required" }, { status: 403 });
      }
    }

    logger.info(`Creating department: ${name} inside company: ${companyId}`);

    // Insert department details
    const { data: department, error: insertError } = await supabase
      .from("departments")
      .insert({
        company_id: companyId,
        name,
      })
      .select()
      .single();

    if (insertError) {
      logger.error("Insert department failed", insertError);
      // Check for unique index constraint (no duplicate departments in the same company)
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "Department name already exists in this company" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: "Failed to create department" }, { status: 500 });
    }

    return NextResponse.json({ data: department }, { status: 201 });
  } catch (err) {
    logger.error("Internal server error in departments POST route", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
