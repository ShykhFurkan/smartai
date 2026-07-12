import { NextRequest, NextResponse } from "next/server";
import { createOrgClient } from "@/utils/supabase/organization";
import { updateDepartmentSchema } from "@/services/organization-schemas";
import { logger } from "@smarthire/logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH: Update details of a department.
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id: departmentId } = await params;
    const supabase = await createOrgClient();

    // Authenticate user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 1. Fetch department details to locate company scope
    const { data: department, error: findError } = await supabase
      .from("departments")
      .select("company_id")
      .eq("id", departmentId)
      .is("deleted_at", null)
      .maybeSingle();

    if (findError || !department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    const companyId = department.company_id;
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

    // Parse and validate payload
    const body = await request.json();
    const result = updateDepartmentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name } = result.data;
    logger.info(`Updating department: ${departmentId} details`);

    const now = new Date().toISOString();

    const { data: updatedDept, error: updateError } = await supabase
      .from("departments")
      .update({
        name,
        updated_at: now,
      })
      .eq("id", departmentId)
      .is("deleted_at", null)
      .select()
      .single();

    if (updateError) {
      logger.error("Update department failed", updateError);
      return NextResponse.json({ error: "Failed to update department" }, { status: 500 });
    }

    return NextResponse.json({ data: updatedDept });
  } catch (err) {
    logger.error("Internal server error in department PATCH route", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE: Soft delete a department (sets deleted_at = now()).
 */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id: departmentId } = await params;
    const supabase = await createOrgClient();

    // Authenticate user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 1. Fetch department details to locate company scope
    const { data: department, error: findError } = await supabase
      .from("departments")
      .select("company_id")
      .eq("id", departmentId)
      .is("deleted_at", null)
      .maybeSingle();

    if (findError || !department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    const companyId = department.company_id;
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

    logger.info(`Soft deleting department: ${departmentId}`);

    const now = new Date().toISOString();

    const { error: deleteError } = await supabase
      .from("departments")
      .update({
        deleted_at: now,
        updated_at: now,
      })
      .eq("id", departmentId);

    if (deleteError) {
      logger.error("Soft deleting department failed", deleteError);
      return NextResponse.json({ error: "Failed to delete department" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Department soft deleted successfully" });
  } catch (err) {
    logger.error("Internal server error in department DELETE route", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
